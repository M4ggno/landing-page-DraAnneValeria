import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private readonly document = inject(DOCUMENT);
  private readonly number = '5583982349308';

  open(message = 'Olá! Gostaria de agendar uma consulta com a Dra. Anne Valéria.'): void {
    const url = `https://wa.me/${this.number}?text=${encodeURIComponent(message)}`;
    this.document.defaultView?.open(url, '_blank', 'noopener');
  }
}
