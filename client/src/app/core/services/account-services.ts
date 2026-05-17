import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ILoginCreds, IRegisterCreds, IUser } from '../../types/user';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LikesService } from './likes-service';
import { PresenceService } from './presence-service';
import { HubConnectionState } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class AccountServices {
  private http = inject(HttpClient);
  private likesService = inject(LikesService);
  private presenceService = inject(PresenceService);
  currentUser = signal<IUser | null>(null);
  private baseUrl = environment.apiUrl;

  register(creds: IRegisterCreds) {
    return this.http
      .post<IUser>(this.baseUrl + 'account/register', creds, { withCredentials: true })
      .pipe(
        tap((user) => {
          this.setCurrentUser(user);
          this.startTokenRefreshInterval();
        }),
      );
  }

  login(creds: ILoginCreds) {
    return this.http
      .post<IUser>(this.baseUrl + 'account/login', creds, { withCredentials: true })
      .pipe(
        tap((user) => {
          if (user) {
            this.setCurrentUser(user);
            this.startTokenRefreshInterval();
          }
        }),
      );
  }

  refreshToken() {
    return this.http.post<IUser>(
      this.baseUrl + 'account/refresh-token',
      {},
      { withCredentials: true },
    );
  }

  startTokenRefreshInterval() {
    setInterval(
      () => {
        this.http
          .post<IUser>(this.baseUrl + 'account/refresh-token', {}, { withCredentials: true })
          .subscribe({
            next: (user) => {
              this.setCurrentUser(user);
            },
            error: () => {
              this.logout();
            },
          });
      },
      5 * 60 * 1000,
    );
  }

  setCurrentUser(user: IUser) {
    user.roles = this.getRolesFromToken(user);
    this.currentUser.set(user);
    this.likesService.getLikesIds();
    if (this.presenceService.hubConnection?.state != HubConnectionState.Connected) {
      this.presenceService.createHubConnection(user);
    }
  }

  logout() {
    this.presenceService.stopConnection();
    localStorage.removeItem('filters');
    this.currentUser.set(null);
    this.likesService.clearLikeIds();
  }

  private getRolesFromToken(user: IUser): string[] {
    const payload = user.token.split('.')[1];
    const decode = atob(payload);
    const jsonPayload = JSON.parse(decode);
    const roles = jsonPayload['role'];
    return Array.isArray(roles) ? roles : [roles];
  }
}
