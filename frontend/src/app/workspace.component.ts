import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule, FormsModule, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable, catchError, forkJoin, of, timeout } from 'rxjs';
import { AuthService } from './core/services/auth.service';
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
  showForm = false;
  editing: any = null;

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
      dashboard: 'Overview',
      students: 'Students',
      companies: 'Companies',
      supervisors: 'Supervisors',
      internships: 'Internships',
      requests: 'Internship requests',
      documents: 'Documents',
      evaluations: 'Evaluations',
      complaints: 'Complaints',
      reports: 'Academic Grade Sheet & Reports',
      grades: 'Academic Grade Sheet & Reports',
      tasks: 'Task approvals',
      journal: 'Internship Journal',
      report: 'Internship report',
      'assignment-letter': 'Official Placement Agreement',
      evaluation: 'My evaluation',
      complaint: 'Complaints',
      company: 'Host Company Profile',
      supervisor: 'Assigned Academic & Company Supervisor'
    };
    return labels[this.currentPath.split('/').pop() || 'dashboard'] || 'Overview';
  }

  get actor() {
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
        { label: 'Entreprises partenaires', path: '/admin/companies', icon: '▣' }
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
          ? `Grade: ${latestEvaluation.overallGrade}/20 (${this.getEvaluationMention(latestEvaluation.overallGrade)})`
          : 'Pending final evaluation';

        this.dashboardStats = {
          first: { label: 'Placement status', value: current?.status || (internships[0]?.status || 'PENDING'), note: current?.title || internships[0]?.title || 'Internship record' },
          second: { label: 'Host enterprise', value: current?.company || internships[0]?.company || 'Pending', note: 'Assigned company placement' },
          third: { label: 'Open tasks', value: String(tasks.filter(item => item.status === 'PENDING').length), note: 'Tasks awaiting review' },
          fourth: { label: 'Evaluation', value: latestEvaluation?.overallGrade != null ? `${latestEvaluation.overallGrade}/20` : 'In progress', note: evalNote }
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
          first: { label: 'Pending requests', value: String(acceptances.filter(item => item.status === 'PENDING').length), note: 'Pending candidate acceptances' },
          second: { label: 'Active internships', value: String(internships.filter(item => item.status === 'ACTIVE').length || acceptances.filter(item => item.status === 'ACCEPTED').length), note: 'Ongoing company placements' },
          third: { label: 'Task approvals', value: String(tasks.filter(item => item.status === 'PENDING').length), note: 'Tasks requiring supervisor approval' },
          fourth: { label: 'Completed evaluations', value: String(evaluations.length), note: 'Final grades calculated' }
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
        first: { label: 'Total students', value: String(students.length), note: 'Registered student engineers' },
        second: { label: 'Partner companies', value: String(companies.length), note: 'Accredited host enterprises' },
        third: { label: 'Total placements', value: String(internships.length), note: `${internships.filter(i => i.status === 'ACTIVE').length} active, ${internships.filter(i => i.status === 'COMPLETED').length} completed` },
        fourth: { label: 'Evaluations graded', value: String(evaluations.length), note: 'Official academic grade records' }
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
          companyName: company?.name || internship?.company || 'ESPRIT Partner Enterprise',
          internshipTitle: internship?.title || 'Graduation Internship (PFE)',
          internshipStatus: internship?.status || 'ACTIVE',
          quality: evaluation?.quality,
          punctuality: evaluation?.punctuality,
          communication: evaluation?.communication,
          overallGrade: grade,
          mention: this.getEvaluationMention(grade),
          decision: grade != null ? (grade >= 10 ? 'ADMIS (Validated)' : 'AJOURNÉ (Fail)') : 'EN COURS (In Progress)'
        };
      });

      this.items = this.gradeReports;
      this.loading = false;
    });
  }

  getEvaluationMention(grade: number | undefined): string {
    if (grade == null) return 'Pending evaluation';
    if (grade >= 16) return 'Très Bien (Honors)';
    if (grade >= 14) return 'Bien';
    if (grade >= 12) return 'Assez Bien';
    if (grade >= 10) return 'Passable';
    return 'Insuffisant';
  }

  exportGradesCsv() {
    if (!this.gradeReports.length) return;
    const header = ['Student ID', 'Student Name', 'Email', 'Company', 'Internship Title', 'Status', 'Quality /20', 'Punctuality /20', 'Communication /20', 'Overall Grade /20', 'Mention', 'Decision'];
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
    link.setAttribute('download', `ESPRIT_Academic_Internship_Grades_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.notice = 'Grade report exported successfully to CSV';
    setTimeout(() => this.notice = '', 3000);
  }

  updateInternshipStatus(item: Internship, status: string) {
    const updated = { ...item, status };
    this.api.internships.save(updated).subscribe({
      next: () => {
        this.notice = `Internship placement status transitioned to ${status.toUpperCase()}`;
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
      ? 'The gateway took too long to respond. Please verify that microservices are operational.'
      : e?.status === 0
        ? 'Gateway unavailable. Start the backend services to load live data.'
        : `Could not load ${this.title.toLowerCase()}. Please try again.`;
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  announceUnavailable(feature: string) {
    this.notice = `${feature} is registered in the academic system.`;
    setTimeout(() => this.notice = '', 3500);
  }

  isUiWorkflowPage() {
    return ['journal', 'complaint', 'complaints'].some(page => this.currentPath.endsWith(page));
  }

  uiWorkflowLabel() {
    return this.currentPath.endsWith('journal') ? 'Journal entry' : 'Complaint';
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
    const entries = [...this.uiEntries, { text, status: 'Submitted', createdAt: new Date().toLocaleDateString() }];
    localStorage.setItem(key, JSON.stringify(entries));
    this.uiEntries = entries;
    this.uiText = '';
    this.notice = `${this.uiWorkflowLabel()} recorded successfully`;
    setTimeout(() => this.notice = '', 3000);
  }

  updateUiEntryStatus(entry: { text: string; status: string; createdAt: string }) {
    entry.status = 'Processed';
    const key = `internship-demo-${this.currentPath.endsWith('complaints') ? 'complaint' : this.currentPath.split('/').pop()}`;
    localStorage.setItem(key, JSON.stringify(this.uiEntries));
  }

  get formTitle() {
    if (this.isStudentPage()) return 'student';
    if (this.isCompanyPage()) return 'company';
    if (this.isSupervisorPage()) return 'supervisor';
    if (this.isEvaluationPage()) return 'evaluation';
    if (this.isTaskPage()) return 'task';
    return 'internship request';
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
      this.evaluationForm.reset({ id: null, internshipId: 1, supervisorId: 1, quality: 10, punctuality: 10, communication: 10 });
    } else if (this.isTaskPage()) {
      this.taskForm.reset({ id: null, internshipId: 1, supervisorId: 1, status: 'PENDING' });
    } else {
      this.studentForm.reset({ id: null });
    }
  }

  edit(item: any) {
    this.editing = item;
    this.showForm = true;
    this.form.patchValue(item);
  }

  view(item: any) {
    if (!item.id) {
      this.selectedRecord = item;
      this.detailOpen = true;
      return;
    }
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
        this.detailOpen = true;
      },
      error: e => this.fail(e)
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
        this.notice = this.editing ? 'Updated successfully' : 'Created successfully';
        this.load();
        setTimeout(() => this.notice = '', 3000);
      },
      error: (e: unknown) => this.fail(e)
    });
  }

  updateAcceptance(item: Internship, status: 'ACCEPTED' | 'REJECTED') {
    this.api.internships.save({ ...item, status }).subscribe({
      next: () => {
        this.notice = `Request ${status.toLowerCase()}`;
        this.load();
      },
      error: e => this.fail(e)
    });
  }

  updateTask(item: TaskApproval, status: TaskApproval['status']) {
    this.api.tasks.save({ ...item, status }).subscribe({
      next: () => {
        this.notice = `Task ${status.toLowerCase()}`;
        this.load();
      },
      error: e => this.fail(e)
    });
  }

  remove(item: any) {
    if (!item.id || !confirm('Delete this record?')) return;
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
        this.notice = 'Record deleted';
        this.load();
      },
      error: e => this.fail(e)
    });
  }

  filtered() {
    const q = this.search.toLowerCase();
    return this.items.filter(x => !q || JSON.stringify(x).toLowerCase().includes(q));
  }

  filteredReports() {
    const q = this.search.toLowerCase();
    return this.gradeReports.filter(x => !q || JSON.stringify(x).toLowerCase().includes(q));
  }
}
