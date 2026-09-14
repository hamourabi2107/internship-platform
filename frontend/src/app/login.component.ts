import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, ActorRole, DEMO_ACCOUNTS, DemoAccount } from './core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="login-page">
      <section class="login-visual">
        <span class="eyebrow">Plateforme de Gestion des Stages & PFE</span>
        <h1>Gestion Intégrée<br><em>des Stages.</em></h1>
        <p>Un environnement coordonné pour les étudiants, les entreprises partenaires et la direction académique.</p>
        <div class="login-stats">
          <span><b>4</b><small>Espaces acteurs dédiés</small></span>
          <span><b>100%</b><small>Traçabilité académique</small></span>
        </div>
      </section>

      <section class="login-panel">
        <div class="brand-mark">IN<span>•</span>TERN <small class="brand-tag">ESPRIT STAGES</small></div>

        <div class="login-copy">
          <span class="eyebrow">Authentification Démo</span>
          <h2>Connexion aux Espaces</h2>
          <p>Choisissez un espace d'acteur pour démarrer la démonstration.</p>
        </div>

        <form class="login-form" (ngSubmit)="enter()">
          <label class="form-label">
            <span>Rôle / Espace :</span>
            <select class="form-select" [(ngModel)]="selectedActor" name="selectedActor" (change)="onActorChange()">
              @for (acc of accountList; track acc.id) {
                <option [value]="acc.id">{{ acc.icon }} {{ acc.label }}</option>
              }
            </select>
          </label>

          <div class="actor-quick-grid">
            @for (acc of accountList; track acc.id) {
              <button
                type="button"
                class="actor-chip"
                [class.active]="selectedActor === acc.id"
                (click)="selectActor(acc.id)"
              >
                <span class="chip-icon">{{ acc.icon }}</span>
                <span class="chip-text">
                  <b>{{ acc.label }}</b>
                  <small>{{ acc.name }}</small>
                </span>
              </button>
            }
          </div>

          <label class="form-label">
            <span>Identifiant / Email :</span>
            <input
              type="email"
              class="form-input"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="identifiant@esprit.tn"
            />
          </label>

          <label class="form-label">
            <span>Mot de passe :</span>
            <input
              type="password"
              class="form-input"
              [(ngModel)]="password"
              name="password"
              required
              placeholder="••••••••"
            />
          </label>

          <button type="submit" class="primary-action">
            Se connecter à l'{{ currentSelected.label }} <span>↗</span>
          </button>
        </form>

        <small class="demo-note">
          Mode soutenance académique · Les comptes et rôles sont pré-configurés pour la démonstration.
        </small>
      </section>
    </main>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1.1fr .9fr;
      background: #f7f8f5;
    }
    .login-visual {
      padding: 8vh 7vw;
      background: #173c38;
      color: #f6f4ed;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .login-visual:after {
      content: '';
      position: absolute;
      width: 42vw;
      height: 42vw;
      border: 1px solid #5e9382;
      border-radius: 50%;
      right: -16vw;
      bottom: -14vw;
      opacity: .4;
    }
    .login-visual h1 {
      font: 500 clamp(2.8rem, 5vw, 5.5rem)/.95 'DM Serif Display', serif;
      letter-spacing: -.05em;
      margin: 20px 0;
    }
    .login-visual h1 em {
      color: #d8e85b;
      font-style: italic;
    }
    .login-visual p {
      max-width: 440px;
      color: #b9d0c7;
      font-size: 1.05rem;
      line-height: 1.6;
    }
    .eyebrow {
      font-size: .68rem;
      text-transform: uppercase;
      letter-spacing: .18em;
      color: #9bc4b7;
      font-weight: 700;
    }
    .login-stats {
      display: flex;
      gap: 50px;
      margin-top: 55px;
    }
    .login-stats b {
      display: block;
      font: 1.8rem 'DM Serif Display', serif;
      color: #d8e85b;
    }
    .login-stats small {
      color: #9abbb1;
      font-size: .78rem;
    }
    .login-panel {
      padding: 6vh 6vw;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .brand-mark {
      font-weight: 800;
      letter-spacing: .2em;
      color: #173c38;
      font-size: 1.15rem;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-mark span {
      color: #dd6b45;
    }
    .brand-tag {
      font-size: .65rem;
      background: #e4ebe4;
      color: #2b554c;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: .08em;
    }
    .login-copy {
      margin: 30px 0 20px;
    }
    .login-copy h2 {
      font: 400 2.5rem 'DM Serif Display', serif;
      color: #173c38;
      margin: 10px 0 6px;
    }
    .login-copy p {
      color: #73817c;
      font-size: .88rem;
      margin: 0;
    }
    .login-form {
      display: grid;
      gap: 14px;
    }
    .form-label {
      display: grid;
      gap: 6px;
      font-size: .76rem;
      color: #405750;
      font-weight: 700;
    }
    .form-select, .form-input {
      border: 1px solid #d8e0d6;
      border-radius: 6px;
      padding: 12px 14px;
      font: inherit;
      color: #173c38;
      background: #fff;
      outline: 0;
      transition: border-color .2s;
    }
    .form-select:focus, .form-input:focus {
      border-color: #173c38;
    }
    .actor-quick-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 4px;
    }
    .actor-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
      background: #fff;
      border: 1px solid #e1e7df;
      padding: 10px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: .15s;
    }
    .actor-chip:hover {
      border-color: #173c38;
      background: #fcfdfb;
    }
    .actor-chip.active {
      border-color: #173c38;
      background: #eff5ea;
      box-shadow: 0 2px 8px #173c3818;
    }
    .chip-icon {
      font-size: 1.3rem;
    }
    .chip-text b {
      display: block;
      font-size: .74rem;
      color: #173c38;
      line-height: 1.2;
    }
    .chip-text small {
      display: block;
      font-size: .66rem;
      color: #798a83;
      margin-top: 2px;
    }
    .primary-action {
      border: 0;
      background: #173c38;
      color: #fff;
      border-radius: 6px;
      padding: 15px;
      margin-top: 10px;
      font-weight: 700;
      cursor: pointer;
      font-size: .9rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: background .15s;
    }
    .primary-action:hover {
      background: #23554e;
    }
    .primary-action span {
      margin-left: 10px;
    }
    .demo-note {
      text-align: center;
      color: #9aa59f;
      margin-top: 16px;
      font-size: .75rem;
      line-height: 1.4;
    }
    @media (max-width: 900px) {
      .login-page { grid-template-columns: 1fr; }
      .login-visual { padding: 40px 24px; }
      .login-visual h1 { font-size: 3rem; }
      .login-stats { margin-top: 25px; }
      .login-panel { padding: 35px 24px; }
      .actor-quick-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  accountList: DemoAccount[] = [
    DEMO_ACCOUNTS.STUDENT,
    DEMO_ACCOUNTS.COMPANY,
    DEMO_ACCOUNTS.STAGE_DEPT,
    DEMO_ACCOUNTS.PEDAGOGICAL_DEPT
  ];

  selectedActor: ActorRole = 'STUDENT';
  email: string = DEMO_ACCOUNTS.STUDENT.email;
  password: string = 'password123';

  get currentSelected(): DemoAccount {
    return DEMO_ACCOUNTS[this.selectedActor] || DEMO_ACCOUNTS.STUDENT;
  }

  selectActor(actor: ActorRole) {
    this.selectedActor = actor;
    this.onActorChange();
  }

  onActorChange() {
    const acc = DEMO_ACCOUNTS[this.selectedActor];
    if (acc) {
      this.email = acc.email;
      this.password = 'password123';
    }
  }

  enter() {
    this.auth.login(this.selectedActor, this.email);
    const targetUrl = this.auth.homeFor(this.selectedActor);
    this.router.navigateByUrl(targetUrl);
  }
}
