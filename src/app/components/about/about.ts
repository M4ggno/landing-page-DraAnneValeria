import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FadeInDirective } from '../../core/fade-in.directive';

@Component({
  imports: [FadeInDirective],
  selector: 'app-about',
  styleUrl: './about.css',
  templateUrl: './about.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  protected readonly crms = ['CRM PB 3738', 'CRM PE 20972', 'CRM BA 28449', 'CRM RN 2940'];
}
