/* ── 3D GLOBE — NASA Blue Marble satellite view + smooth rotation ── */
(function () {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const container = canvas.parentElement;
  let width = container.clientWidth || 400;
  let height = container.clientHeight || 400;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 2.55;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const earthGroup = new THREE.Group();
  scene.add(earthGroup);

  const geometry = new THREE.SphereGeometry(1, 64, 64);

  // Fallback solid material while texture loads
  const material = new THREE.MeshPhongMaterial({
    color: 0x1a4a7a,
    emissive: 0x051020,
    shininess: 12,
    specular: 0x222222
  });
  const earth = new THREE.Mesh(geometry, material);
  earthGroup.add(earth);

  // Load NASA Blue Marble (satellite) texture
  const loader = new THREE.TextureLoader();
  loader.crossOrigin = 'anonymous';
  const textureUrls = [
    'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://cdn.jsdelivr.net/npm/three-globe@2.31.1/example/img/earth-day.jpg'
  ];

  function tryLoad(i) {
    if (i >= textureUrls.length) return;
    loader.load(
      textureUrls[i],
      function (tex) {
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        material.map = tex;
        material.color.set(0xffffff);
        material.needsUpdate = true;
      },
      undefined,
      function () { tryLoad(i + 1); }
    );
  }
  tryLoad(0);

  // Atmosphere glow
  const atmoGeo = new THREE.SphereGeometry(1.045, 64, 64);
  const atmoMat = new THREE.MeshBasicMaterial({
    color: 0x4fc3f7,
    transparent: true,
    opacity: 0.18,
    side: THREE.BackSide
  });
  earthGroup.add(new THREE.Mesh(atmoGeo, atmoMat));

  // Soft outer rim
  const rimGeo = new THREE.SphereGeometry(1.09, 48, 48);
  const rimMat = new THREE.MeshBasicMaterial({
    color: 0x88ccee,
    transparent: true,
    opacity: 0.06,
    side: THREE.BackSide
  });
  earthGroup.add(new THREE.Mesh(rimGeo, rimMat));

  // Lights — daylight style for satellite look
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const sun = new THREE.DirectionalLight(0xffffff, 1.05);
  sun.position.set(4, 2, 3);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x88aacc, 0.25);
  fill.position.set(-3, -1, -2);
  scene.add(fill);

  // Small orbiting satellite
  const satGroup = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.035, 0.035),
    new THREE.MeshStandardMaterial({ color: 0xe8e8e8, metalness: 0.7, roughness: 0.3 })
  );
  satGroup.add(body);
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x1a5a9a });
  const pL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.018, 0.008), panelMat);
  pL.position.x = -0.085;
  satGroup.add(pL);
  const pR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.018, 0.008), panelMat);
  pR.position.x = 0.085;
  satGroup.add(pR);
  scene.add(satGroup);

  // Interaction
  let isDragging = false;
  let prevX = 0, prevY = 0;
  let targetRotY = 0.35, targetRotX = 0.18;
  let rotY = 0.35, rotX = 0.18;
  let autoRotate = true;

  canvas.addEventListener('pointerdown', function (e) {
    isDragging = true;
    autoRotate = false;
    prevX = e.clientX;
    prevY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointerup', function (e) {
    isDragging = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!isDragging) return;
    targetRotY += (e.clientX - prevX) * 0.005;
    targetRotX += (e.clientY - prevY) * 0.004;
    targetRotX = Math.max(-0.9, Math.min(0.9, targetRotX));
    prevX = e.clientX;
    prevY = e.clientY;
  });
  canvas.addEventListener('pointerleave', function () { isDragging = false; });

  let idleTimer;
  canvas.addEventListener('pointerup', function () {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { autoRotate = true; }, 2800);
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
  let satAngle = 0.8;

  function animate() {
    requestAnimationFrame(animate);

    if (!reduceMotion) {
      // Continuous gentle rotation
      if (autoRotate) targetRotY += 0.0035;
      rotY += (targetRotY - rotY) * 0.06;
      rotX += (targetRotX - rotX) * 0.06;
      earthGroup.rotation.y = rotY;
      earthGroup.rotation.x = rotX;

      // Satellite orbit
      satAngle += 0.012;
      const r = 1.42;
      satGroup.position.x = Math.cos(satAngle) * r;
      satGroup.position.z = Math.sin(satAngle) * r;
      satGroup.position.y = Math.sin(satAngle * 0.6) * 0.28;
      satGroup.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
  }
  animate();
})();
