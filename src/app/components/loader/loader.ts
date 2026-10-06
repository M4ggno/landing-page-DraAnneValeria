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
    setTimeout(() => this.hidden.set(true), 1650);
  }
}
