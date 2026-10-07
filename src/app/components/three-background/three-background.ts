import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import type * as Three from './three-lite';

type ThreeLite = typeof Three;

@Component({
  imports: [],
  selector: 'app-three-background',
  styleUrl: './three-background.css',
  templateUrl: './three-background.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:mousemove)': 'onMouseMove($event)',
    '(window:resize)': 'onResize()',
    '(document:visibilitychange)': 'onVisibilityChange()',
  },
})
export class ThreeBackground implements OnInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly destroyRef = inject(DestroyRef);

  private THREE?: ThreeLite;
  private renderer?: Three.WebGLRenderer;
  private scene?: Three.Scene;
  private camera?: Three.PerspectiveCamera;
  private particles?: Three.Points;
  private mouse = { x: 0, y: 0 };
  private animId = 0;
  private running = false;
  private destroyed = false;
  private reducedMotion = false;

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.dispose());
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    // three.js carregado só quando o navegador estiver ocioso, para não competir com o conteúdo inicial
    const load = async () => {
      const mod = await import('./three-lite');
      if (this.destroyed) return;
      this.THREE = mod;
      this.init();
    };
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => void load(), { timeout: 2500 });
    } else {
      setTimeout(() => void load(), 1200);
    }
  }

  private init(): void {
    const T = this.THREE;
    if (!T) return;
    const canvas = this.canvasRef.nativeElement;

    this.renderer = new T.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.z = 30;

    const count = window.innerWidth < 768 ? 360 : 680;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 90;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }

    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(positions, 3));

    const mat = new T.PointsMaterial({
      color: 0xc9933a,
      size: 0.22,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true,
      depthWrite: false,
      blending: T.AdditiveBlending,
    });

    this.particles = new T.Points(geo, mat);
    this.scene.add(this.particles);

    // Pulmão (icon.svg) estático no plano de fundo
    const img = new Image();
    img.onload = () => {
      if (this.destroyed || !this.scene) return;
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      c.getContext('2d')!.drawImage(img, 0, 0, 512, 512);
      const tex = new T.CanvasTexture(c);
      const plane = new T.Mesh(
        new T.PlaneGeometry(26, 26 * (303.75 / 358.5)),
        new T.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 0.1,
          depthWrite: false,
          blending: T.AdditiveBlending,
        }),
      );
      plane.position.z = -8;
      this.scene.add(plane);
      if (this.reducedMotion) this.renderFrame();
    };
    img.src = 'icons/icon.svg';

    const ringMat = new T.LineBasicMaterial({
      color: 0xc16738,
      transparent: true,
      opacity: 0.07,
      blending: T.AdditiveBlending,
    });
    for (let r = 0; r < 3; r++) {
      const pts: Three.Vector3[] = [];
      const segs = 96;
      const radius = 18 + r * 9;
      for (let s = 0; s <= segs; s++) {
        const a = (s / segs) * Math.PI * 2;
        pts.push(new T.Vector3(Math.cos(a) * radius, Math.sin(a) * radius * 0.28, (r - 1) * 6));
      }
      this.scene.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), ringMat));
    }

    if (this.reducedMotion) {
      this.renderFrame();
    } else {
      this.start();
    }
  }

  private start(): void {
    if (this.running || this.reducedMotion || !this.renderer) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.renderFrame();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  private stop(): void {
    this.running = false;
    cancelAnimationFrame(this.animId);
  }

  private renderFrame(): void {
    if (!this.renderer || !this.scene || !this.camera) return;

    const t = performance.now() * 0.0004;
    if (this.particles) {
      this.particles.rotation.y = t * 0.08 + this.mouse.x * 0.12;
      this.particles.rotation.x = t * 0.04 + this.mouse.y * 0.06;
    }
    // pulmão fica estático (sem rotação/pulso): só as partículas se movem
    this.renderer.render(this.scene, this.camera);
  }

  onMouseMove(e: MouseEvent): void {
    this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  onResize(): void {
    if (!this.renderer || !this.camera) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if (this.reducedMotion) this.renderFrame();
  }

  /** Pausa o loop quando a aba fica em segundo plano (economiza CPU/GPU e bateria). */
  onVisibilityChange(): void {
    if (document.hidden) this.stop();
    else this.start();
  }

  private dispose(): void {
    this.destroyed = true;
    this.stop();
    const T = this.THREE;
    if (!T) return;
    this.scene?.traverse((obj) => {
      if (obj instanceof T.Points || obj instanceof T.Line || obj instanceof T.Mesh) {
        obj.geometry.dispose();
        const material = obj.material as Three.Material & { map?: { dispose(): void } | null };
        material.map?.dispose();
        material.dispose();
      }
    });
    this.renderer?.dispose();
  }
}
