import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AccountServices } from '../services/account-services';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const accountService = inject(AccountServices);
  const user = accountService.currentUser();

  if (user) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  }

  return next(req);
};
