import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FadeInDirective } from '../../core/fade-in.directive';

interface Location {
  city: string;
  state: string;
  clinic: string;
  query?: string;
}

@Component({
  imports: [FadeInDirective],
  selector: 'app-locations',
  styleUrl: './locations.css',
  templateUrl: './locations.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Locations {
  protected readonly locations: Location[] = [
    {
      city: 'Patos',
      state: 'PB',
      clinic: 'CLINAP — Medical Empresarial Center',
      query: '-7.023823,-37.274273',
    },
    {
      city: 'Sousa',
      state: 'PB',
      clinic: 'Instituto YSO — Av. João Bôsco M. de Souza',
      query: 'Instituto YSO Sousa PB',
    },
    { city: 'Pombal', state: 'PB', clinic: 'Núcleo Vida', query: 'Núcleo Vida Pombal PB' },
    { city: 'Caicó', state: 'RN', clinic: 'Clinical Center', query: 'Clinical Center Caicó RN' },
    { city: 'Afogados da Ingazeira', state: 'PE', clinic: 'Atendimento presencial' },
    {
      city: 'Bahia',
      state: 'BA',
      clinic: 'Atendimento presencial',
      query: '-9.398199,-38.225540',
    },
  ];

  protected readonly openIndex = signal<number | null>(null);
  /** Painéis já abertos: o mapa só é carregado na primeira abertura e mantido para a animação de fechar. */
  protected readonly visited = signal<ReadonlySet<number>>(new Set());
  private readonly sanitizer = inject(DomSanitizer);

  toggle(index: number): void {
    this.visited.update((set) => (set.has(index) ? set : new Set(set).add(index)));
    this.openIndex.update((current) => (current === index ? null : index));
  }

  mapsHref(query?: string): string | null {
    if (!query) return null;
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isApple = /iPhone|iPad|iPod|Macintosh|Mac OS X/.test(ua);
    return isApple
      ? `https://maps.apple.com/?q=${encodeURIComponent(query)}`
      : `https://maps.google.com/?q=${encodeURIComponent(query)}`;
  }

  mapsEmbed(query?: string): SafeResourceUrl | null {
    if (!query) return null;
    const url = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
