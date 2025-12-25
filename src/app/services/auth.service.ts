import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_HEADERS, API_URL } from '../app.config';
import { User } from '../model';
import { map, tap } from 'rxjs';

interface SigningResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  signin(username: string, password: string) {
    return this.http
      .post<SigningResponse>(
        API_URL + '/auth/login',
        { username, password },
        { headers: API_HEADERS }
      )
      .pipe(
        tap((res) => {
          sessionStorage.setItem('token', res.access_token);
          this.me().subscribe((user) => {
            sessionStorage.setItem('user', JSON.stringify({ ...res.user, ...user }));
          });
          if (res.user) {
            this.saveCredentials(username, password);
          }
          return res;
        })
      );
  }

  isLoggedIn(): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return false;
    }
    const jwtPayload = token.split('.')[1];
    if (!jwtPayload) {
      return false;
    }
    const payload = JSON.parse(atob(jwtPayload));
    if (!payload) {
      return false;
    }

    return !!payload.sub;
  }

  me() {
    return this.http
      .get<User[]>(API_URL + '/auth/user-profile')
      .pipe(map((res) => (res.length ? res[0] : null)));
  }

  flushSession() {
    sessionStorage.clear();
  }

  saveCredentials(username: string, password: string) {
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
  }

  flushCredentials() {
    localStorage.removeItem('username');
    localStorage.removeItem('password');
  }

  getUser(): User | null {
    if (sessionStorage.getItem('user')) {
      return JSON.parse(sessionStorage.getItem('user') || '{}');
    }
    return null;
  }

  logout() {
    this.flushSession();
    this.flushCredentials();
  }
}
