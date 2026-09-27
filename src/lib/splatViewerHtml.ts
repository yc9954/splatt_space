/**
 * Builds the self-contained HTML page that renders a Luma Gaussian splat
 * with Three.js. It runs inside a WebView on native and an iframe on web
 * (see components/WebFrame). The page talks back to React Native through
 * `window.ReactNativeWebView.postMessage` with JSON messages:
 *
 *   { type: 'ready' }                       page scripts initialised
 *   { type: 'splatLoaded' }                 splat finished loading
 *   { type: 'splatError', error: string }   loading failed
 *   { type: 'backgroundToggled', removed }  editable viewer only
 *   { type: 'textUpdated', text }           editable viewer only
 *
 * The editable viewer also exposes `window.toggleBackground()` and
 * `window.updateTextOverlay(text, position, color)` for injectJavaScript.
 */

export type TextPosition = 'top' | 'center' | 'bottom';

export interface SplatViewerOptions {
  /** Luma capture URL (https://lumalabs.ai/capture/...) or a splat file URL. */
  source: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  /** CSS colour behind the splat. Ignored when `transparentBackground` is true. */
  background?: string;
  transparentBackground?: boolean;
  /** Only render the foreground semantic layer. */
  removeBackground?: boolean;
  textOverlay?: string;
  textPosition?: TextPosition;
  textColor?: string;
  particleReveal?: boolean;
  cameraDistance?: number;
}

const THREE_VERSION = '0.157.0';
const LUMA_WEB_VERSION = '0.2.0';

export function buildSplatViewerHtml(options: SplatViewerOptions): string {
  const {
    source,
    autoRotate = false,
    autoRotateSpeed = 0.5,
    background = '#000000',
    transparentBackground = false,
    removeBackground = false,
    textOverlay = '',
    textPosition = 'center',
    textColor = '#ffffff',
    particleReveal = true,
    cameraDistance = 2,
  } = options;

  const bodyBackground = transparentBackground ? 'transparent' : background;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: ${bodyBackground}; }
    canvas { display: block; width: 100vw; height: 100vh; touch-action: none; }
  </style>
  <script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@${THREE_VERSION}/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@${THREE_VERSION}/examples/jsm/",
      "@lumaai/luma-web": "https://unpkg.com/@lumaai/luma-web@${LUMA_WEB_VERSION}/dist/library/luma-web.module.js"
    }
  }
  </script>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    window.__post = function (payload) {
      try {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      } catch (e) {}
    };
    window.addEventListener('error', function (e) {
      window.__post({ type: 'splatError', error: (e && e.message) || 'Script error' });
    });
  </script>
  <script type="module">
    import {
      WebGLRenderer, PerspectiveCamera, Scene, Color, Texture,
      PlaneGeometry, MeshStandardMaterial, Mesh, DoubleSide
    } from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { LumaSplatsThree, LumaSplatsSemantics } from '@lumaai/luma-web';

    const options = ${JSON.stringify({
      source,
      autoRotate,
      autoRotateSpeed,
      transparentBackground,
      background,
      removeBackground,
      textOverlay,
      textPosition,
      textColor,
      particleReveal,
      cameraDistance,
    })};

    const canvas = document.getElementById('canvas');
    const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new Scene();
    if (!options.transparentBackground) {
      scene.background = new Color(options.background);
    }

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, options.cameraDistance);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.minDistance = 0.5;
    controls.maxDistance = 10;
    controls.autoRotate = options.autoRotate;
    controls.autoRotateSpeed = options.autoRotateSpeed;

    let splat = null;
    let textPlane = null;
    let backgroundRemoved = !!options.removeBackground;

    function applySemantics() {
      if (!splat) return;
      splat.semanticsMask = backgroundRemoved
        ? LumaSplatsSemantics.FOREGROUND
        : (LumaSplatsSemantics.FOREGROUND | LumaSplatsSemantics.BACKGROUND);
    }

    function loadSplat(source) {
      if (splat) {
        scene.remove(splat);
        splat = null;
      }
      if (!source) return;
      try {
        splat = new LumaSplatsThree({
          source,
          enableThreeShaderIntegration: false,
          particleRevealEnabled: options.particleReveal,
        });
        splat.onLoad = () => window.__post({ type: 'splatLoaded' });
        applySemantics();
        scene.add(splat);
      } catch (error) {
        window.__post({ type: 'splatError', error: (error && error.message) || 'Failed to load scene' });
      }
    }

    function createText(text, position, color) {
      const textCanvas = document.createElement('canvas');
      const context = textCanvas.getContext('2d');
      textCanvas.width = 1024;
      textCanvas.height = 512;
      context.fillStyle = 'rgba(255, 255, 255, 0)';
      context.fillRect(0, 0, textCanvas.width, textCanvas.height);
      context.fillStyle = color || 'white';
      context.font = '200px sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      context.lineWidth = 5;
      context.fillText(text, textCanvas.width / 2, textCanvas.height / 2);
      context.strokeText(text, textCanvas.width / 2, textCanvas.height / 2);

      const texture = new Texture(textCanvas);
      texture.needsUpdate = true;

      const geometry = new PlaneGeometry(5, 2.5);
      const material = new MeshStandardMaterial({
        map: texture,
        transparent: false,
        alphaTest: 0.5,
        side: DoubleSide,
        premultipliedAlpha: true,
        emissive: color || 'white',
        emissiveIntensity: 2,
      });
      const plane = new Mesh(geometry, material);
      const yPos = position === 'top' ? 0.9 : position === 'bottom' ? -0.9 : 0;
      plane.position.set(0.8, yPos, 0);
      plane.rotation.y = Math.PI / 2;
      plane.scale.setScalar(0.6);
      return plane;
    }

    window.updateTextOverlay = function (text, position, color) {
      if (textPlane) {
        scene.remove(textPlane);
        textPlane.geometry.dispose();
        textPlane.material.dispose();
        if (textPlane.material.map) textPlane.material.map.dispose();
        textPlane = null;
      }
      if (text) {
        textPlane = createText(text, position, color);
        scene.add(textPlane);
      }
      window.__post({ type: 'textUpdated', text });
    };

    window.toggleBackground = function () {
      backgroundRemoved = !backgroundRemoved;
      applySemantics();
      window.__post({ type: 'backgroundToggled', removed: backgroundRemoved });
    };

    window.loadSplat = loadSplat;

    loadSplat(options.source);
    if (options.textOverlay) {
      textPlane = createText(options.textOverlay, options.textPosition, options.textColor);
      scene.add(textPlane);
    }

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    });

    window.__post({ type: 'ready' });
  </script>
</body>
</html>`;
}
