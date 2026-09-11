import { Component } from '@angular/core';
import { WorkspaceComponent } from '../../workspace.component';

@Component({ selector: 'app-company-workspace', standalone: true, imports: [WorkspaceComponent], template: '<app-workspace />' })
export class CompanyWorkspacePage {}
