import { AuthService } from '@/services/auth.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
export interface ChatMessage {
  event: string;
  sender_id?: string;
  sender_username?: string;
  message_id?: string;
  content: string;
  timestamp?: Date;
}

export interface ChatState {
  isConnected: boolean;
  isRestricted: boolean;
  messages: ChatMessage[];
  connectionError?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private ws: WebSocket | null = null;
  private chatStateSubject = new BehaviorSubject<ChatState>({
    isConnected: false,
    isRestricted: false,
    messages: [],
  });

  public chatState$ = this.chatStateSubject.asObservable();
  private currentChatId: string | null = null;
  private isAuthSent = false;

  constructor(private authService: AuthService) {}

  connect(chatId: string): void {
    this.disconnect();

    this.currentChatId = chatId;
    this.isAuthSent = false;

    const wsUrl = `wss://api.danielcortes.dev/chat/${chatId}`;

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.updateChatState({
        connectionError: 'Failed to connect to chat',
      });
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.updateChatState({
      isConnected: false,
      isRestricted: false,
      messages: [],
      connectionError: undefined,
    });

    this.currentChatId = null;
    this.isAuthSent = false;
  }

  sendMessage(content: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    if (this.chatStateSubject.value.isRestricted) {
      console.warn('User is restricted from sending messages');
      return;
    }

    try {
      this.ws.send(content);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  private setupWebSocketListeners(): void {
    if (!this.ws) {
      console.error('WebSocket is not initialized');
      return;
    }

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.updateChatState({ isConnected: true, connectionError: undefined });
      let authToken = this.authService.getToken();
      // Send JWT token as first message
      if (authToken && !this.isAuthSent) {
        this.ws!.send(authToken);
        this.isAuthSent = true;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        console.log('WebSocket message received:', event.data);
        const messageData: ChatMessage = JSON.parse(event.data);
        this.handleIncomingMessage(messageData);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.updateChatState({
        isConnected: false,
        connectionError: event.reason || 'Connection closed',
      });
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.updateChatState({
        connectionError: 'WebSocket connection error',
      });
    };
  }

  private handleIncomingMessage(messageData: ChatMessage): void {
    const currentState = this.chatStateSubject.value;

    // Add timestamp to message
    messageData.timestamp = new Date();

    switch (messageData.event) {
      case 'user_message':
        this.addMessageToChat(messageData);
        break;

      case 'server_message':
        // Check if user is being restricted
        if (
          messageData.content ===
          'You are restricted from sending messages in this chat'
        ) {
          this.updateChatState({ isRestricted: true });
        }
        this.addMessageToChat(messageData);
        break;

      case 'ban_user':
        this.updateChatState({ isRestricted: true });
        this.addMessageToChat(messageData);
        break;

      case 'delete_message':
        this.handleDeleteMessage(messageData.content);
        break;

      case 'broadcast_message':
        this.addMessageToChat(messageData);
        break;

      default:
        console.warn('Unknown message event:', messageData.event);
        this.addMessageToChat(messageData);
    }
  }

  private addMessageToChat(message: ChatMessage): void {
    const currentState = this.chatStateSubject.value;
    const updatedMessages = [...currentState.messages, message];

    this.updateChatState({ messages: updatedMessages });
  }

  private handleDeleteMessage(messageId: string): void {
    const currentState = this.chatStateSubject.value;
    const updatedMessages = currentState.messages.filter(
      (msg) => msg.message_id !== messageId
    );

    this.updateChatState({ messages: updatedMessages });
  }

  private updateChatState(updates: Partial<ChatState>): void {
    const currentState = this.chatStateSubject.value;
    const newState = { ...currentState, ...updates };
    this.chatStateSubject.next(newState);
  }

  getCurrentState(): ChatState {
    return this.chatStateSubject.value;
  }
}
