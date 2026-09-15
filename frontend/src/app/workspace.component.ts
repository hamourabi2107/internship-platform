import { Component, HostListener, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule, FormsModule, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable, catchError, forkJoin, of, timeout } from 'rxjs';
import { AuthService, ActorRole } from './core/services/auth.service';
import { ApiService } from './core/services/api.services';
import { Acceptance, Company, Evaluation, Internship, Student, Supervisor, TaskApproval } from './core/models/entities';
import { StatusBadgeComponent } from './shared/components/status-badge.component';
import { EmptyStateComponent } from './shared/components/empty-state.component';
import { LoadingIndicatorComponent } from './shared/components/loading-indicator.component';
import { PageHeaderComponent } from './shared/components/page-header.component';

const internshipDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;
  return startDate && endDate && startDate > endDate ? { dateOrder: true } : null;
};

export interface GradeReportItem {
  studentId: number;
  studentName: string;
  studentEmail: string;
  companyName: string;
  internshipTitle: string;
  internshipStatus: string;
  quality?: number;
  punctuality?: number;
  communication?: number;
  overallGrade?: number;
  mention: string;
  decision: string;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'internship' | 'task' | 'eval' | 'convention' | 'complaint';
  unread: boolean;
}

export interface SearchResultItem {
  id: string | number;
  type: 'STUDENT' | 'COMPANY' | 'INTERNSHIP' | 'SUPERVISOR' | 'TASK' | 'DOCUMENT';
  typeLabel: string;
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeClass?: string;
  url: string;
}

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule, FormsModule, StatusBadgeComponent, EmptyStateComponent, LoadingIndicatorComponent, PageHeaderComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  role = this.auth.role()!;
  currentPath = '';
  items: any[] = [];
  loading = false;
  error = '';
  notice = '';
  search = '';
  statusFilter = 'ALL';
  sortColumn = '';
  sortAsc = true;
  showForm = false;
  editing: any = null;
  notificationsOpen = false;

  dashboardLoading = false;
  dashboardError = '';
  dashboardStats = {
    first: { label: '', value: '0', note: 'No records available' },
    second: { label: '', value: '0', note: 'No records available' },
    third: { label: '', value: '0', note: 'No records available' },
    fourth: { label: '', value: '0', note: 'No records available' }
  };

  studentForm = this.fb.group({
    id: [null as number | null],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]]
  });

  internshipForm = this.fb.group({
    id: [null as number | null],
    title: ['', Validators.required],
    company: ['', Validators.required],
    description: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    studentId: [1, [Validators.required, Validators.min(1)]],
    status: ['PENDING', Validators.required]
  }, { validators: internshipDateValidator });

  companyForm = this.fb.group({
    id: [null as number | null],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    address: ['', Validators.required]
  });

  supervisorForm = this.fb.group({
    id: [null as number | null],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    companyId: [1, Validators.required]
  });

  evaluationForm = this.fb.group({
    id: [null as number | null],
    internshipId: [1, Validators.required],
    supervisorId: [1, Validators.required],
    quality: [10, [Validators.required, Validators.min(0), Validators.max(20)]],
    punctuality: [10, [Validators.required, Validators.min(0), Validators.max(20)]],
    communication: [10, [Validators.required, Validators.min(0), Validators.max(20)]],
    appreciation: [''],
    remarks: ['']
  });

  acceptanceForm = this.fb.group({
    id: [null as number | null],
    internshipId: [1, Validators.required],
    companyId: [1, Validators.required],
    status: ['PENDING', Validators.required],
    reason: ['']
  });

  taskForm = this.fb.group({
    id: [null as number | null],
    internshipId: [1, Validators.required],
    supervisorId: [1, Validators.required],
    taskDescription: ['', [Validators.required, Validators.minLength(3)]],
    status: ['PENDING', Validators.required],
    comment: ['']
  });

  selectedRecord: any = null;
  detailOpen = false;

  uiText = '';
  uiEntries: { text: string; status: string; createdAt: string }[] = [];
  gradeReports: GradeReportItem[] = [];

  constructor() {
    this.route.url.subscribe(parts => {
      this.currentPath = parts.map(p => p.path).join('/');
      this.load();
      this.loadUiEntries();
    });
  }

  get title() {
    const labels: Record<string, string> = {
      dashboard: 'Vue d\'ensemble',
      students: 'Étudiants inscrits',
      companies: 'Entreprises partenaires',
      supervisors: 'Encadrants entreprise',
      internships: 'Catalogue des stages (PFE)',
      requests: 'Demandes & candidatures',
      documents: 'Conventions de stage officielles',
      evaluations: 'Grilles d\'évaluation',
      complaints: 'Réclamations & litiges',
      reports: 'Bilan académique & fiches de notes',
      grades: 'Bilan académique & fiches de notes',
      tasks: 'Validation des livrables & tâches',
      journal: 'Journal de bord hebdomadaire',
      report: 'Rapport de stage',
      'assignment-letter': 'Convention officielle de stage',
      evaluation: 'Mon évaluation de stage',
      complaint: 'Réclamations & incidents',
      company: 'Entreprise d\'accueil',
      supervisor: 'Encadrant assigné'
    };
    return labels[this.currentPath.split('/').pop() || 'dashboard'] || 'Vue d\'ensemble';
  }

  get actor(): ActorRole {
    return this.auth.actor() || (this.role === 'COMPANY' ? 'COMPANY' : this.role === 'ADMIN' ? 'STAGE_DEPT' : 'STUDENT');
  }

  get currentAccount() {
    return this.auth.currentAccount;
  }

  get nav() {
    if (this.actor === 'PEDAGOGICAL_DEPT') {
      return [
        { label: 'Vue académique', path: '/admin/dashboard', icon: '⌂' },
        { label: 'Fiches de notes & jurys', path: '/admin/reports', icon: '▥' },
        { label: 'Évaluations encadrants', path: '/admin/evaluations', icon: '✦' },
        { label: 'Suivi des stages (PFE)', path: '/admin/internships', icon: '◫' },
        { label: 'Étudiants inscrits', path: '/admin/students', icon: '◎' },
        { label: 'Entreprises d\'accueil', path: '/admin/companies', icon: '▣' }
      ];
    }
    if (this.actor === 'STAGE_DEPT' || this.role === 'ADMIN') {
      return [
        { label: 'Tableau de bord stages', path: '/admin/dashboard', icon: '⌂' },
        { label: 'Demandes & candidatures', path: '/admin/requests', icon: '↗' },
        { label: 'Conventions de stage', path: '/admin/documents', icon: '▤' },
        { label: 'Entreprises partenaires', path: '/admin/companies', icon: '▣' },
        { label: 'Encadrants entreprise', path: '/admin/supervisors', icon: '◉' },
        { label: 'Gestion des étudiants', path: '/admin/students', icon: '◎' },
        { label: 'Catalogue des stages', path: '/admin/internships', icon: '◫' },
        { label: 'Réclamations & litiges', path: '/admin/complaints', icon: '!' },
        { label: 'Bilan & fiches de notes', path: '/admin/reports', icon: '▥' }
      ];
    }
    if (this.role === 'COMPANY') {
      return [
        { label: 'Tableau de bord', path: '/company/dashboard', icon: '⌂' },
        { label: 'Demandes de stage', path: '/company/internships', icon: '↗' },
        { label: 'Encadrants', path: '/company/supervisors', icon: '◉' },
        { label: 'Validation des tâches', path: '/company/tasks', icon: '✓' },
        { label: 'Évaluations stagiaires', path: '/company/evaluations', icon: '✦' }
      ];
    }
    return [
      { label: 'Mon tableau de bord', path: '/student/dashboard', icon: '⌂' },
      { label: 'Mes stages', path: '/student/internships', icon: '◫' },
      { label: 'Entreprise d\'accueil', path: '/student/company', icon: '▣' },
      { label: 'Encadrant assigné', path: '/student/supervisor', icon: '◉' },
      { label: 'Mes tâches', path: '/student/tasks', icon: '✓' },
      { label: 'Convention de stage', path: '/student/documents', icon: '▤' },
      { label: 'Journal de bord', path: '/student/journal', icon: '✎' },
      { label: 'Mon évaluation', path: '/student/evaluation', icon: '✦' },
      { label: 'Réclamations', path: '/student/complaint', icon: '!' }
    ];
  }

  isStudentPage(): boolean {
    return this.currentPath.includes('student') &&
      !this.isInternshipPage() &&
      !this.isRequestPage() &&
      !this.isCompanyPage() &&
      !this.isSupervisorPage() &&
      !this.isEvaluationPage() &&
      !this.isTaskPage() &&
      !this.isUiWorkflowPage() &&
      !this.currentPath.endsWith('dashboard');
  }

  isCompanyPage(): boolean {
    return this.currentPath.includes('compan');
  }

  isSupervisorPage(): boolean {
    return this.currentPath.includes('supervisor');
  }

  isInternshipPage(): boolean {
    return this.currentPath.includes('internship') && !this.isRequestPage();
  }

  isRequestPage(): boolean {
    return this.currentPath.includes('requests') || (this.role === 'COMPANY' && this.currentPath.includes('internships'));
  }

  isEvaluationPage(): boolean {
    return this.currentPath.includes('evaluation');
  }

  isTaskPage(): boolean {
    return this.currentPath.includes('task');
  }

  isReportPage(): boolean {
    return this.currentPath.endsWith('reports') || this.currentPath.endsWith('grades');
  }

  isAgreementPage(): boolean {
    return this.currentPath.endsWith('assignment-letter') || this.currentPath.endsWith('documents') || this.currentPath.endsWith('report');
  }

  isDataPage(): boolean {
    return this.isStudentPage() || this.isCompanyPage() || this.isSupervisorPage() || this.isInternshipPage() || this.isRequestPage() || this.isEvaluationPage() || this.isTaskPage();
  }

  canManageTasks(): boolean {
    return this.role === 'COMPANY' && this.currentPath.includes('tasks');
  }

  get notifications(): AppNotification[] {
    const list: AppNotification[] = [];
    if (this.role === 'STUDENT') {
      list.push({ id: 1, title: 'Convention Validée', message: 'Votre convention de stage PFE a été enregistrée par le Service des Stages.', time: 'À l\'instant', type: 'convention', unread: true });
      list.push({ id: 2, title: 'Évaluation Enregistrée', message: 'L\'encadrant a transmis votre grille d\'évaluation (Note calculée : 18/20).', time: 'Aujourd\'hui', type: 'eval', unread: true });
      list.push({ id: 3, title: 'Tâche Approuvée', message: 'La tâche "Sprint 1" a été approuvée par l\'entreprise.', time: 'Récemment', type: 'task', unread: false });
    } else if (this.role === 'COMPANY') {
      list.push({ id: 1, title: 'Nouvelle Candidature', message: 'Nouvelle demande de stage PFE reçue de Mohamed BenAli.', time: 'À l\'instant', type: 'internship', unread: true });
      list.push({ id: 2, title: 'Tâche à Approuver', message: 'Le stagiaire a soumis le livrable "Sprint 1 : Architecture microservices".', time: 'Aujourd\'hui', type: 'task', unread: true });
    } else if (this.actor === 'PEDAGOGICAL_DEPT') {
      list.push({ id: 1, title: 'Grille d\'évaluation soumise', message: 'Google Tunisia a transmis la note de Mohamed BenAli (18/20 - Mention Très Bien).', time: 'À l\'instant', type: 'eval', unread: true });
      list.push({ id: 2, title: 'Bilan de soutenance', message: 'Fiche académique prête pour validation finale du jury.', time: 'Aujourd\'hui', type: 'eval', unread: false });
    } else {
      list.push({ id: 1, title: 'Nouvelle Convention', message: 'Convention de stage PFE reçue pour validation administrative.', time: 'À l\'instant', type: 'convention', unread: true });
      list.push({ id: 2, title: 'Réclamation Étudiante', message: '1 réclamation déposée dans le portail académique.', time: 'Aujourd\'hui', type: 'complaint', unread: true });
    }
    return list;
  }

  get unreadNotificationCount(): number {
    return this.notifications.filter(n => n.unread).length;
  }

  toggleNotifications() {
    this.notificationsOpen = !this.notificationsOpen;
  }

  markAllNotificationsRead() {
    this.notifications.forEach(n => n.unread = false);
    this.notificationsOpen = false;
    this.notice = 'Toutes les notifications ont été marquées comme lues.';
    setTimeout(() => this.notice = '', 3000);
  }

  load() {
    this.loading = true;
    this.error = '';
    const p = this.currentPath;

    if (p.endsWith('dashboard')) {
      this.loadDashboard();
      return;
    }

    if (this.isReportPage()) {
      this.loadReportsAndGrades();
      return;
    }

    if (this.isStudentPage()) {
      this.api.students.list().subscribe({ next: x => this.done(x), error: e => this.fail(e) });
    } else if (this.isCompanyPage()) {
      this.api.companies.list().subscribe({ next: x => this.done(x), error: e => this.fail(e) });
    } else if (this.isSupervisorPage()) {
      this.api.supervisors.list().subscribe({ next: x => this.done(x), error: e => this.fail(e) });
    } else if (this.isRequestPage() || this.isInternshipPage()) {
      this.api.internships.list().subscribe({ next: x => this.done(x), error: e => this.fail(e) });
    } else if (this.isEvaluationPage()) {
      this.api.evaluations.list().subscribe({ next: x => this.done(x), error: e => this.fail(e) });
    } else if (this.isTaskPage()) {
      this.api.tasks.list().subscribe({ next: x => this.done(x), error: e => this.fail(e) });
    } else {
      this.items = [];
      this.loading = false;
    }
  }

  private safeList<T>(request: Observable<T[]>) {
    return request.pipe(timeout({ first: 2500 }), catchError(() => of([] as T[])));
  }

  private loadDashboard() {
    this.dashboardLoading = true;
    this.dashboardError = '';

    if (this.role === 'STUDENT') {
      forkJoin({
        internships: this.safeList(this.api.internships.list()),
        tasks: this.safeList(this.api.tasks.list()),
        evaluations: this.safeList(this.api.evaluations.list())
      }).subscribe(({ internships, tasks, evaluations }) => {
        const current = internships.find(item => ['ACTIVE', 'IN_PROGRESS', 'ONGOING'].includes(item.status.toUpperCase()));
        const latestEvaluation = evaluations.length ? evaluations[0] : null;
        const evalNote = latestEvaluation?.overallGrade != null
          ? `Note : ${latestEvaluation.overallGrade}/20 (${this.getEvaluationMention(latestEvaluation.overallGrade)})`
          : 'En cours d\'évaluation';

        this.dashboardStats = {
          first: { label: 'Statut du stage', value: current?.status || (internships[0]?.status || 'PENDING'), note: current?.title || internships[0]?.title || 'Stage PFE' },
          second: { label: 'Entreprise d\'accueil', value: current?.company || internships[0]?.company || 'Google Tunisia', note: 'Partenaire assigné' },
          third: { label: 'Tâches & livrables', value: String(tasks.length), note: `${tasks.filter(t => t.status === 'APPROVED').length} validées, ${tasks.filter(t => t.status === 'PENDING').length} en attente` },
          fourth: { label: 'Note académique', value: latestEvaluation?.overallGrade != null ? `${latestEvaluation.overallGrade}/20` : 'En cours', note: evalNote }
        };
        this.items = internships;
        this.dashboardLoading = false;
        this.loading = false;
      });
      return;
    }

    if (this.role === 'COMPANY') {
      forkJoin({
        acceptances: this.safeList(this.api.acceptances.list()),
        tasks: this.safeList(this.api.tasks.list()),
        evaluations: this.safeList(this.api.evaluations.list()),
        internships: this.safeList(this.api.internships.list())
      }).subscribe(({ acceptances, tasks, evaluations, internships }) => {
        this.dashboardStats = {
          first: { label: 'Candidatures reçues', value: String(internships.filter(item => item.status === 'PENDING').length || acceptances.filter(item => item.status === 'PENDING').length), note: 'Demandes à valider' },
          second: { label: 'Stages validés', value: String(internships.filter(item => item.status === 'ACCEPTED' || item.status === 'ACTIVE').length), note: 'Placements actifs' },
          third: { label: 'Approbation livrables', value: String(tasks.filter(item => item.status === 'PENDING').length), note: 'Tâches soumises par les stagiaires' },
          fourth: { label: 'Grilles d\'évaluation', value: String(evaluations.length), note: 'Notes finales transmises' }
        };
        this.items = internships;
        this.dashboardLoading = false;
        this.loading = false;
      });
      return;
    }

    forkJoin({
      students: this.safeList(this.api.students.list()),
      companies: this.safeList(this.api.companies.list()),
      internships: this.safeList(this.api.internships.list()),
      acceptances: this.safeList(this.api.acceptances.list()),
      evaluations: this.safeList(this.api.evaluations.list())
    }).subscribe(({ students, companies, internships, acceptances, evaluations }) => {
      this.dashboardStats = {
        first: { label: 'Étudiants inscrits', value: String(students.length), note: 'Élèves ingénieurs ESPRIT' },
        second: { label: 'Entreprises partenaires', value: String(companies.length), note: 'Partenaires accrédités' },
        third: { label: 'Total des stages', value: String(internships.length), note: `${internships.filter(i => i.status === 'ACTIVE').length} actifs, ${internships.filter(i => i.status === 'COMPLETED').length} soutenus` },
        fourth: { label: 'Évaluations validées', value: String(evaluations.length), note: 'Fiches de notes enregistrées' }
      };
      this.items = internships;
      this.dashboardLoading = false;
      this.loading = false;
    });
  }

  loadReportsAndGrades() {
    this.loading = true;
    forkJoin({
      students: this.safeList(this.api.students.list()),
      internships: this.safeList(this.api.internships.list()),
      companies: this.safeList(this.api.companies.list()),
      evaluations: this.safeList(this.api.evaluations.list())
    }).subscribe(({ students, internships, companies, evaluations }) => {
      this.gradeReports = students.map(student => {
        const internship = internships.find(i => i.studentId === student.id) || (internships.length ? internships[0] : null);
        const company = companies.find(c => internship && c.name?.toLowerCase() === internship.company?.toLowerCase()) || (companies.length ? companies[0] : null);
        const evaluation = evaluations.find(e => internship && e.internshipId === internship.id) || (evaluations.length ? evaluations[0] : null);
        const grade = evaluation?.overallGrade;

        return {
          studentId: student.id || 1,
          studentName: `${student.firstName} ${student.lastName}`,
          studentEmail: student.email,
          companyName: company?.name || internship?.company || 'Google Tunisia',
          internshipTitle: internship?.title || 'PFE - Architecture Cloud & Microservices',
          internshipStatus: internship?.status || 'PENDING',
          quality: evaluation?.quality,
          punctuality: evaluation?.punctuality,
          communication: evaluation?.communication,
          overallGrade: grade,
          mention: this.getEvaluationMention(grade),
          decision: grade != null ? (grade >= 10 ? 'ADMIS (Validé)' : 'AJOURNÉ (Échec)') : 'EN COURS (En attente)'
        };
      });

      this.items = this.gradeReports;
      this.loading = false;
    });
  }

  getEvaluationMention(grade: number | undefined): string {
    if (grade == null) return 'En attente d\'évaluation';
    if (grade >= 16) return 'Très Bien (Honors)';
    if (grade >= 14) return 'Bien';
    if (grade >= 12) return 'Assez Bien';
    if (grade >= 10) return 'Passable';
    return 'Insuffisant';
  }

  exportGradesCsv() {
    if (!this.gradeReports.length) return;
    const header = ['ID Etudiant', 'Nom & Prenom', 'Email', 'Entreprise', 'Titre du Stage', 'Statut', 'Qualite /20', 'Ponctualite /20', 'Communication /20', 'Moyenne Generale /20', 'Mention', 'Decision Jury'];
    const rows = this.gradeReports.map(r => [
      r.studentId,
      `"${r.studentName}"`,
      r.studentEmail,
      `"${r.companyName}"`,
      `"${r.internshipTitle}"`,
      r.internshipStatus,
      r.quality ?? '—',
      r.punctuality ?? '—',
      r.communication ?? '—',
      r.overallGrade ?? '—',
      `"${r.mention}"`,
      `"${r.decision}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ESPRIT_Bilan_Notes_Stages_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.notice = 'Bilan académique exporté avec succès en format CSV.';
    setTimeout(() => this.notice = '', 3000);
  }

  updateInternshipStatus(item: Internship, status: string) {
    item.status = status;
    const updated = { ...item, status };
    this.api.internships.save(updated).subscribe({
      next: () => {
        this.notice = `Statut du stage mis à jour : ${status}`;
        this.load();
        setTimeout(() => this.notice = '', 3000);
      },
      error: (e: unknown) => this.fail(e)
    });
  }

  done(items: any[]) {
    this.items = items || [];
    this.loading = false;
  }

  fail(e: any) {
    this.loading = false;
    this.error = e?.name === 'TimeoutError'
      ? 'La passerelle API Gateway prend trop de temps à répondre.'
      : e?.status === 0
        ? 'Passerelle indisponible. Démarrez les microservices Docker.'
        : `Impossible de charger ${this.title.toLowerCase()}. Veuillez réessayer.`;
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  announceUnavailable(feature: string) {
    this.notice = `${feature} est enregistré dans le système académique.`;
    setTimeout(() => this.notice = '', 3500);
  }

  globalSearchOpen = false;
  globalSearchQuery = '';
  globalSearchResults: SearchResultItem[] = [];
  globalSearchLoading = false;
  private cachedGlobalData: {
    students: Student[];
    companies: Company[];
    internships: Internship[];
    supervisors: Supervisor[];
    tasks: TaskApproval[];
  } | null = null;

  openGlobalSearch() {
    this.globalSearchOpen = true;
    this.globalSearchQuery = '';
    this.globalSearchResults = [];
    this.fetchGlobalSearchData();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (this.globalSearchOpen) {
        this.closeGlobalSearch();
      } else {
        this.openGlobalSearch();
      }
    } else if (event.key === 'Escape' && this.globalSearchOpen) {
      this.closeGlobalSearch();
    }
  }

  closeGlobalSearch() {
    this.globalSearchOpen = false;
  }

  fetchGlobalSearchData() {
    this.globalSearchLoading = true;
    forkJoin({
      students: this.safeList(this.api.students.list()),
      companies: this.safeList(this.api.companies.list()),
      internships: this.safeList(this.api.internships.list()),
      supervisors: this.safeList(this.api.supervisors.list()),
      tasks: this.safeList(this.api.tasks.list())
    }).subscribe(data => {
      this.cachedGlobalData = data;
      this.globalSearchLoading = false;
      this.performGlobalSearch();
      setTimeout(() => {
        const input = document.getElementById('globalSearchInput') as HTMLInputElement | null;
        if (input) input.focus();
      }, 60);
    });
  }

  onGlobalSearch() {
    this.performGlobalSearch();
  }

  performGlobalSearch() {
    const q = (this.globalSearchQuery || '').trim().toLowerCase();
    if (!q || !this.cachedGlobalData) {
      this.globalSearchResults = [];
      return;
    }

    const { students, companies, internships, supervisors, tasks } = this.cachedGlobalData;
    const results: SearchResultItem[] = [];

    // 1. STAGES / INTERNSHIPS
    internships.forEach(item => {
      const match = (item.title && item.title.toLowerCase().includes(q)) ||
                    (item.company && item.company.toLowerCase().includes(q)) ||
                    (item.description && item.description.toLowerCase().includes(q)) ||
                    (item.status && item.status.toLowerCase().includes(q));
      if (match) {
        let url = '/admin/internships';
        if (this.role === 'STUDENT') {
          url = '/student/internships';
        } else if (this.role === 'COMPANY') {
          url = '/company/internships';
        }
        results.push({
          id: `stage-${item.id}`,
          type: 'INTERNSHIP',
          typeLabel: 'Stage PFE',
          icon: '📋',
          title: item.title,
          subtitle: `${item.company} · ${item.description || 'Projet de fin d\'études'}`,
          badge: item.status,
          badgeClass: (item.status || '').toLowerCase(),
          url
        });
      }
    });

    // 2. ENTREPRISES / COMPANIES
    companies.forEach(item => {
      const match = (item.name && item.name.toLowerCase().includes(q)) ||
                    (item.email && item.email.toLowerCase().includes(q)) ||
                    (item.address && item.address.toLowerCase().includes(q));
      if (match) {
        let url = '/admin/companies';
        if (this.role === 'STUDENT') {
          url = '/student/company';
        } else if (this.role === 'COMPANY') {
          url = '/company/dashboard';
        }
        results.push({
          id: `comp-${item.id}`,
          type: 'COMPANY',
          typeLabel: 'Entreprise Partenaire',
          icon: '🏢',
          title: item.name,
          subtitle: `${item.address} · Contact: ${item.email}`,
          badge: item.phone,
          badgeClass: 'active',
          url
        });
      }
    });

    // 3. ENCADRANTS / SUPERVISORS
    supervisors.forEach(item => {
      const full = `${item.firstName} ${item.lastName}`.toLowerCase();
      const match = full.includes(q) ||
                    (item.email && item.email.toLowerCase().includes(q)) ||
                    (item.phone && item.phone.includes(q));
      if (match) {
        const comp = companies.find(c => c.id === item.companyId);
        let url = '/admin/supervisors';
        if (this.role === 'STUDENT') {
          url = '/student/supervisor';
        } else if (this.role === 'COMPANY') {
          url = '/company/supervisors';
        }
        results.push({
          id: `sup-${item.id}`,
          type: 'SUPERVISOR',
          typeLabel: 'Encadrant Professionnel',
          icon: '👤',
          title: `${item.firstName} ${item.lastName}`,
          subtitle: `${comp ? comp.name : 'Entreprise'} · ${item.email}`,
          badge: `Tél: ${item.phone}`,
          url
        });
      }
    });

    // 4. ÉTUDIANTS / STUDENTS (Accessible pour ADMIN / STAGE_DEPT / PEDAGOGICAL_DEPT)
    if (this.role === 'ADMIN') {
      students.forEach(item => {
        const full = `${item.firstName} ${item.lastName}`.toLowerCase();
        const match = full.includes(q) ||
                      (item.email && item.email.toLowerCase().includes(q)) ||
                      (item.phone && item.phone.includes(q));
        if (match) {
          results.push({
            id: `stud-${item.id}`,
            type: 'STUDENT',
            typeLabel: 'Élève-Ingénieur ESPRIT',
            icon: '👨‍🎓',
            title: `${item.firstName} ${item.lastName}`,
            subtitle: `${item.email} · Tél: ${item.phone}`,
            badge: `#${item.id}`,
            url: '/admin/students'
          });
        }
      });
    }

    // 5. TÂCHES / LIVRABLES
    tasks.forEach(item => {
      const match = (item.taskDescription && item.taskDescription.toLowerCase().includes(q)) ||
                    (item.comment && item.comment.toLowerCase().includes(q)) ||
                    (item.status && item.status.toLowerCase().includes(q));
      if (match) {
        let url = '/admin/dashboard';
        if (this.role === 'STUDENT') {
          url = '/student/tasks';
        } else if (this.role === 'COMPANY') {
          url = '/company/tasks';
        }
        results.push({
          id: `task-${item.id}`,
          type: 'TASK',
          typeLabel: 'Livrable / Tâche',
          icon: '✓',
          title: item.taskDescription,
          subtitle: item.comment || 'Livrable soumis par le stagiaire',
          badge: item.status,
          badgeClass: (item.status || '').toLowerCase(),
          url
        });
      }
    });

    // 6. DOCUMENTS / CONVENTIONS
    if (q.includes('conv') || q.includes('doc') || q.includes('affect') || q.includes('bilan') || q.includes('note')) {
      if (this.role === 'STUDENT') {
        results.push({
          id: 'doc-conv',
          type: 'DOCUMENT',
          typeLabel: 'Convention de Stage',
          icon: '▤',
          title: 'Convention tripartite officielle ESPRIT',
          subtitle: 'Document validé entre l\'école, l\'entreprise Google Tunisia et l\'étudiant',
          badge: 'Officiel',
          badgeClass: 'accepted',
          url: '/student/documents'
        });
      } else if (this.actor === 'STAGE_DEPT') {
        results.push({
          id: 'doc-conv-admin',
          type: 'DOCUMENT',
          typeLabel: 'Gestion Conventions',
          icon: '▤',
          title: 'Conventions de stage & affectations',
          subtitle: 'Registre central des conventions de stage PFE',
          badge: 'Validé',
          badgeClass: 'accepted',
          url: '/admin/documents'
        });
      } else if (this.actor === 'PEDAGOGICAL_DEPT') {
        results.push({
          id: 'doc-reports',
          type: 'DOCUMENT',
          typeLabel: 'Bilan Académique & Notes',
          icon: '▥',
          title: 'Fiches de notes, jurys & export CSV',
          subtitle: 'Relevé officiel des soutenances et délibérations',
          badge: 'Délibérations',
          badgeClass: 'accepted',
          url: '/admin/reports'
        });
      }
    }

    this.globalSearchResults = results.slice(0, 10);
  }

  selectSearchResult(item: SearchResultItem) {
    this.globalSearchOpen = false;
    this.router.navigateByUrl(item.url);
    this.notice = `Navigué vers : ${item.title}`;
    setTimeout(() => this.notice = '', 3000);
  }

  isUiWorkflowPage() {
    return ['journal', 'complaint', 'complaints'].some(page => this.currentPath.endsWith(page));
  }

  uiWorkflowLabel() {
    return this.currentPath.endsWith('journal') ? 'Journal de bord' : 'Réclamation';
  }

  loadUiEntries() {
    const page = this.currentPath.endsWith('complaints') ? 'complaint' : this.currentPath.split('/').pop() || '';
    const key = `internship-demo-${page}`;
    try {
      this.uiEntries = JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      this.uiEntries = [];
    }
  }

  submitUiEntry() {
    const text = this.uiText.trim();
    if (!text) return;
    const key = `internship-demo-${this.currentPath.endsWith('complaints') ? 'complaint' : this.currentPath.split('/').pop()}`;
    const entries = [...this.uiEntries, { text, status: 'Soumis', createdAt: new Date().toLocaleDateString('fr-FR') }];
    localStorage.setItem(key, JSON.stringify(entries));
    this.uiEntries = entries;
    this.uiText = '';
    this.notice = `${this.uiWorkflowLabel()} enregistré avec succès`;
    setTimeout(() => this.notice = '', 3000);
  }

  updateUiEntryStatus(entry: { text: string; status: string; createdAt: string }) {
    entry.status = 'Traité';
    const key = `internship-demo-${this.currentPath.endsWith('complaints') ? 'complaint' : this.currentPath.split('/').pop()}`;
    localStorage.setItem(key, JSON.stringify(this.uiEntries));
  }

  get formTitle() {
    if (this.isStudentPage()) return 'étudiant';
    if (this.isCompanyPage()) return 'entreprise';
    if (this.isSupervisorPage()) return 'encadrant';
    if (this.isEvaluationPage()) return 'évaluation';
    if (this.isTaskPage()) return 'tâche';
    return 'demande de stage';
  }

  openNew() {
    this.editing = null;
    this.showForm = true;
    if (this.isInternshipPage() || this.isRequestPage()) {
      this.internshipForm.reset({ id: null, studentId: 1, status: 'PENDING' });
    } else if (this.isCompanyPage()) {
      this.companyForm.reset({ id: null });
    } else if (this.isSupervisorPage()) {
      this.supervisorForm.reset({ id: null, companyId: 1 });
    } else if (this.isEvaluationPage()) {
      this.evaluationForm.reset({ id: null, internshipId: 1, supervisorId: 1, quality: 18, punctuality: 17, communication: 19 });
    } else if (this.isTaskPage()) {
      this.taskForm.reset({ id: null, internshipId: 1, supervisorId: 1, status: 'PENDING' });
    } else {
      this.studentForm.reset({ id: null });
    }
  }

  edit(item: any) {
    this.editing = item;
    this.form.reset(item);
    this.showForm = true;
  }

  view(item: any) {
    this.selectedRecord = item;
    this.detailOpen = true;
    if (!item.id) return;

    let request: Observable<any>;
    if (this.isStudentPage()) request = this.api.students.get(item.id);
    else if (this.isCompanyPage()) request = this.api.companies.get(item.id);
    else if (this.isSupervisorPage()) request = this.api.supervisors.get(item.id);
    else if (this.isEvaluationPage()) request = this.api.evaluations.get(item.id);
    else if (this.isTaskPage()) request = this.api.tasks.get(item.id);
    else request = this.api.internships.get(item.id);

    request.subscribe({
      next: record => {
        this.selectedRecord = record;
      },
      error: () => {}
    });
  }

  get form() {
    if (this.isStudentPage()) return this.studentForm;
    if (this.isCompanyPage()) return this.companyForm;
    if (this.isSupervisorPage()) return this.supervisorForm;
    if (this.isEvaluationPage()) return this.evaluationForm;
    if (this.isTaskPage()) return this.taskForm;
    return this.internshipForm;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.value;
    const resolvedId = this.editing?.id != null ? this.editing.id : (rawValue as any).id;
    const payload = {
      ...rawValue,
      ...(resolvedId != null && resolvedId > 0 ? { id: resolvedId } : {})
    };

    let action: Observable<unknown>;
    if (this.isStudentPage()) {
      action = this.api.students.save(payload as Student);
    } else if (this.isCompanyPage()) {
      action = this.api.companies.save(payload as Company);
    } else if (this.isSupervisorPage()) {
      action = this.api.supervisors.save(payload as Supervisor);
    } else if (this.isEvaluationPage()) {
      action = this.api.evaluations.save(payload as Evaluation);
    } else if (this.isTaskPage()) {
      action = this.api.tasks.save(payload as TaskApproval);
    } else {
      action = this.api.internships.save(payload as Internship);
    }

    action.subscribe({
      next: () => {
        this.showForm = false;
        this.notice = this.editing ? 'Modifié avec succès' : 'Créé avec succès';
        this.load();
        setTimeout(() => this.notice = '', 3000);
      },
      error: (e: unknown) => this.fail(e)
    });
  }

  updateAcceptance(item: Internship, status: 'ACCEPTED' | 'REJECTED') {
    item.status = status;
    this.api.internships.save({ ...item, status }).subscribe({
      next: () => {
        this.notice = `Candidature ${status === 'ACCEPTED' ? 'acceptée' : 'refusée'}`;
        this.load();
        setTimeout(() => this.notice = '', 3000);
      },
      error: e => this.fail(e)
    });
  }

  updateTask(item: TaskApproval, status: TaskApproval['status']) {
    item.status = status;
    this.api.tasks.save({ ...item, status }).subscribe({
      next: () => {
        this.notice = `Tâche ${status === 'APPROVED' ? 'approuvée' : 'refusée'}`;
        this.load();
        setTimeout(() => this.notice = '', 3000);
      },
      error: e => this.fail(e)
    });
  }

  remove(item: any) {
    if (!item.id || !confirm('Confirmer la suppression de cet enregistrement ?')) return;
    const action = this.isStudentPage()
      ? this.api.students.remove(item.id)
      : this.isCompanyPage()
        ? this.api.companies.remove(item.id)
        : this.isSupervisorPage()
          ? this.api.supervisors.remove(item.id)
          : this.isEvaluationPage()
            ? this.api.evaluations.remove(item.id)
            : this.isTaskPage()
              ? this.api.tasks.remove(item.id)
              : this.api.internships.remove(item.id);

    action.subscribe({
      next: () => {
        this.notice = 'Enregistrement supprimé';
        this.load();
        setTimeout(() => this.notice = '', 3000);
      },
      error: e => this.fail(e)
    });
  }

  sort(col: string) {
    if (this.sortColumn === col) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColumn = col;
      this.sortAsc = true;
    }
  }

  filtered() {
    const q = this.search.toLowerCase();
    let res = this.items.filter(x => {
      const matchesQuery = !q || JSON.stringify(x).toLowerCase().includes(q);
      const matchesStatus = this.statusFilter === 'ALL' || !x.status || x.status.toUpperCase() === this.statusFilter.toUpperCase();
      return matchesQuery && matchesStatus;
    });

    if (this.sortColumn) {
      res = [...res].sort((a, b) => {
        const valA = a[this.sortColumn] ?? '';
        const valB = b[this.sortColumn] ?? '';
        return this.sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return res;
  }

  filteredReports() {
    const q = this.search.toLowerCase();
    return this.gradeReports.filter(x => !q || JSON.stringify(x).toLowerCase().includes(q));
  }
}
