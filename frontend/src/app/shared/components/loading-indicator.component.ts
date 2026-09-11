import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  template: `<div class="loading"><span></span><span></span><span></span><b>Loading records</b></div>`,
  styles: [`.loading{display:flex;align-items:center;justify-content:center;gap:6px;padding:90px;color:#85958d;font-size:.8rem}.loading span{width:6px;height:6px;border-radius:50%;background:#d96f48;animation:pulse 1s infinite}.loading span:nth-child(2){animation-delay:.15s}.loading span:nth-child(3){animation-delay:.3s}.loading b{margin-left:8px;font-weight:500}@keyframes pulse{50%{opacity:.25;transform:translateY(-3px)}}`]
})
export class LoadingIndicatorComponent {}
