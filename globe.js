/* ── 3D GLOBE (Three.js) — Geospatial portfolio hero ── */
(function () {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const container = canvas.parentElement;
  let width = container.clientWidth || 400;
  let height = container.clientHeight || 400;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 2.6;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const earthGroup = new THREE.Group();
  scene.add(earthGroup);

  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshPhongMaterial({
    color: 0x1a6bb5,
    emissive: 0x0a2040,
    shininess: 18,
    specular: 0x444444
  });
  const earth = new THREE.Mesh(geometry, material);
  earthGroup.add(earth);

  // Atmosphere
  const atmoGeo = new THREE.SphereGeometry(1.08, 64, 64);
  const atmoMat = new THREE.MeshBasicMaterial({
    color: 0x4fc3f7,
    transparent: true,
    opacity: 0.14,
    side: THREE.BackSide
  });
  earthGroup.add(new THREE.Mesh(atmoGeo, atmoMat));

  // Subtle wireframe grid (geospatial feel)
  const wireGeo = new THREE.SphereGeometry(1.003, 36, 24);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.07
  });
  earthGroup.add(new THREE.Mesh(wireGeo, wireMat));

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.48));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);
  const rim = new THREE.DirectionalLight(0x39c6d6, 0.4);
  rim.position.set(-3, -1, -4);
  scene.add(rim);

  // Satellite
  const satGroup = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.04, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xe8e8e8, metalness: 0.6, roughness: 0.35 })
  );
  satGroup.add(body);
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x1B6CA8 });
  const panelL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.01), panelMat);
  panelL.position.x = -0.1;
  satGroup.add(panelL);
  const panelR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.01), panelMat);
  panelR.position.x = 0.1;
  satGroup.add(panelR);
  satGroup.position.set(1.45, 0, 0);
  scene.add(satGroup);

  // Accent light
  const accent = new THREE.PointLight(0xFFB000, 0.55, 2.2);
  accent.position.set(0.7, 0.5, 0.85);
  scene.add(accent);

  // Interaction
  let isDragging = false;
  let prevX = 0, prevY = 0;
  let targetRotY = 0.45, targetRotX = 0.12;
  let rotY = 0.45, rotX = 0.12;
  let autoRotate = true;

  canvas.addEventListener('pointerdown', function (e) {
    isDragging = true;
    autoRotate = false;
    prevX = e.clientX;
    prevY = e.clientY;
  });
  window.addEventListener('pointerup', function () { isDragging = false; });
  window.addEventListener('pointermove', function (e) {
    if (!isDragging) return;
    targetRotY += (e.clientX - prevX) * 0.005;
    targetRotX += (e.clientY - prevY) * 0.005;
    targetRotX = Math.max(-0.75, Math.min(0.75, targetRotX));
    prevX = e.clientX;
    prevY = e.clientY;
  });

  let idleTimer;
  canvas.addEventListener('pointerup', function () {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { autoRotate = true; }, 3500);
  });

  function onResize() {
    width = container.clientWidth || 400;
    height = container.clientHeight || 400;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let satAngle = 0;

  function animate() {
    requestAnimationFrame(animate);
    if (!reduceMotion) {
      if (autoRotate) targetRotY += 0.0022;
      rotY += (targetRotY - rotY) * 0.08;
      rotX += (targetRotX - rotX) * 0.08;
      earthGroup.rotation.y = rotY;
      earthGroup.rotation.x = rotX;

      satAngle += 0.009;
      satGroup.position.x = Math.cos(satAngle) * 1.45;
      satGroup.position.z = Math.sin(satAngle) * 1.45;
      satGroup.position.y = Math.sin(satAngle * 0.7) * 0.22;
      satGroup.lookAt(0, 0, 0);
    }
    renderer.render(scene, camera);
  }
  animate();
})();
