import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
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

@Component({
  imports: [FadeInDirective],
  selector: 'app-services',
  styleUrl: './services.css',
  templateUrl: './services.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Services {
  private readonly whatsapp = inject(WhatsappService);
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  protected readonly atStart = signal(true);
  protected readonly atEnd = signal(false);

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
    afterNextRender(() => this.updateEdges());
  }

  protected pad(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  /** Avança/recua um card (largura do card + gap), com rolagem suave. */
  protected scrollBy(direction: -1 | 1): void {
    const el = this.scroller()?.nativeElement;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card]');
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: 'smooth' });
  }

  protected onScroll(): void {
    this.updateEdges();
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
}
