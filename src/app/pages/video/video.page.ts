import { ChatComponent } from '@/components/chat/chat.component';
import { VideoPlayerComponent } from '@/components/video-player/video-player.component';
import { Stream, User } from '@/interfaces/search.interfaces';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonItem,
  IonLabel,
  IonRow,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-video',
  templateUrl: './video.page.html',
  styleUrls: ['./video.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonItem,
    IonSpinner,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonContent,
    VideoPlayerComponent,
    ChatComponent,
  ],
})
export class VideoPage implements OnInit {
  streamId: string = '';
  username: string = '';
  title: string = '';
  isLive: boolean = false;
  isLoading: boolean = false;
  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.username = params.get('username') || '';
      this.streamId = params.get('id') || '';
    });
    this.loadVideo();
  }

  private loadVideo() {
    this.isLoading = true;
    if (this.streamId === '' && this.username !== '') {
      this.getUserId(this.username).then((user_id) => {
        this.getVideoData(user_id, undefined)
          .then((stream) => {
            this.setVideoData(stream);
            this.isLoading = false;
          })
          .catch(() => {
            this.isLoading = false;
          });
      });
    } else if (this.streamId !== '' && this.username === '') {
      this.getVideoData(undefined, this.streamId)
        .then((stream) => {
          this.setVideoData(stream);
          this.isLoading = false;
        })
        .catch(() => {
          this.isLoading = false;
        });
    }
  }

  private getUserId(username: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http
        .get<User>(`https://api.danielcortes.dev/users/${username}`)
        .subscribe({
          next: (user) => resolve(user.user_id),
          error: () => reject('User not found'),
        });
    });
  }

  private getVideoData(userId?: string, streamId?: string): Promise<Stream> {
    return new Promise((resolve, reject) => {
      const url = userId
        ? `https://api.danielcortes.dev/streams/live/${userId}`
        : `https://api.danielcortes.dev/streams/${streamId}`;
      this.http.get<Stream>(url).subscribe({
        next: (stream) => resolve(stream),
        error: () => reject('Stream not found'),
      });
    });
  }

  private setVideoData(stream: Stream) {
    this.title = stream.title;
    this.isLive = stream.status === 'live';
    this.streamId = stream.id;
  }
}
