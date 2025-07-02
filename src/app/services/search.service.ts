import {
  Livestream,
  PaginationRange,
  SearchResults,
  User,
  VOD,
} from '@/interfaces/search.interfaces';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { apiUrl } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private baseUrl = `${apiUrl}/search`;

  constructor(private http: HttpClient) {}

  searchAll(
    query: string,
    ranges?: {
      users?: PaginationRange;
      livestreams?: PaginationRange;
      vods?: PaginationRange;
    }
  ): Observable<SearchResults> {
    const defaultRanges = {
      users: ranges?.users || { start: 0, end: 3 },
      livestreams: ranges?.livestreams || { start: 0, end: 3 },
      vods: ranges?.vods || { start: 0, end: 3 },
    };

    const users$ = this.searchUsers(query, defaultRanges.users);
    const livestreams$ = this.searchLivestreams(
      query,
      defaultRanges.livestreams
    );
    const vods$ = this.searchVODs(query, defaultRanges.vods);

    return forkJoin({
      users: users$,
      livestreams: livestreams$,
      vods: vods$,
    });
  }

  searchUsers(query: string, range: PaginationRange): Observable<User[]> {
    const headers = new HttpHeaders({
      Range: `users=${range.start}-${range.end}`,
    });

    headers.append('Content-Type', 'application/json');

    return this.http
      .get<User[]>(`${this.baseUrl}/users?q=${encodeURIComponent(query)}`, {
        headers,
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching users:', error);
          return of([]);
        })
      );
  }

  searchLivestreams(
    query: string,
    range: PaginationRange
  ): Observable<Livestream[]> {
    const headers = new HttpHeaders({
      Range: `livestreams=${range.start}-${range.end}`,
    });

    headers.append('Content-Type', 'application/json');

    return this.http
      .get<Livestream[]>(
        `${this.baseUrl}/livestreams?q=${encodeURIComponent(query)}`,
        {
          headers,
        }
      )
      .pipe(
        catchError((error) => {
          console.error('Error fetching livestreams:', error);
          return of([]); // Return an empty array on error
        })
      );
  }

  searchVODs(query: string, range: PaginationRange): Observable<VOD[]> {
    const headers = new HttpHeaders({
      Range: `vods=${range.start}-${range.end}`,
    });

    headers.append('Content-Type', 'application/json');

    return this.http
      .get<VOD[]>(`${this.baseUrl}/vods?q=${encodeURIComponent(query)}`, {
        headers,
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching VODs:', error);
          return of([]); // Return an empty array on error
        })
      );
  }
}
