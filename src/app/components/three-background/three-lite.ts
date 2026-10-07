// Re-exporta apenas as classes usadas no fundo, permitindo tree-shaking do three.js
// (o `import('three')` direto puxa a biblioteca inteira para o chunk).
export {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Line,
  LineBasicMaterial,
  Material,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
