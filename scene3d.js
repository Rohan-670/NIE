/**
 * HEALIO - Hands-free Hospital Appointment Booking System
 * 3D Background Scene (Three.js r128 pinned)
 * 
 * Features:
 * - Rounded 3D Medical Cross with calming teal/cyan materials
 * - Low-overhead render loop (<60fps performance budget)
 * - Motion toggle ("ಚಲನೆ ನಿಲ್ಲಿಸಿ" / "ಚಲನೆ ಪ್ರಾರಂಭಿಸಿ")
 * - Automatic detection of `prefers-reduced-motion`
 * - WebGL feature detection and graceful CSS-gradient fallback
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Healio3D = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let container = null;
  let scene = null;
  let camera = null;
  let renderer = null;
  let crossGroup = null;
  let animationFrameId = null;
  let isMotionEnabled = true;
  let isInitialized = false;

  /**
   * Check if WebGL is supported by the browser
   */
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Create a rounded 3D medical cross mesh
   */
  function createMedicalCross() {
    const THREE = window.THREE;
    const group = new THREE.Group();

    // Soft teal metallic/phong material with smooth reflections
    const crossMaterial = new THREE.MeshPhongMaterial({
      color: 0x14807a,
      emissive: 0x052d2b,
      specular: 0x8fe5de,
      shininess: 90,
      transparent: true,
      opacity: 0.88,
      flatShading: false
    });

    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x62d4ca,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });

    // Vertical arm of medical cross
    const vertGeo = new THREE.BoxGeometry(1.0, 3.0, 0.6);
    const vertMesh = new THREE.Mesh(vertGeo, crossMaterial);

    // Horizontal arm of medical cross
    const horizGeo = new THREE.BoxGeometry(3.0, 1.0, 0.6);
    const horizMesh = new THREE.Mesh(horizGeo, crossMaterial);

    // Subtle outer halo ring for medical sanctity
    const ringGeo = new THREE.TorusGeometry(2.3, 0.05, 16, 60);
    const ringMesh = new THREE.Mesh(ringGeo, haloMaterial);
    ringMesh.rotation.x = Math.PI / 6;

    group.add(vertMesh);
    group.add(horizMesh);
    group.add(ringMesh);

    return group;
  }

  /**
   * Initialize Three.js scene
   */
  function init(containerElement) {
    container = containerElement;
    if (!container) return false;

    // Check if Three.js library is loaded
    if (!window.THREE) {
      console.warn('Three.js not loaded. Falling back to CSS gradient.');
      container.classList.add('fallback-gradient');
      return false;
    }

    // Check WebGL availability
    if (!isWebGLAvailable()) {
      console.warn('WebGL not supported. Falling back to CSS gradient.');
      container.classList.add('fallback-gradient');
      return false;
    }

    try {
      const THREE = window.THREE;

      // 1. Scene
      scene = new THREE.Scene();

      // 2. Camera
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || 400;
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 7.5);

      // 3. Renderer with antialias and alpha transparency
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;

      container.appendChild(renderer.domElement);

      // 4. Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0xa5f3eb, 1.2);
      dirLight1.position.set(5, 8, 6);
      scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x0e5d57, 0.6);
      dirLight2.position.set(-6, -4, -4);
      scene.add(dirLight2);

      // 5. 3D Cross Mesh
      crossGroup = createMedicalCross();
      scene.add(crossGroup);

      // 6. Check user's motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        isMotionEnabled = false;
      }

      // Handle window resize
      window.addEventListener('resize', onWindowResize, { passive: true });

      isInitialized = true;
      render();
      return true;
    } catch (e) {
      console.warn('Three.js initialization failed:', e);
      if (container) {
        container.classList.add('fallback-gradient');
      }
      return false;
    }
  }

  /**
   * Handle responsive resize
   */
  function onWindowResize() {
    if (!renderer || !camera || !container) return;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 400;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  /**
   * Animation render loop
   */
  function render(time) {
    if (!isInitialized || !renderer || !scene || !camera) return;

    if (isMotionEnabled && crossGroup) {
      const t = (time || 0) * 0.001;
      // Gentle floating and subtle rotation
      crossGroup.rotation.y = t * 0.45;
      crossGroup.rotation.x = Math.sin(t * 0.3) * 0.18;
      crossGroup.rotation.z = Math.cos(t * 0.25) * 0.08;
      crossGroup.position.y = Math.sin(t * 0.7) * 0.12;
    }

    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(render);
  }

  /**
   * Toggle motion state on / off
   */
  function toggleMotion() {
    isMotionEnabled = !isMotionEnabled;
    return isMotionEnabled;
  }

  /**
   * Set motion state explicitly
   */
  function setMotion(enabled) {
    isMotionEnabled = Boolean(enabled);
    return isMotionEnabled;
  }

  /**
   * Dispose and cleanup
   */
  function destroy() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    window.removeEventListener('resize', onWindowResize);
    if (renderer && renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    isInitialized = false;
  }

  return {
    init,
    toggleMotion,
    setMotion,
    isMotionEnabled: () => isMotionEnabled,
    resize: onWindowResize,
    destroy
  };
});
