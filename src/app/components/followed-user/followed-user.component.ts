import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonAvatar,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ellipse, personOutline, radioOutline } from 'ionicons/icons';
import { FollowedUser } from '../../interfaces/follow.interfaces';
import { TimeService } from '../../services/time.service';

@Component({
  selector: 'app-followed-user',
  templateUrl: './followed-user.component.html',
  styleUrls: ['./followed-user.component.scss'],
  standalone: true,
  imports: [IonChip, IonItem, IonLabel, IonAvatar, IonIcon],
})
export class FollowedUserComponent {
  @Input() user!: FollowedUser;
  @Output() userSelected = new EventEmitter<FollowedUser>();
  defaultProfilePicture = 'assets/avatar.svg';

  constructor(public timeService: TimeService, private router: Router) {
    addIcons({ radioOutline, ellipse, personOutline });
  }

  onUserClick() {
    if (this.user.stream_status === 'live') {
      this.router.navigate(['/u/', this.user.username]);
    }
  }
}
