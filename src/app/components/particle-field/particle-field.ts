import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

interface Pulse {
  x: number;
  y: number;
  r: number;
  max: number;
  life: number;
  ttl: number;
}

/**
 * Camada decorativa de partículas: pequenas bolinhas douradas que flutuam e,
 * de tempos em tempos, soltam pulsos circulares que se expandem e desvanecem.
 * Desenhada em <canvas> 2D, fora da zona do Angular, pausando quando a seção
 * sai da tela ou a aba vai para segundo plano. Respeita prefers-reduced-motion.
 */
@Component({
  selector: 'app-particle-field',
  imports: [],
  templateUrl: './particle-field.html',
  styleUrl: './particle-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticleField {
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private ctx: CanvasRenderingContext2D | null = null;
  private dots: Dot[] = [];
  private pulses: Pulse[] = [];
  private width = 1;
  private height = 1;
  private rafId = 0;
  private running = false;
  private visible = true;
  private reduced = false;
  private last = 0;
  private emitTimer = 900;

  constructor() {
    afterNextRender(() => this.setup());
    this.destroyRef.onDestroy(() => this.stop());
  }

  private setup(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    this.ctx = canvas.getContext('2d');
    this.reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const target = canvas.parentElement ?? canvas;

    const observer = new ResizeObserver(() => this.resize());
    observer.observe(target);
    this.destroyRef.onDestroy(() => observer.disconnect());

    const inView = new IntersectionObserver(
      (entries) => {
        this.visible = entries[0]?.isIntersecting ?? true;
        this.sync();
      },
      { threshold: 0.05 },
    );
    inView.observe(target);
    this.destroyRef.onDestroy(() => inView.disconnect());

    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.destroyRef.onDestroy(() =>
      document.removeEventListener('visibilitychange', this.onVisibilityChange),
    );

    this.resize();
    if (!this.reduced) this.zone.runOutsideAngular(() => this.sync());
  }

  private onVisibilityChange = (): void => this.sync();

  private resize(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas || !this.ctx) return;

    const rect = (canvas.parentElement ?? canvas).getBoundingClientRect();
    this.width = Math.max(1, Math.round(rect.width));
    this.height = Math.max(1, Math.round(rect.height));

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(this.width * dpr);
    canvas.height = Math.round(this.height * dpr);
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.seed();
    this.draw();
  }

  private seed(): void {
    const count = this.width < 520 ? 16 : 24;
    this.dots = Array.from({ length: count }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.14,
      vy: (Math.random() - 0.5) * 0.14,
      r: 1 + Math.random() * 1.7,
    }));
    this.pulses = [];
    this.emitTimer = 900;
  }

  /** Liga/desliga a animação conforme visibilidade e preferência de movimento. */
  private sync(): void {
    if (this.visible && !document.hidden && !this.reduced) this.run();
    else this.stop();
  }

  private run(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();

    const loop = (now: number): void => {
      if (!this.running) return;
      const dt = Math.min(48, now - this.last);
      this.last = now;
      this.update(dt);
      this.draw();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private update(dt: number): void {
    for (const dot of this.dots) {
      dot.x += dot.vx * dt * 0.08;
      dot.y += dot.vy * dt * 0.08;

      if (dot.x < -4) dot.x = this.width + 4;
      else if (dot.x > this.width + 4) dot.x = -4;
      if (dot.y < -4) dot.y = this.height + 4;
      else if (dot.y > this.height + 4) dot.y = -4;
    }

    this.emitTimer -= dt;
    if (this.emitTimer <= 0) {
      this.emitTimer = 1300 + Math.random() * 1700;
      if (Math.random() < 0.55 && this.dots.length) {
        const source = this.dots[Math.floor(Math.random() * this.dots.length)];
        this.emit(source.x, source.y);
      } else {
        this.emit(this.width * (0.2 + Math.random() * 0.6), this.height * (0.25 + Math.random() * 0.5));
      }
    }

    for (const pulse of this.pulses) {
      pulse.life += dt;
      const t = Math.min(1, pulse.life / pulse.ttl);
      pulse.r = pulse.max * (1 - (1 - t) * (1 - t));
    }
    this.pulses = this.pulses.filter((pulse) => pulse.life < pulse.ttl);
  }

  private emit(x: number, y: number): void {
    if (this.pulses.length > 8) return;
    this.pulses.push({
      x,
      y,
      r: 0,
      max: 26 + Math.random() * 34,
      life: 0,
      ttl: 2200 + Math.random() * 1200,
    });
  }

  private draw(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);

    for (const pulse of this.pulses) {
      const alpha = Math.max(0, 1 - pulse.life / pulse.ttl);
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, pulse.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(201, 147, 58, ${(alpha * 0.5).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(232, 184, 109, 0.5)';
    for (const dot of this.dots) {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
