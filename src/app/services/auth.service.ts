import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface ProfileData {
  is_admin?: boolean;
  user_id?: string;
  username: string;
  biography: string | null;
  profile_picture: string;
  stream_key: string;
  followers_count: number;
}

interface Me {
  user_id: string;
  username: string;
  is_admin?: boolean;
}

interface ProfileUpdateRequest {
  username?: string;
  biography?: string;
  stream_key?: boolean;
}

interface ProfileUpdateResponse extends ProfileData {
  access_token?: string;
}

interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://api.danielcortes.dev';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set('username', username)
      .set('password', password);

    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    return this.http
      .post(`${this.apiUrl}/sessions`, body.toString(), { headers })
      .pipe(
        tap((response: any) => {
          if (response && response.access_token) {
            localStorage.setItem('jwt_token', response.access_token);
          }
        })
      );
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('jwt_token') !== null;
  }

  register(username: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set('username', username)
      .set('password', password);

    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    return this.http.post(`${this.apiUrl}/users`, body.toString(), { headers });
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.clear();
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getUsername(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.getMe().subscribe({
        next: (data: Me) => {
          resolve(data.username);
        },
        error: (error) => {
          console.error('Error fetching username:', error);
          resolve('Guest');
        },
      });
    });
  }

  getUserId(): string {
    let userId: string = '';
    this.getMe().subscribe({
      next: (data) => {
        userId = data.user_id;
      },
      error: (error) => {
        console.error('Error fetching user ID:', error);
      },
    });
    return userId;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getMe(): Observable<Me> {
    return this.http.get<Me>(`${this.apiUrl}/users/me`).pipe(
      catchError((error) => {
        console.error('Error fetching user data:', error);
        return throwError(() => error);
      })
    );
  }

  getProfile(): Observable<ProfileData> {
    return this.http.get<ProfileData>(`${this.apiUrl}/profile`).pipe(
      catchError((error) => {
        console.error('Error fetching profile:', error);
        return throwError(() => error);
      })
    );
  }

  updateProfile(
    profileData: ProfileUpdateRequest
  ): Observable<ProfileUpdateResponse> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http
      .patch<ProfileUpdateResponse>(`${this.apiUrl}/profile`, profileData, {
        headers,
      })
      .pipe(
        tap((response: any) => {
          if (response.access_token) {
            localStorage.setItem('jwt_token', response.access_token);
          }
        }),
        catchError((error) => {
          console.error('Error updating profile:', error);
          return throwError(() => error);
        })
      );
  }

  changePassword(passwords: ChangePasswordRequest): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http
      .patch(`${this.apiUrl}/profile/password`, passwords, { headers })
      .pipe(
        catchError((error) => {
          console.error('Change password failed', error);
          return throwError(() => error);
        })
      );
  }
}
