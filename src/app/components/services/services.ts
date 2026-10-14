import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  QueryList,
  ViewChildren,
  inject,
  signal,
} from '@angular/core';
import { WhatsappService } from '../../core/whatsapp.service';

interface Service {
  title: string;
  description: string;
  modality: string;
  message: string;
  ariaLabel: string;
  /** Caminhos (`d`) de um SVG 24×24, só traço, para dar identidade a cada card. */
  icon: string[];
}

@Component({
  selector: 'app-services',
  styleUrl: './services.css',
  templateUrl: './services.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Services implements AfterViewInit, OnDestroy {
  private readonly whatsapp = inject(WhatsappService);
  private readonly zone = inject(NgZone);

  @ViewChildren('card', { read: ElementRef }) private cardRefs?: QueryList<ElementRef<HTMLElement>>;

  /** Índice do card que está no topo do "baralho" — alimenta o indicador de progresso. */
  protected readonly activeIndex = signal(0);

  private tops: number[] = [];
  private frame = 0;
  private teardown: Array<() => void> = [];

  /**
   * Os cards "empilham" de baixo pra cima: cada um é `sticky` num `top` um pouco
   * maior que o anterior (ver `services.css` + `--i`), então o próximo sobe e
   * cobre o de trás. Um `requestAnimationFrame` marca a "profundidade" de cada
   * card (`--depth`) para os de trás recuarem (escala + brilho) conforme a pilha
   * cresce — o efeito de baralho. Roda fora do Angular (sem CD por frame).
   */
  protected readonly services: Service[] = [
    {
      title: 'Consulta em Pneumologia',
      description:
        'Avaliação especializada da saúde respiratória — investigação dos sintomas, histórico clínico e conduta individualizada.',
      modality: 'Presencial & On-line',
      message: 'Olá! Gostaria de agendar uma Consulta em Pneumologia com a Dra. Anne Valéria.',
      ariaLabel: 'Agendar consulta em Pneumologia',
      icon: [
        'M12 3v7',
        'M12 6.5c-1.4-1.6-3.3-2.2-4.8-1.4C5.7 5.9 5 7.7 5 10v4.4C5 16.4 6.6 18 8.6 18c1.8 0 3.4-1.2 3.4-2.9',
        'M12 6.5c1.4-1.6 3.3-2.2 4.8-1.4C18.3 5.9 19 7.7 19 10v4.4c0 2-1.6 3.6-3.6 3.6-1.8 0-3.4-1.2-3.4-2.9',
      ],
    },
    {
      title: 'Avaliação de Alergias e Imunidade',
      description:
        'Investigação clínica de sintomas alérgicos recorrentes e condições relacionadas à resposta imunológica.',
      modality: 'Presencial & On-line',
      message: 'Olá! Gostaria de agendar uma Avaliação de Alergias com a Dra. Anne Valéria.',
      ariaLabel: 'Agendar avaliação de alergias',
      icon: [
        'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
        'm9 12 2 2 4-4',
      ],
    },
    {
      title: 'Espirometria',
      description:
        'Exame para avaliar a função pulmonar e auxiliar na investigação e acompanhamento de doenças respiratórias.',
      modality: 'Presencial',
      message: 'Olá! Gostaria de agendar uma Espirometria com a Dra. Anne Valéria.',
      ariaLabel: 'Agendar espirometria',
      icon: [
        'M12.8 19.6A2 2 0 1 0 14 16H2',
        'M17.5 8a2.5 2.5 0 1 1 2 4H2',
        'M9.8 4.4A2 2 0 1 1 11 8H2',
      ],
    },
    {
      title: 'Imunoterapia',
      description:
        'Tratamento individualizado para condições alérgicas específicas, conforme avaliação e protocolo da médica.',
      modality: 'Presencial',
      message: 'Olá! Gostaria de saber mais sobre Imunoterapia com a Dra. Anne Valéria.',
      ariaLabel: 'Saber mais sobre imunoterapia',
      icon: ['m18 2 4 4', 'm17 7 3-3', 'M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5z', 'm9 11 4 4', 'm5 19-3 3', 'm14 4 6 6'],
    },
    {
      title: 'Acompanhamento Respiratório Crônico',
      description:
        'Controle e monitoramento contínuo de asma, bronquite, DPOC e outras condições que exijam acompanhamento periódico.',
      modality: 'Presencial',
      message: 'Olá! Gostaria de agendar um Acompanhamento de Doença Respiratória Crônica.',
      ariaLabel: 'Agendar acompanhamento respiratório',
      icon: ['M22 12h-4l-3 9L9 3l-3 9H2'],
    },
    {
      title: 'Avaliação de Risco Cirúrgico',
      description:
        'Avaliação clínica pré-operatória das condições gerais do paciente e dos possíveis riscos relacionados à cirurgia.',
      modality: 'Presencial',
      message: 'Olá! Gostaria de agendar uma Avaliação de Risco Cirúrgico com a Dra. Anne Valéria.',
      ariaLabel: 'Agendar avaliação de risco cirúrgico',
      icon: [
        'M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z',
        'M8 4H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2',
        'm9 13 2 2 4-4',
      ],
    },
    {
      title: 'Polissonografia',
      description:
        'Exame para avaliar a qualidade do sono e investigar alterações respiratórias ou distúrbios do sono.',
      modality: 'Presencial',
      message: 'Olá! Gostaria de agendar uma Polissonografia com a Dra. Anne Valéria.',
      ariaLabel: 'Agendar polissonografia',
      icon: ['M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'],
    },
  ];

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;
    // Com "reduzir movimento" o CSS já desliga o empilhamento; não vale rodar o rAF.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.zone.runOutsideAngular(() => {
      const onScroll = () => this.schedule();
      const onResize = () => {
        this.measure();
        this.update();
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize, { passive: true });
      this.teardown.push(() => window.removeEventListener('scroll', onScroll));
      this.teardown.push(() => window.removeEventListener('resize', onResize));

      this.measure();
      this.update();
    });
  }

  ngOnDestroy(): void {
    for (const off of this.teardown) off();
    if (this.frame) cancelAnimationFrame(this.frame);
  }

  protected pad(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  protected agendar(service: Service): void {
    this.whatsapp.open(service.message);
  }

  /** Lê o `top` já resolvido de cada card (inclui o `min()` com `dvh`) em vez
   * de recalcular a partir das variáveis CSS, para ser robusto ao clamp.
   */
  private measure(): void {
    const els = this.cardRefs ? this.cardRefs.toArray().map((c) => c.nativeElement) : [];
    if (els.length === 0) return;

    this.tops = els.map((el) => {
      const raw = getComputedStyle(el).top;
      const num = parseFloat(raw);
      return Number.isFinite(num) ? num : 0;
    });
  }

  private schedule(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.update();
    });
  }

  private update(): void {
    const els = this.cardRefs ? this.cardRefs.toArray().map((c) => c.nativeElement) : [];
    if (els.length === 0) return;
    if (this.tops.length !== els.length) this.measure();

    // Os cards travam em ordem, então o "stuck" forma um prefixo: o último que
    // travou é o topo do baralho. Os de trás recebem `--depth` = distância até ele.
    let topmost = -1;
    for (let i = 0; i < els.length; i++) {
      const rect = els[i].getBoundingClientRect();
      const stuck = rect.top <= (this.tops[i] ?? 0) + 1 && rect.bottom > 0;
      if (!stuck) break;
      topmost = i;
    }

    for (let i = 0; i < els.length; i++) {
      const depth = topmost < 0 ? 0 : Math.max(0, topmost - i);
      els[i].style.setProperty('--depth', String(depth));
    }

    const active = Math.max(0, topmost);
    if (this.activeIndex() !== active) {
      this.zone.run(() => this.activeIndex.set(active));
    }
  }
}
