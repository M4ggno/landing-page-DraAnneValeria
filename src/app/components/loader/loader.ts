import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-loader',
  styleUrl: './loader.css',
  templateUrl: './loader.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loader {
  protected readonly hidden = signal(false);

  constructor() {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    setTimeout(() => this.hidden.set(true), reduce ? 300 : 1650);
  }
}
