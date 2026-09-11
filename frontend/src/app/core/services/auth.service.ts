import { Injectable, signal } from '@angular/core';
import { Role } from '../models/entities';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly key = 'internship-demo-role';
  readonly role = signal<Role | null>(this.readRole());

  login(role: Role) { localStorage.setItem(this.key, role); this.role.set(role); }
  logout() { localStorage.removeItem(this.key); this.role.set(null); }
  isLoggedIn() { return !!this.role(); }
  homeFor(role = this.role()) { return role === 'ADMIN' ? '/admin/dashboard' : role === 'COMPANY' ? '/company/dashboard' : '/student/dashboard'; }
  private readRole(): Role | null { const value = localStorage.getItem(this.key); return value === 'STUDENT' || value === 'COMPANY' || value === 'ADMIN' ? value : null; }
}
