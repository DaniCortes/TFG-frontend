import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { AuthService } from '@/services/auth.service';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
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
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({
      eye,
      eyeOff,
    });
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group(
      {
        username: [
          '',
          [Validators.required, Validators.pattern('^[a-zA-Z0-9_-]{3,16}$')],
        ],
        password: ['', [Validators.required, Validators.minLength(5)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(5)]],
      },
      {
        validators: [
          this.passwordMatchValidator('password', 'confirmPassword'),
        ],
      }
    );
  }

  passwordMatchValidator(
    password: string,
    confirmPassword: string
  ): ValidatorFn {
    return (abstractControl: AbstractControl) => {
      const control = abstractControl.get(password);
      const matchingControl = abstractControl.get(confirmPassword);
      if (matchingControl!.errors && !matchingControl!.errors['mismatch']) {
        return null;
      }
      if (
        control &&
        matchingControl &&
        control.value !== matchingControl.value
      ) {
        const error = { mismatch: 'Passwords do not match' };
        matchingControl.setErrors(error);
        return error;
      } else if (matchingControl) {
        matchingControl.setErrors(null);
        return null;
      }
      return null;
    };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { username, password } = this.registerForm.value;
      this.isLoading = true;
      this.authService.register(username, password).subscribe({
        next: () => {
          this.router.navigate(['/login']);
          this.showToast('Registration successful! Please log in.', 'success');
        },
        error: (error) => {
          console.error('Registration failed', error);
          this.showToast('Registration failed. Please try again.', 'error');
        },
        complete: () => {
          this.isLoading = false;
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
