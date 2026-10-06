import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { WhatsappService } from '../../core/whatsapp.service';

@Component({
  imports: [],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:scroll)': 'onScroll()' },
})
export class Navbar {
  private readonly whatsapp = inject(WhatsappService);

  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);

  protected readonly links = [
    { href: '#sobre', label: 'Sobre' },
    { href: '#servicos', label: 'Serviços' },
    { href: '#localizacao', label: 'Localização' },
  ];

  onScroll(): void {
    this.scrolled.set(window.scrollY > 60);
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  agendar(): void {
    this.whatsapp.open();
  }
}
