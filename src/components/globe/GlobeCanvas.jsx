/**
 * GlobeCanvas.jsx
 * Three.js spinning Earth globe with animated arc routes.
 * Managed imperatively inside useEffect — never in React render.
 * Globe progress is passed as a REF (not state) to avoid React re-renders on scroll.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ARC_ROUTES } from './arcRoutes';

// Convert geographic coordinates to 3D cartesian on unit sphere
function latLngTo3D(lat, lng, radius = 1) {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta),
  );
}

// Generate intermediate great-circle points via slerp for realistic arc
function greatCirclePoints(from, to, segments = 60, arcHeight = 0.18) {
  const fromVec = latLngTo3D(from[0], from[1]);
  const toVec   = latLngTo3D(to[0],   to[1]);
  const points  = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const v = new THREE.Vector3().lerpVectors(fromVec, toVec, t).normalize();
    // Lift the midpoint off the surface for arc curvature
    const lift = Math.sin(t * Math.PI) * arcHeight;
    v.multiplyScalar(1 + lift);
    points.push(v);
  }
  return points;
}

export default function GlobeCanvas({ canvasRef, progressRef, onTextureProgress }) {
  const sceneRef    = useRef(null);
  const rendererRef = useRef(null);
  const rafRef      = useRef(null);
  const arcsRef     = useRef([]);
  const globeRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000814, 1);
    rendererRef.current = renderer;

    // ── Scene + Camera ─────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 3.0;
    sceneRef.current = scene;

    // ── Lighting ───────────────────────────────────────────────────────────
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(-3, 2, 3);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x112233, 0.4));

    // ── Earth sphere ───────────────────────────────────────────────────────
    const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x2266aa,
      shininess: 12,
      specular: new THREE.Color(0x224466),
    });
    const globe = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(globe);
    globeRef.current = globe;

    // Load earth texture asynchronously; update material when ready
    const loader = new THREE.TextureLoader();
    loader.load(
      '/textures/earth-4k.jpg',
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        sphereMat.map = tex;
        sphereMat.color.set(0xffffff);
        sphereMat.needsUpdate = true;
        if (onTextureProgress) onTextureProgress(100);
      },
      (xhr) => {
        if (onTextureProgress && xhr.total) {
          onTextureProgress((xhr.loaded / xhr.total) * 100);
        }
      },
      () => {
        // Texture missing — keep procedural blue globe, report loaded
        if (onTextureProgress) onTextureProgress(100);
      },
    );

    // ── Atmosphere glow ────────────────────────────────────────────────────
    const atmosGeo = new THREE.SphereGeometry(1.04, 64, 64);
    const atmosMat = new THREE.MeshPhongMaterial({
      color:       0x0044aa,
      side:        THREE.BackSide,
      blending:    THREE.AdditiveBlending,
      transparent: true,
      opacity:     0.12,
      depthWrite:  false,
    });
    scene.add(new THREE.Mesh(atmosGeo, atmosMat));

    // ── Arc routes ─────────────────────────────────────────────────────────
    const arcObjects = ARC_ROUTES.map((route) => {
      const pts    = greatCirclePoints(route.from, route.to, 80);
      const curve  = new THREE.CatmullRomCurve3(pts);
      const geo    = new THREE.TubeGeometry(curve, 80, 0.004, 6, false);
      const mat    = new THREE.MeshBasicMaterial({
        color:       new THREE.Color(route.color),
        transparent: true,
        opacity:     0.85,
        depthWrite:  false,
      });
      const mesh   = new THREE.Mesh(geo, mat);
      geo.setDrawRange(0, 0); // start hidden
      scene.add(mesh);

      // Glow dot at destination
      const dotGeo = new THREE.SphereGeometry(0.016, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(route.color) });
      const dot    = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(latLngTo3D(route.to[0], route.to[1]));
      dot.visible = false;
      scene.add(dot);

      return { mesh, geo, mat, dot, route, drawn: 0 };
    });
    arcsRef.current = arcObjects;

    // ── Resize handler ─────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Animation loop ─────────────────────────────────────────────────────
    let frame = 0;
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      frame++;

      const globeProgress = progressRef?.current ?? 0;

      // Continuous auto-rotation
      globe.rotation.y += 0.0015;

      // Scroll-driven camera zoom-in
      camera.position.z = 3.0 - globeProgress * 0.8;

      // Animate arc draw ranges based on globe progress
      const totalArcFaceCount = 80 * 3 * 2; // TubeGeometry face index estimate
      arcObjects.forEach((arc) => {
        const { route, geo, dot } = arc;
        if (globeProgress < route.triggerAt) {
          geo.setDrawRange(0, 0);
          dot.visible = false;
          return;
        }
        // t = 0→1 as globeProgress goes from triggerAt to triggerAt+0.06
        const t = Math.min(1, (globeProgress - route.triggerAt) / 0.06);
        const indexCount = Math.round(t * (geo.index ? geo.index.count : totalArcFaceCount));
        geo.setDrawRange(0, indexCount);
        if (t >= 1) dot.visible = true;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      arcObjects.forEach(({ geo, mat }) => { geo.dispose(); mat.dispose(); });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // canvas DOM element is managed by parent (passed via canvasRef)
}
