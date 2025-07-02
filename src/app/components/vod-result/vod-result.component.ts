import { User, VOD } from '@/interfaces/search.interfaces';
import { TimeService } from '@/services/time.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonBadge, IonImg, IonItem, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { playCircle } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { apiUrl } from 'src/environments/environment';

@Component({
  selector: 'app-vod-result',
  templateUrl: './vod-result.component.html',
  styleUrls: ['./vod-result.component.scss'],
  standalone: true,
  imports: [IonImg, IonItem, IonLabel, IonBadge],
})
export class VodResultComponent implements OnInit {
  @Input() vod!: VOD;
  @Input() simpleView = false;
  user: User = {} as User;

  constructor(
    public timeService: TimeService,
    private http: HttpClient,
    private router: Router
  ) {
    addIcons({ playCircle });
  }

  getThumbnailURL(vod: VOD): string {
    return apiUrl + '/streams/' + vod.id + '/thumbnail.webp';
  }

  getUserInfo(vod: VOD): Observable<User> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get<User>(`${apiUrl}/user/${vod.user_id}`, { headers });
  }

  ngOnInit() {
    this.getUserInfo(this.vod).subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => {
        console.error('Error fetching user info:', err);
      },
    });
  }

  onVODClick() {
    if (this.vod && this.vod.id) {
      this.navigateToVOD();
    }
  }

  navigateToVOD() {
    if (this.vod && this.vod.id) {
      this.router.navigate(['/vod/', this.vod.id]);
    }
  }
}
