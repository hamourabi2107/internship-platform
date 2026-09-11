import { Type } from '@angular/core';
import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { WorkspaceComponent } from './workspace.component';
import { roleGuard } from './core/guards/role.guard';
import { StudentWorkspacePage } from './front-office/student/student-workspace.page';
import { CompanyWorkspacePage } from './front-office/company/company-workspace.page';
import { AdminWorkspacePage } from './back-office/admin/admin-workspace.page';

type WorkspaceRole = 'STUDENT' | 'COMPANY' | 'ADMIN';
const workspace = (roles: WorkspaceRole[], component: Type<unknown> = WorkspaceComponent) => ({ component, canActivate: [roleGuard(roles)] });

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'student',
    children: [
      { path: 'dashboard', ...workspace(['STUDENT'], StudentWorkspacePage) },
      { path: 'internships', ...workspace(['STUDENT'], StudentWorkspacePage) },
      { path: 'internships/new', ...workspace(['STUDENT'], StudentWorkspacePage) },
      { path: 'internships/:id', ...workspace(['STUDENT'], StudentWorkspacePage) },
      { path: 'company', ...workspace(['STUDENT'], StudentWorkspacePage) },
      { path: 'supervisor', ...workspace(['STUDENT'], StudentWorkspacePage) },
      { path: 'tasks', ...workspace(['STUDENT'], StudentWorkspacePage) },
      { path: 'journal', ...workspace(['STUDENT'], StudentWorkspacePage) },
      { path: 'documents', ...workspace(['STUDENT'], StudentWorkspacePage) },
      { path: 'report', ...workspace(['STUDENT'], StudentWorkspacePage) },
      { path: 'assignment-letter', ...workspace(['STUDENT'], StudentWorkspacePage) },
      { path: 'evaluation', ...workspace(['STUDENT'], StudentWorkspacePage) },
      { path: 'complaint', ...workspace(['STUDENT'], StudentWorkspacePage) }
    ]
  },
  {
    path: 'company',
    children: [
      { path: 'dashboard', ...workspace(['COMPANY'], CompanyWorkspacePage) },
      { path: 'internships', ...workspace(['COMPANY'], CompanyWorkspacePage) },
      { path: 'internships/:id', ...workspace(['COMPANY'], CompanyWorkspacePage) },
      { path: 'supervisors', ...workspace(['COMPANY'], CompanyWorkspacePage) },
      { path: 'tasks', ...workspace(['COMPANY'], CompanyWorkspacePage) },
      { path: 'evaluations', ...workspace(['COMPANY'], CompanyWorkspacePage) }
    ]
  },
  {
    path: 'admin',
    children: [
      { path: 'dashboard', ...workspace(['ADMIN'], AdminWorkspacePage) },
      { path: 'students', ...workspace(['ADMIN'], AdminWorkspacePage) },
      { path: 'companies', ...workspace(['ADMIN'], AdminWorkspacePage) },
      { path: 'supervisors', ...workspace(['ADMIN'], AdminWorkspacePage) },
      { path: 'internships', ...workspace(['ADMIN'], AdminWorkspacePage) },
      { path: 'requests', ...workspace(['ADMIN'], AdminWorkspacePage) },
      { path: 'documents', ...workspace(['ADMIN'], AdminWorkspacePage) },
      { path: 'evaluations', ...workspace(['ADMIN'], AdminWorkspacePage) },
      { path: 'complaints', ...workspace(['ADMIN'], AdminWorkspacePage) },
      { path: 'reports', ...workspace(['ADMIN'], AdminWorkspacePage) },
      { path: 'grades', ...workspace(['ADMIN'], AdminWorkspacePage) }
    ]
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];
