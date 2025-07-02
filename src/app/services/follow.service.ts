import { FollowedUser } from '@/interfaces/follow.interfaces';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, of, shareReplay, switchMap, timer } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { apiUrl } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FollowService {
  private baseUrl = `${apiUrl}/follows`;
  private pollingInterval = 15000; // 15 seconds in milliseconds
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private followedUsers$ = timer(0, this.pollingInterval).pipe(
    switchMap(() =>
      this.http.get<FollowedUser[]>(`${this.baseUrl}`, {
        headers: this.headers,
      })
    ),
    shareReplay(1)
  );

  constructor(private http: HttpClient) {}

  getFollowedUsers(): Observable<FollowedUser[]> {
    return this.followedUsers$;
  }

  followUser(userId: string): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/${userId}`, { headers: this.headers })
      .pipe(
        catchError((error) => {
          console.error('Error following user:', error);
          return of(null);
        })
      );
  }

  unfollowUser(userId: string): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/${userId}`, { headers: this.headers })
      .pipe(
        catchError((error) => {
          console.error('Error unfollowing user:', error);
          return of(null);
        })
      );
  }

  isFollowing(userId: string): Observable<boolean> {
    return this.getFollowedUsers().pipe(
      map((users) => users.some((user) => user.user_id === userId))
    );
  }
}
