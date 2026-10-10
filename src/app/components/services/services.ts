import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FadeInDirective } from '../../core/fade-in.directive';
import { WhatsappService } from '../../core/whatsapp.service';

interface Service {
  title: string;
  description: string;
  modality: string;
  message: string;
  ariaLabel: string;
}

/** Marca (por sessão) que o efeito de scroll-lock já foi exibido uma vez. */
const LOCK_SEEN_KEY = 'svc-lock-seen';

@Component({
  imports: [FadeInDirective],
  selector: 'app-services',
  styleUrl: './services.css',
  templateUrl: './services.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Services {
  private readonly whatsapp = inject(WhatsappService);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  private readonly pin = viewChild<ElementRef<HTMLElement>>('pin');

  /** Ativo só na primeira visita: o scroll vertical empurra os cards na horizontal. */
  protected readonly locked = signal(false);
  protected readonly atStart = signal(true);
  protected readonly atEnd = signal(false);

  private maxTranslate = 0;

  protected readonly services: Service[] = [
    {
      title: 'Consulta em Pneumologia',
      description: 'Avaliação especializada da saúde respiratória — investigação dos sintomas, histórico clínico e conduta individualizada.',
      modality: 'Presencial & On-line',
      message: 'Olá! Gostaria de agendar uma Consulta em Pneumologia com a Dra. Anne Valéria.',
      ariaLabel: 'Agendar consulta em Pneumologia',
    },
    {
      title: 'Avaliação de Alergias e Imunidade',
      description: 'Investigação clínica de sintomas alérgicos recorrentes e condições relacionadas à resposta imunológica.',
      modality: 'Presencial & On-line',
      message: 'Olá! Gostaria de agendar uma Avaliação de Alergias com a Dra. Anne Valéria.',
      ariaLabel: 'Agendar avaliação de alergias',
    },
    {
      title: 'Espirometria',
      description: 'Exame para avaliar a função pulmonar e auxiliar na investigação e acompanhamento de doenças respiratórias.',
      modality: 'Presencial',
      message: 'Olá! Gostaria de agendar uma Espirometria com a Dra. Anne Valéria.',
      ariaLabel: 'Agendar espirometria',
    },
    {
      title: 'Imunoterapia',
      description: 'Tratamento individualizado para condições alérgicas específicas, conforme avaliação e protocolo da médica.',
      modality: 'Presencial',
      message: 'Olá! Gostaria de saber mais sobre Imunoterapia com a Dra. Anne Valéria.',
      ariaLabel: 'Saber mais sobre imunoterapia',
    },
    {
      title: 'Acompanhamento Respiratório Crônico',
      description: 'Controle e monitoramento contínuo de asma, bronquite, DPOC e outras condições que exijam acompanhamento periódico.',
      modality: 'Presencial',
      message: 'Olá! Gostaria de agendar um Acompanhamento de Doença Respiratória Crônica.',
      ariaLabel: 'Agendar acompanhamento respiratório',
    },
    {
      title: 'Avaliação de Risco Cirúrgico',
      description: 'Avaliação clínica pré-operatória das condições gerais do paciente e dos possíveis riscos relacionados à cirurgia.',
      modality: 'Presencial',
      message: 'Olá! Gostaria de agendar uma Avaliação de Risco Cirúrgico com a Dra. Anne Valéria.',
      ariaLabel: 'Agendar avaliação de risco cirúrgico',
    },
    {
      title: 'Polissonografia',
      description: 'Exame para avaliar a qualidade do sono e investigar alterações respiratórias ou distúrbios do sono.',
      modality: 'Presencial',
      message: 'Olá! Gostaria de agendar uma Polissonografia com a Dra. Anne Valéria.',
      ariaLabel: 'Agendar polissonografia',
    },
  ];

  constructor() {
    afterNextRender(() => {
      this.init();
      this.zone.runOutsideAngular(() => {
        window.addEventListener('scroll', this.onWindowScroll, { passive: true });
        window.addEventListener('resize', this.onWindowResize, { passive: true });
      });
    });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', this.onWindowScroll);
      window.removeEventListener('resize', this.onWindowResize);
    });
  }

  protected pad(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  /**
   * Decide se a seção usa o efeito "pinned" (scroll vertical → cards na horizontal).
   * Só acontece na primeira visita e se o carrossel realmente transbordar a tela.
   */
  private init(): void {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const el = this.scroller()?.nativeElement;

    if (reduce || this.lockSeen() || !el || el.scrollWidth <= window.innerWidth + 8) {
      this.updateEdges();
      return;
    }

    this.locked.set(true);
    this.markLockSeen();
    this.measure();

    // Recalcula após o Angular aplicar a classe de pin (o pin passa a ter altura real).
    requestAnimationFrame(() => {
      this.measure();
      this.onWindowScroll();
    });
  }

  private measure(): void {
    const el = this.scroller()?.nativeElement;
    const pinEl = this.pin()?.nativeElement;
    if (!el) return;

    const viewport = document.documentElement.clientWidth;
    this.maxTranslate = Math.max(0, this.contentWidth(el) - viewport);
    pinEl?.style.setProperty('--svc-distance', `${this.maxTranslate}px`);
  }

  /** Largura total do conteúdo do carrossel, independente da largura do track. */
  private contentWidth(el: HTMLElement): number {
    const cards = el.querySelectorAll<HTMLElement>('[data-card]');
    const gap = 20;
    let width = gap * cards.length;
    cards.forEach((card) => {
      width += card.offsetWidth;
    });

    const styles = getComputedStyle(el);
    const spacer = el.lastElementChild as HTMLElement | null;
    width += parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    width += spacer?.offsetWidth ?? 0;
    return width;
  }

  /** Scroll da janela: no modo pin, converte o avanço vertical em deslocamento horizontal. */
  protected readonly onWindowScroll = (): void => {
    if (!this.locked()) return;

    const pinEl = this.pin()?.nativeElement;
    const track = this.scroller()?.nativeElement;
    if (!pinEl || !track) return;

    const distance = pinEl.offsetHeight - window.innerHeight;
    if (distance <= 0) return;

    const scrolled = Math.min(Math.max(-pinEl.getBoundingClientRect().top, 0), distance);
    const progress = scrolled / distance;

    track.style.transform = `translate3d(${-progress * this.maxTranslate}px, 0, 0)`;
    this.atStart.set(progress <= 0.001);
    this.atEnd.set(progress >= 0.999);
  };

  protected readonly onWindowResize = (): void => {
    if (!this.locked()) return;
    this.measure();
    this.onWindowScroll();
  };

  /** Rolagem interna (apenas no modo livre) para habilitar/desabilitar as setas. */
  protected onScrollerScroll(): void {
    if (this.locked()) return;
    this.updateEdges();
  }

  /** Avança/recua um card (na horizontal no modo livre; na vertical no modo pin). */
  protected scrollBy(direction: -1 | 1): void {
    const el = this.scroller()?.nativeElement;
    if (!el) return;

    const card = el.querySelector<HTMLElement>('[data-card]');
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;

    if (this.locked()) {
      window.scrollBy({ top: step * direction, behavior: 'smooth' });
      return;
    }

    el.scrollBy({ left: step * direction, behavior: 'smooth' });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.scrollBy(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.scrollBy(-1);
    }
  }

  protected agendar(service: Service): void {
    this.whatsapp.open(service.message);
  }

  private updateEdges(): void {
    const el = this.scroller()?.nativeElement;
    if (!el) return;
    this.atStart.set(el.scrollLeft <= 2);
    this.atEnd.set(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }

  private lockSeen(): boolean {
    try {
      return sessionStorage.getItem(LOCK_SEEN_KEY) === '1';
    } catch {
      return false;
    }
  }

  private markLockSeen(): void {
    try {
      sessionStorage.setItem(LOCK_SEEN_KEY, '1');
    } catch {
      /* sessionStorage indisponível — ignora */
    }
  }
}
