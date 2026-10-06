/* 3D globe — Blue Marble + Tamil Nadu marker */
(function () {
  const canvas = document.getElementById("globe-canvas");
  if (!canvas || typeof THREE === "undefined") return;

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
  const material = new THREE.MeshPhongMaterial({
    color: 0x1a4a7a,
    emissive: 0x051020,
    shininess: 12,
    specular: 0x222222
  });
  earthGroup.add(new THREE.Mesh(geometry, material));

  const loader = new THREE.TextureLoader();
  loader.crossOrigin = "anonymous";
  const textureUrls = [
    "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg",
    "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
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

  earthGroup.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.045, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x8fbfc8, transparent: true, opacity: 0.16, side: THREE.BackSide })
  ));
  earthGroup.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.09, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xb7cfc0, transparent: true, opacity: 0.07, side: THREE.BackSide })
  ));

  function latLon(lat, lon, r) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }
  const tn = latLon(11.1, 78.7, 1.02);
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xb7cfc0 })
  );
  marker.position.copy(tn);
  earthGroup.add(marker);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.05);
  sun.position.set(4, 2, 3);
  scene.add(sun);

  let isDragging = false, prevX = 0, prevY = 0;
  let targetRotY = 0.85, targetRotX = 0.18, rotY = 0.85, rotX = 0.18;
  let autoRotate = true, idleTimer;

  canvas.addEventListener("pointerdown", function (e) {
    isDragging = true; autoRotate = false; prevX = e.clientX; prevY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointerup", function (e) {
    isDragging = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { autoRotate = true; }, 2800);
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!isDragging) return;
    targetRotY += (e.clientX - prevX) * 0.005;
    targetRotX += (e.clientY - prevY) * 0.004;
    targetRotX = Math.max(-0.9, Math.min(0.9, targetRotX));
    prevX = e.clientX; prevY = e.clientY;
  });

  window.addEventListener("resize", function () {
    width = container.clientWidth || 400;
    height = container.clientHeight || 400;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function animate() {
    requestAnimationFrame(animate);
    if (!reduceMotion) {
      if (autoRotate) targetRotY += 0.0032;
      rotY += (targetRotY - rotY) * 0.06;
      rotX += (targetRotX - rotX) * 0.06;
      earthGroup.rotation.y = rotY;
      earthGroup.rotation.x = rotX;
    }
    renderer.render(scene, camera);
  }
  animate();
})();
