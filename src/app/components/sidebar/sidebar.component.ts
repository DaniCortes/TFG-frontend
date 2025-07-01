import { FollowedUserComponent } from '@/components/followed-user/followed-user.component';
import { FollowedUser } from '@/interfaces/follow.interfaces';
import { FollowService } from '@/services/follow.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonAvatar,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSkeletonText,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  peopleOutline,
  personOutline,
  radioOutline,
  refreshOutline,
} from 'ionicons/icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    IonItem,
    IonLabel,
    IonAvatar,
    IonSkeletonText,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonSpinner,
    IonText,
    IonIcon,
    FollowedUserComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, OnDestroy {
  followedUsers: FollowedUser[] = [];
  onlineUsers: FollowedUser[] = [];
  offlineUsers: FollowedUser[] = [];
  followCounts = { total: 0, online: 0, offline: 0 };
  isLoading = true;
  itemCount = [1, 2, 3, 4, 5];

  private destroy$ = new Subject<void>();

  constructor(private followService: FollowService, private router: Router) {
    addIcons({
      refreshOutline,
      peopleOutline,
      radioOutline,
      personOutline,
      closeOutline,
    });
  }

  ngOnInit() {
    this.loadFollowedUsers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFollowedUsers() {
    this.followService
      .getFollowedUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.followedUsers = users;
          this.updateUserLists();
          this.updateFollowCounts();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading followed users:', error);
          this.isLoading = false;
        },
      });
  }

  private updateUserLists() {
    this.onlineUsers = this.followedUsers.filter(
      (user) => user.stream_status === 'live'
    );
    this.offlineUsers = this.followedUsers.filter(
      (user) => user.stream_status === 'offline'
    );
  }

  private updateFollowCounts() {
    this.followCounts = {
      total: this.followedUsers.length,
      online: this.onlineUsers.length,
      offline: this.offlineUsers.length,
    };
  }

  onUserSelected(user: FollowedUser) {
    // Navigate to the user's livestream
    this.router.navigate(['/video', user.user_id]);
  }
}
