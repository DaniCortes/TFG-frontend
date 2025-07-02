import { Livestream, User } from '@/interfaces/search.interfaces';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonAvatar,
  IonBadge,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { apiUrl } from 'src/environments/environment';

@Component({
  selector: 'app-user-result',
  templateUrl: './user-result.component.html',
  styleUrls: ['./user-result.component.scss'],
  standalone: true,
  imports: [IonItem, IonAvatar, IonLabel, IonBadge],
})
export class UserResultComponent implements OnInit {
  @Input() user!: User;
  @Input() simpleView = false;
  livestream: Livestream = {} as Livestream;

  defaultProfilePicture = 'assets/avatar.svg';

  constructor(private http: HttpClient, private router: Router) {}

  getLiveStream(user: User): Observable<Livestream> {
    return this.http
      .get<Livestream>(`${apiUrl}/streams/live/${user.user_id}`)
      .pipe(
        tap((livestream) => {
          this.livestream = livestream;
        }),
        catchError((error) => {
          console.error('Error fetching livestream data');
          return throwError(() => error);
        })
      );
  }

  ngOnInit() {
    if (this.user.stream_status === 'live') {
      this.getLiveStream(this.user).subscribe({
        next: (livestream) => {
          this.livestream = livestream;
        },
        error: (err) => {
          console.error('Error fetching livestream:', err);
        },
      });
    }
  }

  onUserClick() {
    if (this.user.stream_status === 'live') {
      this.navigateToLivestream();
    }
  }

  navigateToLivestream() {
    if (this.livestream && this.livestream.id) {
      this.router.navigate(['/u/' + this.user.username]);
    }
  }
}
