import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loader } from './components/loader/loader';
import { ThreeBackground } from './components/three-background/three-background';
import { Navbar } from './components/navbar/navbar';
import { Hero } from './components/hero/hero';
import { Differentials } from './components/differentials/differentials';
import { Services } from './components/services/services';
import { About } from './components/about/about';
import { Locations } from './components/locations/locations';
import { Cta } from './components/cta/cta';
import { Footer } from './components/footer/footer';

@Component({
  imports: [
    RouterOutlet,
    Loader,
    ThreeBackground,
    Navbar,
    Hero,
    Differentials,
    Services,
    About,
    Locations,
    Cta,
    Footer,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
