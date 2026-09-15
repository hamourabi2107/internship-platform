import { Injectable, signal } from '@angular/core';
import { Role } from '../models/entities';

export type ActorRole = 'STUDENT' | 'COMPANY' | 'STAGE_DEPT' | 'PEDAGOGICAL_DEPT';

export interface DemoAccount {
  id: ActorRole;
  baseRole: Role;
  label: string;
  subTitle: string;
  name: string;
  email: string;
  homeUrl: string;
  icon: string;
}

export const DEMO_ACCOUNTS: Record<ActorRole, DemoAccount> = {
  STUDENT: {
    id: 'STUDENT',
    baseRole: 'STUDENT',
    label: 'Espace Étudiant',
    subTitle: 'Élève ingénieur (PFE) · ID #1',
    name: 'Mohamed BenAli',
    email: 'etudiant@esprit.tn',
    homeUrl: '/student/dashboard',
    icon: '👨‍🎓'
  },
  COMPANY: {
    id: 'COMPANY',
    baseRole: 'COMPANY',
    label: 'Espace Entreprise (RH / Encadrant)',
    subTitle: 'Partenaire Entreprise · Google Tunisia',
    name: 'Ahmed Mansour (Google)',
    email: 'entreprise@esprit.tn',
    homeUrl: '/company/dashboard',
    icon: '🏢'
  },
  STAGE_DEPT: {
    id: 'STAGE_DEPT',
    baseRole: 'ADMIN',
    label: 'Espace Chef de département des stages',
    subTitle: 'Direction des stages & conventions',
    name: 'Dr. Karim Mansour (Stages)',
    email: 'stages@esprit.tn',
    homeUrl: '/admin/dashboard',
    icon: '🏛️'
  },
  PEDAGOGICAL_DEPT: {
    id: 'PEDAGOGICAL_DEPT',
    baseRole: 'ADMIN',
    label: 'Espace Chef de département pédagogique',
    subTitle: 'Direction des études, fiches de notes & jurys',
    name: 'Prof. Leila Trabelsi (Pédagogie)',
    email: 'pedagogique@esprit.tn',
    homeUrl: '/admin/reports',
    icon: '👨‍🏫'
  }
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly roleKey = 'internship-demo-role';
  private readonly actorKey = 'internship-demo-actor';

  readonly role = signal<Role | null>(this.readRole());
  readonly actor = signal<ActorRole | null>(this.readActor());

  login(actorId: ActorRole, email?: string) {
    const account = DEMO_ACCOUNTS[actorId] || DEMO_ACCOUNTS.STUDENT;
    localStorage.setItem(this.roleKey, account.baseRole);
    localStorage.setItem(this.actorKey, account.id);
    this.role.set(account.baseRole);
    this.actor.set(account.id);
  }

  logout() {
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.actorKey);
    this.role.set(null);
    this.actor.set(null);
  }

  isLoggedIn(): boolean {
    return !!this.role();
  }

  get currentAccount(): DemoAccount {
    const a = this.actor();
    return (a && DEMO_ACCOUNTS[a]) || DEMO_ACCOUNTS.STUDENT;
  }

  homeFor(actorId: ActorRole = this.actor() || 'STUDENT'): string {
    return DEMO_ACCOUNTS[actorId]?.homeUrl || '/login';
  }

  private readRole(): Role | null {
    const val = localStorage.getItem(this.roleKey);
    return val === 'STUDENT' || val === 'COMPANY' || val === 'ADMIN' ? val : null;
  }

  private readActor(): ActorRole | null {
    const val = localStorage.getItem(this.actorKey) as ActorRole | null;
    return val && DEMO_ACCOUNTS[val]
      ? val
      : this.readRole() === 'COMPANY'
        ? 'COMPANY'
        : this.readRole() === 'ADMIN'
          ? 'STAGE_DEPT'
          : this.readRole() === 'STUDENT'
            ? 'STUDENT'
            : null;
  }
}
