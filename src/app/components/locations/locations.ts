import { ChangeDetectionStrategy, Component, DOCUMENT, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FadeInDirective } from '../../core/fade-in.directive';

interface Location {
  city: string;
  state: string;
  clinic: string;
  query?: string;
}

interface MapLinks {
  embed: SafeResourceUrl;
  href: string;
}

const COORDS = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;

/** iPhone, iPad (inclusive iPadOS, que se identifica como Mac) e macOS abrem o Apple Maps. */
function isAppleDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return true;
  return /Macintosh|Mac OS X/.test(ua);
}

@Component({
  imports: [FadeInDirective],
  selector: 'app-locations',
  styleUrl: './locations.css',
  templateUrl: './locations.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Locations {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT);

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

  protected readonly isApple = isAppleDevice();
  protected readonly mapsAppName = this.isApple ? 'Apple Maps' : 'Google Maps';

  /** URLs calculadas uma única vez (evita recriar o SafeResourceUrl a cada ciclo e recarregar o iframe). */
  protected readonly maps: (MapLinks | null)[] = this.locations.map((loc) => this.buildLinks(loc));

  protected readonly openIndex = signal<number | null>(null);
  /** Painéis cujo mapa já foi montado (na intenção de abrir ou na abertura) e mantido para a animação de fechar. */
  protected readonly visited = signal<ReadonlySet<number>>(new Set());
  /** Mapas cujo iframe já terminou de carregar (esconde o skeleton). */
  protected readonly loaded = signal<ReadonlySet<number>>(new Set());

  private warmedUp = false;

  toggle(index: number): void {
    this.prefetch(index);
    this.openIndex.update((current) => (current === index ? null : index));
  }

  /** Chamado em pointerdown/foco: começa a carregar o mapa antes do clique ser concluído. */
  prefetch(index: number): void {
    this.warmUp();
    if (!this.maps[index]) return;
    this.visited.update((set) => (set.has(index) ? set : new Set(set).add(index)));
  }

  onMapLoad(index: number): void {
    this.loaded.update((set) => new Set(set).add(index));
  }

  /** No hover: apenas abre as conexões com o Google (barato), sem montar o iframe. */
  warmUp(): void {
    if (this.warmedUp) return;
    this.warmedUp = true;
    for (const origin of ['https://www.google.com', 'https://maps.gstatic.com', 'https://maps.googleapis.com']) {
      const link = this.document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = '';
      this.document.head.appendChild(link);
    }
  }

  private buildLinks(loc: Location): MapLinks | null {
    if (!loc.query) return null;
    const q = encodeURIComponent(loc.query);
    const isCoords = COORDS.test(loc.query);

    const href = this.isApple
      ? isCoords
        ? `https://maps.apple.com/?ll=${loc.query}&q=${encodeURIComponent(loc.clinic)}`
        : `https://maps.apple.com/?q=${q}`
      : `https://www.google.com/maps/search/?api=1&query=${q}`;

    // URL direta em www.google.com evita o redirect de maps.google.com
    const embed = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${q}&z=15&output=embed`,
    );
    return { embed, href };
  }
}
