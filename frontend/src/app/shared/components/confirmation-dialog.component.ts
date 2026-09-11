import { Component, output, input } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  template: `@if (open()) {<div class="dialog-backdrop"><section class="dialog"><span class="dialog-icon">!</span><h2>{{ title() }}</h2><p>{{ message() }}</p><div><button class="cancel" (click)="cancelled.emit()">Cancel</button><button class="confirm" (click)="confirmed.emit()">Confirm</button></div></section></div>}`,
  styles: [`.dialog-backdrop{position:fixed;inset:0;background:#122f2c80;display:grid;place-items:center;padding:20px;z-index:10}.dialog{background:#fff;width:min(390px,100%);border-radius:8px;padding:30px;box-shadow:0 20px 60px #173c3840}.dialog-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:#fce9e4;color:#b85c46;font-weight:800}.dialog h2{font:1.6rem 'DM Serif Display',serif;color:#173c38;margin:18px 0 8px}.dialog p{color:#7e8e87;font-size:.8rem;line-height:1.55}.dialog div{display:flex;justify-content:flex-end;gap:9px;margin-top:24px}.dialog button{border:0;border-radius:4px;padding:10px 14px;cursor:pointer;font-weight:700}.cancel{background:#eef3eb;color:#45665b}.confirm{background:#d96f48;color:white}`]
})
export class ConfirmationDialogComponent {
  open = input(false); title = input('Are you sure?'); message = input('This action cannot be undone.');
  confirmed = output<void>(); cancelled = output<void>();
}
