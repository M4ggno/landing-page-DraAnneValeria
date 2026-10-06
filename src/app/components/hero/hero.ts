import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WhatsappService } from '../../core/whatsapp.service';

@Component({
  imports: [],
  selector: 'app-hero',
  styleUrl: './hero.css',
  templateUrl: './hero.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  private readonly whatsapp = inject(WhatsappService);

  agendar(): void {
    this.whatsapp.open();
  }
}
