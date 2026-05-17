import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  const hasToken = Boolean(token && token.trim().length > 0);
  const hasRegisteredUser = Boolean(
    (userId && Number.isFinite(Number(userId))) ||
    (username && username.trim().length > 0)
  );

  if (!hasToken || !hasRegisteredUser) {
    return router.createUrlTree(['/login']);
  }

  return true;
};
