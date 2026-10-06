import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
      title: 'Risco Cirúrgico & Polissonografia',
      description: 'Avaliação pré-operatória e exame do sono para investigar alterações respiratórias e distúrbios noturnos.',
      modality: 'Presencial',
      message: 'Olá! Gostaria de agendar uma Avaliação de Risco Cirúrgico ou Polissonografia.',
      ariaLabel: 'Agendar avaliação cirúrgica ou polissonografia',
    },
  ];

  agendar(service: Service): void {
    this.whatsapp.open(service.message);
  }
}
