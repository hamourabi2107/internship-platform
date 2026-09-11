import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/entities';

export const roleGuard = (allowed: Role[]): CanActivateFn => () => {
  const auth = inject(AuthService); const router = inject(Router); const role = auth.role();
  return role && allowed.includes(role) ? true : router.createUrlTree(['/login']);
};
