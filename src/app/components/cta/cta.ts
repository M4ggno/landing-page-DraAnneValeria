import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FadeInDirective } from '../../core/fade-in.directive';
import { WhatsappService } from '../../core/whatsapp.service';

@Component({
  imports: [FadeInDirective],
  selector: 'app-cta',
  styleUrl: './cta.css',
  templateUrl: './cta.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cta {
  private readonly whatsapp = inject(WhatsappService);

  agendar(): void {
    this.whatsapp.open();
  }
}
