import { ChangeDetectionStrategy, Component, DOCUMENT, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { applySeo } from './core/seo';
import { Loader } from './components/loader/loader';
import { ThreeBackground } from './components/three-background/three-background';
import { Navbar } from './components/navbar/navbar';
import { Hero } from './components/hero/hero';
import { Differentials } from './components/differentials/differentials';
import { Services } from './components/services/services';
import { About } from './components/about/about';
import { Locations } from './components/locations/locations';
import { Faq } from './components/faq/faq';
import { Cta } from './components/cta/cta';
import { Footer } from './components/footer/footer';

@Component({
  imports: [
    Loader,
    ThreeBackground,
    Navbar,
    Hero,
    Differentials,
    Services,
    About,
    Locations,
    Faq,
    Cta,
    Footer,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    applySeo(inject(Meta), inject(Title), inject(DOCUMENT));
  }
}
