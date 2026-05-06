import { inject, Injectable } from '@angular/core';
import { AccountServices } from './account-services';
import { Observable, of } from 'rxjs';
import { LikesService } from './likes-service';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private accountServices = inject(AccountServices);
  private likesService = inject(LikesService);

  init(): Observable<null> {
    const userString = localStorage.getItem('user');
    if (!userString) return of(null);
    const user = JSON.parse(userString);
    this.accountServices.currentUser.set(user);
    this.likesService.getLikesIds();

    return of(null);
  }
}
