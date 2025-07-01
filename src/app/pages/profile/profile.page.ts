import { AuthService } from '@/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import {
  IonAvatar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSkeletonText,
  IonSpinner,
  IonTextarea,
  IonToggle,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  createOutline,
  eye,
  eyeOff,
  imageOutline,
  keyOutline,
  lockClosedOutline,
  personOutline,
  refreshOutline,
  saveOutline,
  shieldOutline,
} from 'ionicons/icons';

interface ProfileData {
  username: string;
  biography: string | null;
  profile_picture: string;
  stream_key: string;
  is_admin?: boolean;
  user_id?: string;
  followers_count: number;
}

interface ProfileUpdateRequest {
  username?: string;
  biography?: string;
  stream_key?: boolean;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButton,
    IonIcon,
    IonAvatar,
    IonSkeletonText,
    IonChip,
    IonToggle,
    IonSpinner,
  ],
})
export class ProfilePage implements OnInit {
  profileData: ProfileData | null = null;
  profileForm!: FormGroup;
  changePasswordForm!: FormGroup;
  isProfileLoading: boolean = true;
  isLoading: boolean = false;
  isEditing: boolean = false;
  showStreamKey: boolean = false;
  errorMessage: string = '';
  regenerateStreamKey: boolean = false;
  isChangingPassword: boolean = false;
  isLoadingPassword: boolean = false;
  showOldPassword: boolean = false;
  showNewPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({
      shieldOutline,
      saveOutline,
      lockClosedOutline,
      personOutline,
      createOutline,
      keyOutline,
      imageOutline,
      refreshOutline,
      eye,
      eyeOff,
    });
  }

  ngOnInit() {
    this.initForm();
    this.loadProfile();
    this.initChangePasswordForm();
  }

  initForm() {
    this.profileForm = this.formBuilder.group({
      username: [
        '',
        [Validators.required, Validators.pattern('[a-zA-Z0-9_-]{3,16}')],
      ],
      biography: ['', Validators.maxLength(200)],
      regenerateStreamKey: [false],
    });
  }

  initChangePasswordForm() {
    this.changePasswordForm = this.formBuilder.group(
      {
        old_password: ['', [Validators.required, Validators.minLength(5)]],
        new_password: ['', [Validators.required, Validators.minLength(5)]],
      },
      {
        validators: [
          this.passwordMatchValidator('old_password', 'new_password'),
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

  loadProfile() {
    this.isProfileLoading = true;
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.profileData = data;
        this.profileForm.patchValue({
          username: data.username,
          biography: data.biography || '',
          regenerateStreamKey: false,
        });
      },
      error: (error) => {
        console.error('Failed to load profile', error);
        this.errorMessage = 'Failed to load profile data. Please try again.';
        this.showToast(this.errorMessage, 'error');
      },
      complete: () => {
        this.isProfileLoading = false;
      },
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isChangingPassword) {
      this.isChangingPassword = false;
    }
    if (!this.isEditing && this.profileData) {
      this.profileForm.patchValue({
        username: this.profileData.username,
        biography: this.profileData.biography || '',
        regenerateStreamKey: false,
      });
    }
  }

  toggleStreamKeyVisibility() {
    this.showStreamKey = !this.showStreamKey;
  }

  saveProfile() {
    if (this.profileForm.valid) {
      const updatedProfile: ProfileUpdateRequest = {};

      if (this.profileForm.value.username !== this.profileData?.username) {
        if (this.profileForm.value.username.trim()) {
          updatedProfile.username = this.profileForm.value.username;
        }
      }

      if (this.profileForm.value.biography !== this.profileData?.biography) {
        updatedProfile.biography = this.profileForm.value.biography || null;
      }

      if (this.profileForm.value.regenerateStreamKey) {
        updatedProfile.stream_key = true;
      }

      if (Object.keys(updatedProfile).length === 0) {
        this.isEditing = false;
        return;
      }
      this.isLoading = true;
      this.authService.updateProfile(updatedProfile).subscribe({
        next: (data) => {
          this.profileData = data;
          this.isEditing = false;
          if (this.isChangingPassword) {
            this.toggleChangePasswordForm();
          }
          this.showToast('Profile updated successfully!', 'success');

          this.profileForm.patchValue({
            regenerateStreamKey: false,
          });
        },
        error: (error: HttpErrorResponse) => {
          console.error('Failed to update profile', error);
          this.isLoading = false;
          if (error.status === 409) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'Failed to update profile. Please try again.';
          }

          this.showToast(this.errorMessage, 'error');
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }

  toggleChangePasswordForm() {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.changePasswordForm.reset();
    }
  }

  changePassword() {
    if (this.changePasswordForm.valid) {
      const passwords = this.changePasswordForm.value;
      this.isLoadingPassword = true;
      this.authService.changePassword(passwords).subscribe({
        next: () => {
          this.showToast('Password changed successfully!', 'success');
          this.changePasswordForm.reset();
        },
        error: (error: HttpErrorResponse) => {
          this.isLoadingPassword = false;
          console.error('Failed to change password', error);
          this.errorMessage = 'Failed to change password. Please try again.';
          this.showToast(this.errorMessage, 'error');
        },
        complete: () => {
          this.isLoadingPassword = false;
          this.toggleChangePasswordForm();
        },
      });
    }
  }

  getProfileImageUrl() {
    if (this.profileData?.profile_picture) {
      return `assets/avatar.svg`;
    }
    return 'assets/default-avatar.png';
  }

  navigateToAdminPanel() {
    if (this.profileData?.is_admin) {
      this.router.navigate(['/admin']);
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

  goToVideoTest() {
    this.router.navigate(['/videotest']);
  }
}
