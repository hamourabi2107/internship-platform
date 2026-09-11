import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="status-badge" [class]="tone()">{{ label() }}</span>`,
  styles: [`.status-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:4px;font-size:.62rem;letter-spacing:.07em;text-transform:uppercase;font-weight:700}.status-badge:before{content:'';width:5px;height:5px;border-radius:50%;background:currentColor}.pending{background:#fff0e2;color:#bf7045}.accepted,.approved,.active{background:#e2f1e6;color:#438060}.rejected{background:#fbe6e1;color:#bc5c48}.default{background:#eef1ee;color:#668078}`]
})
export class StatusBadgeComponent {
  label = input('Active');
  tone() { return this.label().toLowerCase().replaceAll(' ', '-') || 'default'; }
}
