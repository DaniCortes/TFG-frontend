import { Livestream, User } from '@/interfaces/search.interfaces';
import { TimeService } from '@/services/time.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonBadge, IonImg, IonItem, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { radio } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { apiUrl } from 'src/environments/environment';

@Component({
  selector: 'app-livestream-result',
  templateUrl: './livestream-result.component.html',
  styleUrls: ['./livestream-result.component.scss'],
  standalone: true,
  imports: [IonImg, IonItem, IonLabel, IonBadge],
})
export class LivestreamResultComponent implements OnInit {
  @Input() livestream!: Livestream;
  @Input() simpleView = false;
  user: User = {} as User;

  constructor(
    public timeService: TimeService,
    private http: HttpClient,
    private router: Router
  ) {
    addIcons({ radio });
  }

  getThumbnailURL(livestream: Livestream): string {
    return `${apiUrl}/streams/${livestream.id}/thumbnail.webp`;
  }

  getUserInfo(livestream: Livestream): Observable<User> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get<User>(`${apiUrl}/user/${livestream.user_id}`, {
      headers,
    });
  }

  ngOnInit() {
    this.getUserInfo(this.livestream).subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => {
        console.error('Error fetching user info:', err);
      },
    });
  }

  onLivestreamClick() {
    if (this.livestream && this.livestream.id) {
      this.navigateToLivestream();
    }
  }

  navigateToLivestream() {
    if (this.livestream && this.livestream.id) {
      this.router.navigate(['/u/', this.user.username]);
    }
  }
}
