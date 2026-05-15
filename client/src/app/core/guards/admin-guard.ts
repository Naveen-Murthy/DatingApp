import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AccountServices } from '../services/account-services';
import { ToastService } from '../services/toast-service';

export const adminGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountServices);
  const toast = inject(ToastService);

  if (
    accountService.currentUser()?.roles?.includes('Admin') ||
    accountService.currentUser()?.roles?.includes('Moderator')
  ) {
    return true;
  } else {
    toast.error('You are not authorized to access this page.');
    return false;
  }
};
