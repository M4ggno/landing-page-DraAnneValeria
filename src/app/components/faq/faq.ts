import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FadeInDirective } from '../../core/fade-in.directive';
import { ParticleField } from '../particle-field/particle-field';
import { FAQS } from '../../core/seo';

@Component({
  imports: [FadeInDirective, ParticleField],
  selector: 'app-faq',
  styleUrl: './faq.css',
  templateUrl: './faq.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Faq {
  protected readonly items = FAQS;
  protected readonly openIndex = signal<number | null>(0);

  protected toggle(index: number): void {
    this.openIndex.update((current) => (current === index ? null : index));
  }
}
