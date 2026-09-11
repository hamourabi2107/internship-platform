import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `<div class="empty-state"><span>{{ icon() }}</span><h3>{{ title() }}</h3><p>{{ message() }}</p></div>`,
  styles: [`.empty-state{text-align:center;color:#91a098;padding:70px 20px}.empty-state span{display:grid;place-items:center;width:48px;height:48px;border-radius:50%;background:#eef3eb;color:#668078;font-size:1.4rem;margin:0 auto 16px}.empty-state h3{color:#34564d;margin:0 0 7px;font:1.35rem 'DM Serif Display',serif}.empty-state p{font-size:.78rem;margin:0 auto;max-width:360px;line-height:1.6}`]
})
export class EmptyStateComponent {
  title = input('Nothing here yet');
  message = input('Records will appear here when they are available.');
  icon = input('◌');
}
