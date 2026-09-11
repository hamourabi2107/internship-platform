import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `<div class="page-header"><div><span class="eyebrow">{{ eyebrow() }}</span><h1>{{ title() }}</h1><p>{{ subtitle() }}</p></div><ng-content /></div>`,
  styles: [`.page-header{display:flex;align-items:end;justify-content:space-between;margin-bottom:34px}.eyebrow{text-transform:uppercase;letter-spacing:.16em;color:#b05a40;font-size:.64rem;font-weight:700}.page-header h1{font:400 3.1rem/.95 'DM Serif Display',serif;letter-spacing:-.04em;margin:13px 0;color:#173c38}.page-header p{color:#82918b;margin:0}@media(max-width:700px){.page-header{align-items:start;gap:15px;flex-direction:column}.page-header h1{font-size:2.5rem}}`]
})
export class PageHeaderComponent {
  eyebrow = input('Workspace');
  title = input('Overview');
  subtitle = input('Keep your programme moving with a clear operational view.');
}
