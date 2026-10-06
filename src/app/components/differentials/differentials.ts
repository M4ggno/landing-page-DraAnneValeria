import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FadeInDirective } from '../../core/fade-in.directive';

interface Differential {
  title: string;
  text: string;
}

@Component({
  imports: [FadeInDirective],
  selector: 'app-differentials',
  styleUrl: './differentials.css',
  templateUrl: './differentials.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Differentials {
  protected pad(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  protected readonly items: Differential[] = [
    {
      title: 'Avaliação individualizada',
      text: 'Investigação criteriosa de cada caso, sem protocolo genérico. Cada paciente tem sua história.',
    },
    {
      title: 'Atendimento humanizado',
      text: 'Escuta ativa, explicações claras e acompanhamento próximo em todo o processo de tratamento.',
    },
    {
      title: 'Visão integrada',
      text: 'Integração entre Pneumologia, Alergia e Imunologia para uma abordagem mais completa e eficaz.',
    },
  ];
}
