import { AuthService } from '@/services/auth.service';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  standalone: true,
  imports: [IonCard, RouterLink, IonContent, IonButton, IonIcon],
})
export class HomePage {
  username: string = '';
  constructor(private authService: AuthService, private router: Router) {
    addIcons({ logOutOutline, personOutline });
    this.authService.getUsername().then((name) => {
      this.username = name;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
