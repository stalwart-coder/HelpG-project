import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroScene3D({ onSelectService }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 500;
    let height = container.clientHeight || 500;

    // ── Scene, Camera, Renderer ──────────────────────────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // ── Center Group for smooth mouse tilt ───────────────────────────
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // ── 1. Holographic Hyperlocal Wireframe Globe ────────────────────
    const globeRadius = 2.1;
    const sphereGeo = new THREE.IcosahedronGeometry(globeRadius, 2);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xf4831f,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const globe = new THREE.Mesh(sphereGeo, sphereMat);
    rootGroup.add(globe);

    // Inner glowing core
    const innerGeo = new THREE.SphereGeometry(1.6, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x1ca89c,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    rootGroup.add(innerCore);

    // ── 2. Radar Equatorial & Latitude Rings ─────────────────────────
    const ringGeo1 = new THREE.RingGeometry(2.5, 2.52, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xf4831f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.3;
    rootGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(3.0, 3.015, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x1ca89c,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 1.7;
    ring2.rotation.y = Math.PI / 6;
    rootGroup.add(ring2);

    // ── 3. Orbiting Satellites (Local Helpers / Tasks) ────────────────
    const satelliteGroup = new THREE.Group();
    rootGroup.add(satelliteGroup);

    const satellites = [
      { id: 'iron', color: 0xf4831f, dist: 2.7, speed: 0.8, yOffset: 0.5, emoji: '👕' },
      { id: 'cleaning', color: 0x1ca89c, dist: 3.1, speed: 0.6, yOffset: -0.6, emoji: '🧹' },
      { id: 'vehicle', color: 0x3b82f6, dist: 2.9, speed: 0.9, yOffset: 0.2, emoji: '🚗' },
      { id: 'guard', color: 0xe11d48, dist: 3.3, speed: 0.5, yOffset: -0.2, emoji: '🛡️' },
    ];

    const satMeshes = satellites.map((s) => {
      const geo = new THREE.SphereGeometry(0.12, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color: s.color });
      const mesh = new THREE.Mesh(geo, mat);

      // Glow halo
      const haloGeo = new THREE.SphereGeometry(0.24, 12, 12);
      const haloMat = new THREE.MeshBasicMaterial({
        color: s.color,
        transparent: true,
        opacity: 0.25,
        wireframe: true,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      mesh.add(halo);

      satelliteGroup.add(mesh);
      return { ...s, mesh, halo };
    });

    // ── 4. Floating 3D Star / Dust Field ─────────────────────────────
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const saffron = new THREE.Color(0xf4831f);
    const teal = new THREE.Color(0x1ca89c);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 2.4 + Math.random() * 2.2;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixed = Math.random() > 0.5 ? saffron : teal;
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particles);

    // ── 5. Mouse Parallax Tracker ────────────────────────────────────
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = nx * 0.45;
      targetRotX = -ny * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // ── Animation Loop ───────────────────────────────────────────────
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth idle rotations
      globe.rotation.y = elapsedTime * 0.12;
      globe.rotation.x = Math.sin(elapsedTime * 0.08) * 0.15;

      innerCore.rotation.y = -elapsedTime * 0.09;
      innerCore.rotation.z = Math.cos(elapsedTime * 0.07) * 0.1;

      ring1.rotation.z = elapsedTime * 0.15;
      ring2.rotation.z = -elapsedTime * 0.2;

      particles.rotation.y = elapsedTime * 0.05;

      // Orbiting satellites
      satMeshes.forEach((sat, i) => {
        const angle = elapsedTime * sat.speed + (i * Math.PI) / 2;
        sat.mesh.position.x = Math.cos(angle) * sat.dist;
        sat.mesh.position.z = Math.sin(angle) * sat.dist;
        sat.mesh.position.y = Math.sin(elapsedTime * 1.5 + i) * 0.4 + sat.yOffset;

        // Pulse halo
        const scale = 1 + Math.sin(elapsedTime * 3 + i) * 0.2;
        sat.halo.scale.set(scale, scale, scale);
      });

      // Mouse inertia damping
      rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.05;
      rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      // Dispose resources
      sphereGeo.dispose();
      sphereMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [onSelectService]);

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[520px] flex items-center justify-center">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 z-0 overflow-hidden cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Badge Overlay in center bottom */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-amber-500/25 text-[11px] font-mono text-slate-300 shadow-xl">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Live 3D Radar • Hyperlocal Mesh Active</span>
      </div>
    </div>
  );
}
