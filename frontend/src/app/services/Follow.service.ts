import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environments';

export interface FollowStatus {
  followers: number;
  following: boolean;
}

export interface FollowingUser {
  id: number;
  name: string;
  foto: string | null;
}

@Injectable({ providedIn: 'root' })
export class FollowService {
  private readonly base = environment.API_URL + 'usuarios';

  constructor(private http: HttpClient) {}

  getStatus(userId: number): Observable<FollowStatus> {
    return this.http
      .get<FollowStatus>(`${this.base}/${userId}/followers`)
      .pipe(catchError(() => of({ followers: 0, following: false })));
  }

  follow(userId: number): Observable<FollowStatus> {
    return this.http
      .post<FollowStatus>(`${this.base}/${userId}/follow`, {})
      .pipe(catchError(() => of({ followers: 0, following: false })));
  }

  unfollow(userId: number): Observable<FollowStatus> {
    return this.http
      .delete<FollowStatus>(`${this.base}/${userId}/follow`)
      .pipe(catchError(() => of({ followers: 0, following: false })));
  }

  getFollowing(userId: number): Observable<FollowingUser[]> {
    return this.http
      .get<FollowingUser[]>(`${this.base}/${userId}/following`)
      .pipe(catchError(() => of([])));
  }
}
