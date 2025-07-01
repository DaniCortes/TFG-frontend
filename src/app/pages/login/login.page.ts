import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';

import { AuthService } from '@/services/auth.service';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonSpinner,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  standalone: true,
  imports: [
    IonIcon,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonSpinner,
  ],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ eye, eyeOff });
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: [
        '',
        [Validators.required, Validators.pattern('^[a-zA-Z0-9_-]{3,16}$')],
      ],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
    this.authService.logout();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.isLoading = true;
      this.authService.login(username, password).subscribe({
        next: () => {
          this.router.navigate(['/home']);
          this.showToast('Login successful!', 'success');
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login failed', error);
          this.showToast(
            'Login failed. Please check your credentials.',
            'error'
          );
          this.loginForm.reset();
          this.loginForm.patchValue({
            username: username,
          });
        },
        complete: () => {
          this.isLoading = false;
          this.loginForm.reset();
        },
      });
    }
  }

  async showToast(message: string, status: 'success' | 'error') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: status === 'success' ? 'success' : 'danger',
    });
    toast.present();
  }
}
