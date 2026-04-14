import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { IRegisterCreds, IUser } from '../../types/user';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountServices {
  private http = inject(HttpClient);
  currentUser = signal<IUser | null>(null);
  private baseUrl = environment.apiUrl;

  register(creds: IRegisterCreds) {
    return this.http.post<IUser>(this.baseUrl + 'account/register', creds).pipe(
      tap((user) => {
        this.setUserLocalStorage(user);
      }),
    );
  }

  login(creds: any) {
    return this.http.post<IUser>(this.baseUrl + 'account/login', creds).pipe(
      tap((user) => {
        if (user) {
          this.setUserLocalStorage(user);
        }
      }),
    );
  }

  setUserLocalStorage(user: IUser) {
    this.currentUser.set(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }
}
