import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import type * as Three from 'three';

@Component({
  imports: [],
  selector: 'app-three-background',
  styleUrl: './three-background.css',
  templateUrl: './three-background.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:mousemove)': 'onMouseMove($event)',
    '(window:resize)': 'onResize()',
  },
})
export class ThreeBackground implements OnInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly destroyRef = inject(DestroyRef);

  private THREE?: typeof Three;
  private renderer?: Three.WebGLRenderer;
  private scene?: Three.Scene;
  private camera?: Three.PerspectiveCamera;
  private particles?: Three.Points;
  private lungPlane?: Three.Mesh;
  private mouse = { x: 0, y: 0 };
  private animId = 0;

  async ngOnInit(): Promise<void> {
    this.destroyRef.onDestroy(() => this.dispose());
    // three.js carregado sob demanda para não inflar o bundle inicial
    this.THREE = await import('three');
    this.init();
  }

  private init(): void {
    const T = this.THREE;
    if (!T) return;
    const canvas = this.canvasRef.nativeElement;

    this.renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.z = 30;

    const count = 680;
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

    // Pulmão (icon.svg) girando e pulsando no plano de fundo
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 1024;
      c.getContext('2d')!.drawImage(img, 0, 0, 1024, 1024);
      const tex = new T.CanvasTexture(c);
      const plane = new T.Mesh(
        new T.PlaneGeometry(26, 26 * (303.75 / 358.5)),
        new T.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 0.14,
          depthWrite: false,
          blending: T.AdditiveBlending,
        }),
      );
      plane.position.z = -8;
      this.lungPlane = plane;
      this.scene?.add(plane);
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
      const segs = 128;
      const radius = 18 + r * 9;
      for (let s = 0; s <= segs; s++) {
        const a = (s / segs) * Math.PI * 2;
        pts.push(new T.Vector3(Math.cos(a) * radius, Math.sin(a) * radius * 0.28, (r - 1) * 6));
      }
      this.scene.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), ringMat));
    }

    this.animate();
  }

  private animate(): void {
    this.animId = requestAnimationFrame(() => this.animate());
    if (!this.renderer || !this.scene || !this.camera) return;

    const t = Date.now() * 0.0004;
    if (this.particles) {
      this.particles.rotation.y = t * 0.08 + this.mouse.x * 0.12;
      this.particles.rotation.x = t * 0.04 + this.mouse.y * 0.06;
    }
    if (this.lungPlane) {
      this.lungPlane.rotation.z = t * 0.15;
      // pulso em 3 frames, mesma cadência do icon-animated.svg (1.2s)
      const phase = (Date.now() % 1200) / 1200;
      const pulse = 1 + 0.12 * (0.5 - 0.5 * Math.cos(phase * Math.PI * 2));
      this.lungPlane.scale.setScalar(pulse);
    }
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
  }

  private dispose(): void {
    cancelAnimationFrame(this.animId);
    const T = this.THREE;
    if (!T) return;
    this.scene?.traverse((obj) => {
      if (obj instanceof T.Points || obj instanceof T.Line || obj instanceof T.Mesh) {
        obj.geometry.dispose();
        (obj.material as Three.Material).dispose();
      }
    });
    this.renderer?.dispose();
  }
}
