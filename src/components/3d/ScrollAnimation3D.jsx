import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ScrollAnimation3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create Gurkha Khukuri (traditional Nepali knife)
    const khukriGroup = new THREE.Group();

    // Blade - curved shape
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, 0);
    bladeShape.lineTo(0.3, 0);
    bladeShape.quadraticCurveTo(0.4, 1.5, 0.2, 3);
    bladeShape.lineTo(0, 2.8);
    bladeShape.quadraticCurveTo(0.2, 1.3, 0, 0);

    const extrudeSettings = {
      steps: 1,
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3
    };

    const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
    const bladeMaterial = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      shininess: 100,
      specular: 0xffffff
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.set(0, -1.5, 0);
    khukriGroup.add(blade);

    // Handle - wooden texture
    const handleGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.8, 16);
    const handleMaterial = new THREE.MeshPhongMaterial({
      color: 0x8b4513,
      shininess: 30
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0.075, -1.8, 0.075);
    khukriGroup.add(handle);

    // Guard - brass/gold
    const guardGeometry = new THREE.TorusGeometry(0.2, 0.05, 8, 16);
    const guardMaterial = new THREE.MeshPhongMaterial({
      color: 0xffd700,
      shininess: 80
    });
    const guard = new THREE.Mesh(guardGeometry, guardMaterial);
    guard.position.set(0.1, -1.4, 0.075);
    guard.rotation.x = Math.PI / 2;
    khukriGroup.add(guard);

    // Pommel - decorative end
    const pommelGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const pommelMaterial = new THREE.MeshPhongMaterial({
      color: 0xffd700,
      shininess: 80
    });
    const pommel = new THREE.Mesh(pommelGeometry, pommelMaterial);
    pommel.position.set(0.075, -2.2, 0.075);
    khukriGroup.add(pommel);

    khukriGroup.position.set(0, 0, 0);
    khukriGroup.rotation.set(-Math.PI / 6, Math.PI / 4, 0);
    scene.add(khukriGroup);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      khukriGroup.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      khukriGroup.rotation.z = scrollPercent * Math.PI * 2;
      khukriGroup.rotation.x = -Math.PI / 6 + scrollPercent * Math.PI;
      khukriGroup.position.y = scrollPercent * 3;
      camera.position.z = 5 - scrollPercent * 2;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-screen pointer-events-none z-0"
      style={{ opacity: 0.3 }}
    />
  );
}