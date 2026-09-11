import { Component } from '@angular/core';
import { WorkspaceComponent } from '../../workspace.component';

@Component({ selector: 'app-student-workspace', standalone: true, imports: [WorkspaceComponent], template: '<app-workspace />' })
export class StudentWorkspacePage {}
