import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  chatbubbleOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  sendOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import {
  ChatMessage,
  ChatService,
  ChatState,
} from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    IonCard,
    IonContent,
    FormsModule,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonBadge,
    IonSpinner,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() streamId!: string;
  @Input() height = '400px';

  @ViewChild('messagesContainer', { static: false })
  messagesContainer!: ElementRef;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;

  chatState: ChatState = {
    isConnected: false,
    isRestricted: false,
    messages: [],
  };

  newMessage = '';
  private chatSubscription?: Subscription;
  private shouldScrollToBottom = true;

  constructor(private chatService: ChatService) {
    addIcons({
      sendOutline,
      chatbubbleOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
    });
  }

  ngOnInit() {
    if (this.streamId) {
      this.connectToChat();
    }

    this.chatSubscription = this.chatService.chatState$.subscribe((state) => {
      this.chatState = state;
      this.shouldScrollToBottom = true;
    });
  }

  ngOnDestroy() {
    this.chatSubscription?.unsubscribe();
    this.chatService.disconnect();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  connectToChat() {
    this.chatService.connect(this.streamId);
  }

  sendMessage() {
    if (
      !this.newMessage.trim() ||
      this.chatState.isRestricted ||
      !this.chatState.isConnected
    ) {
      return;
    }

    this.chatService.sendMessage(this.newMessage.trim());
    this.shouldScrollToBottom = true;
    this.newMessage = '';
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom() {
    if (this.messagesContainer?.nativeElement) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        this.messagesContainer.nativeElement.scrollToBottom(300);
      }, 50);
    }
  }

  getMessageTypeClass(message: ChatMessage): string {
    switch (message.event) {
      case 'user_message':
        return 'user-message';
      case 'server_message':
        return 'server-message';
      case 'ban_user':
        return 'ban-message';
      case 'broadcast_message':
        return 'broadcast-message';
      default:
        return 'default-message';
    }
  }

  formatTimestamp(timestamp?: Date): string {
    if (!timestamp) return '';

    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    return timestamp.toLocaleDateString();
  }

  reconnect() {
    if (this.streamId) {
      this.connectToChat();
    }
  }
}
