import { inject, Injectable } from '@angular/core';
import { AccountServices } from './account-services';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private accountServices = inject(AccountServices);

  init() {
    return this.accountServices.refreshToken().pipe(
      tap({
        next: (user) => {
          this.accountServices.setCurrentUser(user);
          this.accountServices.startTokenRefreshInterval();
        },
      }),
    );
  }
}
