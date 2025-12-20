import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function ScrollAnimation3D() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Create a simple 3D mountain scene as placeholder
    const geometry = new THREE.ConeGeometry(2, 3, 4);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x8B4513,
      flatShading: true 
    });
    const mountain = new THREE.Mesh(geometry, material);
    mountain.position.set(0, -1, 0);
    scene.add(mountain);
    modelRef.current = mountain;

    // Add snow cap
    const snowGeometry = new THREE.ConeGeometry(1.5, 1, 4);
    const snowMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const snow = new THREE.Mesh(snowGeometry, snowMaterial);
    snow.position.set(0, 1, 0);
    mountain.add(snow);

    setLoading(false);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle scroll
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (modelRef.current) {
        modelRef.current.rotation.y = scrollPercent * Math.PI * 4;
        modelRef.current.position.y = -1 + scrollPercent * 2;
      }
      if (cameraRef.current) {
        cameraRef.current.position.z = 5 - scrollPercent * 2;
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed top-0 left-0 w-full h-screen pointer-events-none z-0"
      style={{ opacity: loading ? 0 : 1, transition: 'opacity 1s' }}
    />
  );
}