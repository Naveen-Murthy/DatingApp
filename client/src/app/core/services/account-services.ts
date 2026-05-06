import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { IRegisterCreds, IUser } from '../../types/user';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LikesService } from './likes-service';

@Injectable({
  providedIn: 'root',
})
export class AccountServices {
  private http = inject(HttpClient);
  private likesService = inject(LikesService);
  currentUser = signal<IUser | null>(null);
  private baseUrl = environment.apiUrl;

  register(creds: IRegisterCreds) {
    return this.http.post<IUser>(this.baseUrl + 'account/register', creds).pipe(
      tap((user) => {
        this.setCurrentUser(user);
      }),
    );
  }

  login(creds: any) {
    return this.http.post<IUser>(this.baseUrl + 'account/login', creds).pipe(
      tap((user) => {
        if (user) {
          this.setCurrentUser(user);
        }
      }),
    );
  }

  setCurrentUser(user: IUser) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
    this.likesService.getLikesIds();
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('filters');
    this.currentUser.set(null);
    this.likesService.clearLikeIds();
  }
}
