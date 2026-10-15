/**
 * DEV CYCLE - 3D Showroom WebGL Engine
 * Built with Three.js (Procedural High-Detail Aero E-Bicycle & Studio Environment)
 */

class BicycleShowroom3D {
  constructor(canvasContainerId, options = {}) {
    this.container = document.getElementById(canvasContainerId);
    if (!this.container) return;

    this.options = Object.assign({
      autoRotate: true,
      enableZoom: true,
      showGrid: true,
      initialColor: "#111315",
      accentColor: "#10b981"
    }, options);

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.bicycleGroup = null;
    this.materials = {};
    this.particles = null;
    this.clock = new THREE.Clock();
    this.isRotating = this.options.autoRotate;
    this.targetCameraPos = null;
    this.targetLookAt = new THREE.Vector3(0, 0.9, 0);

    // Hotspot coordinates in 3D model space
    this.hotspots = [
      { id: 'spot-frame', name: 'Monocoque Aero Frame', desc: 'Toray T1100 1K high-modulus carbon with internal cable routing', pos: new THREE.Vector3(0, 1.15, 0.1) },
      { id: 'spot-cockpit', name: 'Integrated Aero Cockpit', desc: 'One-piece carbon handlebar with flush GPS mount & internal Di2 junction', pos: new THREE.Vector3(0.75, 1.45, 0) },
      { id: 'spot-drivetrain', name: 'Di2 Electronic Drivetrain', desc: 'Shimano Dura-Ace 12-Speed wireless electronic shifting & hollow carbon crank', pos: new THREE.Vector3(-0.15, 0.5, 0.12) },
      { id: 'spot-battery', name: 'Smart Battery & Mid-Drive', desc: '720Wh high-density battery cell integrated flush within aerodynamic downtube', pos: new THREE.Vector3(0.25, 0.85, 0) },
      { id: 'spot-wheels', name: 'DT Swiss ARC 1100 Wheels', desc: '50mm deep-dish aero rims laced to ceramic bearing Ratchet EXP hubs', pos: new THREE.Vector3(-0.95, 0.65, 0) },
      { id: 'spot-brakes', name: 'Ice-Tech Disc Brakes', desc: '160mm ventilated stainless steel / alloy heat dissipation rotors', pos: new THREE.Vector3(0.95, 0.65, 0.08) }
    ];

    this.init();
  }

  init() {
    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) throw new Error('WebGL unsupported');
    } catch (e) {
      this.showFallback();
      return;
    }

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || (window.innerHeight * 0.75);

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x090a0f, 0.045);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(2.9, 1.4, 3.2);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.target.set(0, 0.85, 0);
      this.controls.minDistance = 1.8;
      this.controls.maxDistance = 6.5;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't flip below ground
      this.controls.enableZoom = this.options.enableZoom;
    }

    // 5. Materials
    this.initMaterials();

    // 6. Lighting
    this.setupLighting();

    // 7. Environment & Pedestal
    this.setupShowroomEnvironment();

    // 8. Build 3D Bicycle
    this.buildBicycleModel();

    // 9. Floating dust particles
    this.setupParticles();

    // 10. Event listeners
    window.addEventListener('resize', this.onResize.bind(this));
    this.setupMouseInteractivity();

    // 11. Render loop
    this.animate();
  }

  initMaterials() {
    // Premium Automotive Clearcoat Carbon Frame
    this.materials.frame = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.options.initialColor),
      metalness: 0.2,
      roughness: 0.25,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
      reflectivity: 0.85
    });

    // Electric Accent Material
    this.materials.accent = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.options.accentColor),
      roughness: 0.2,
      metalness: 0.4,
      emissive: new THREE.Color(this.options.accentColor),
      emissiveIntensity: 0.4
    });

    // Anodized Dark Metal (Hubs, Derailleurs, Stems)
    this.materials.darkMetal = new THREE.MeshStandardMaterial({
      color: 0x181a1d,
      metalness: 0.9,
      roughness: 0.28
    });

    // Polished Silver Chrome (Brake Rotors, Cassette, Chain)
    this.materials.chrome = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      metalness: 0.95,
      roughness: 0.15
    });

    // Deep-Dish Matte Carbon Fiber (Wheels)
    this.materials.carbonWheels = new THREE.MeshStandardMaterial({
      color: 0x141618,
      metalness: 0.35,
      roughness: 0.4
    });

    // Matte Tire Rubber
    this.materials.rubber = new THREE.MeshStandardMaterial({
      color: 0x1b1c1e,
      roughness: 0.88,
      metalness: 0.05
    });

    // Glowing LED Projector Headlamp
    this.materials.glowLed = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xccff00,
      emissiveIntensity: 2.2,
      roughness: 0.1
    });

    // Battery Indicator LEDs
    this.materials.batteryLeds = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.8,
      roughness: 0.2
    });

    // Leather Saddle Material
    this.materials.saddle = new THREE.MeshStandardMaterial({
      color: 0x242426,
      roughness: 0.65,
      metalness: 0.1
    });
  }

  setupLighting() {
    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(ambientLight);

    // Main Studio Key Spotlight (Dramatic high angle)
    const keyLight = new THREE.SpotLight(0xffffff, 2.8);
    keyLight.position.set(3.5, 4.8, 3.2);
    keyLight.angle = Math.PI / 4;
    keyLight.penumbra = 0.6;
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 12;
    keyLight.shadow.bias = -0.001;
    this.scene.add(keyLight);

    // Rim Backlight (Electric Neon Tinted for Porsche/Apple edge glow)
    const rimLight = new THREE.DirectionalLight(0x10b981, 2.2);
    rimLight.position.set(-4.5, 3.2, -3.5);
    this.scene.add(rimLight);

    // Soft Blue Fill Light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    fillLight.position.set(2.0, 1.8, -3.5);
    this.scene.add(fillLight);

    // Showroom Floor Underglow
    const floorGlow = new THREE.PointLight(0x10b981, 1.5, 5);
    floorGlow.position.set(0, 0.15, 0);
    this.scene.add(floorGlow);
  }

  setupShowroomEnvironment() {
    // Reflective Circular Showroom Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(2.3, 2.4, 0.08, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e12,
      roughness: 0.2,
      metalness: 0.85
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.04;
    pedestal.receiveShadow = true;
    this.scene.add(pedestal);

    // Neon Accent Ring around pedestal
    const ringGeo = new THREE.RingGeometry(2.32, 2.37, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    this.scene.add(ring);

    // Outer subtle concentric ring
    const outerRingGeo = new THREE.RingGeometry(2.95, 2.97, 64);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.001;
    this.scene.add(outerRing);

    // High-tech floor grid
    if (this.options.showGrid) {
      const grid = new THREE.GridHelper(10, 20, 0x10b981, 0x1a202c);
      grid.position.y = -0.01;
      grid.material.opacity = 0.22;
      grid.material.transparent = true;
      this.scene.add(grid);
    }
  }

  buildBicycleModel() {
    this.bicycleGroup = new THREE.Group();
    const frameMat = this.materials.frame;
    const accentMat = this.materials.accent;
    const darkMetal = this.materials.darkMetal;
    const chrome = this.materials.chrome;
    const carbonWheels = this.materials.carbonWheels;
    const rubber = this.materials.rubber;

    // Helper function to create cylindrical tubes between two 3D points
    const createTube = (p1, p2, radius, material, radialSegments = 16) => {
      const v1 = new THREE.Vector3(...p1);
      const v2 = new THREE.Vector3(...p2);
      const distance = v1.distanceTo(v2);
      const geo = new THREE.CylinderGeometry(radius, radius, distance, radialSegments);
      const mesh = new THREE.Mesh(geo, material);
      mesh.castShadow = true;

      // Position halfway and orient along vector
      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      mesh.position.copy(mid);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v2.clone().sub(v1).normalize());
      return mesh;
    };

    // KEY BICYCLE COORDINATES (x: length forward/back, y: height, z: width)
    // Rear axle at x = -0.95, Front axle at x = 0.95, Bottom Bracket at x = -0.08, y = 0.42
    const rearAxle = [-0.95, 0.48, 0];
    const frontAxle = [0.95, 0.48, 0];
    const bottomBracket = [-0.08, 0.42, 0];
    const headTubeBottom = [0.72, 1.15, 0];
    const headTubeTop = [0.65, 1.35, 0];
    const seatTubeTop = [-0.28, 1.25, 0];
    const saddlePoint = [-0.35, 1.48, 0];

    // ================= 1. FRAME TUBES (AERO CARBON) =================
    // Top Tube (Aero hydroformed)
    const topTube = createTube(seatTubeTop, headTubeTop, 0.038, frameMat);
    topTube.scale.set(0.65, 1.0, 1.0); // Aero profile
    this.bicycleGroup.add(topTube);

    // Top Tube Accent Stripe
    const stripe = createTube([-0.25, 1.26, 0.02], [0.62, 1.36, 0.02], 0.007, accentMat);
    this.bicycleGroup.add(stripe);

    // Down Tube (Thicker for battery housing & aerodynamic leading edge)
    const downTube = createTube(bottomBracket, headTubeBottom, 0.052, frameMat);
    downTube.scale.set(0.7, 1.0, 1.2);
    this.bicycleGroup.add(downTube);

    // Integrated Battery Module Indicator Slot on Down Tube
    const batterySlotGeo = new THREE.BoxGeometry(0.015, 0.48, 0.035);
    const batterySlot = new THREE.Mesh(batterySlotGeo, this.materials.batteryLeds);
    batterySlot.position.set(0.24, 0.74, 0.038);
    batterySlot.rotation.z = -0.68;
    this.bicycleGroup.add(batterySlot);

    // Down Tube Lower Accent Decal
    const downDecal = createTube([0.02, 0.54, 0.035], [0.55, 1.02, 0.035], 0.008, accentMat);
    this.bicycleGroup.add(downDecal);

    // Seat Tube
    const seatTube = createTube(bottomBracket, seatTubeTop, 0.036, frameMat);
    this.bicycleGroup.add(seatTube);

    // Seatpost
    const seatPost = createTube(seatTubeTop, saddlePoint, 0.026, darkMetal);
    this.bicycleGroup.add(seatPost);

    // Head Tube
    const headTube = createTube(headTubeBottom, headTubeTop, 0.042, frameMat);
    this.bicycleGroup.add(headTube);

    // Chain Stays (Left & Right to Rear Axle)
    const chainStayL = createTube(bottomBracket, [-0.95, 0.48, 0.065], 0.019, frameMat);
    const chainStayR = createTube(bottomBracket, [-0.95, 0.48, -0.065], 0.019, frameMat);
    this.bicycleGroup.add(chainStayL, chainStayR);

    // Seat Stays (Left & Right from seat junction to Rear Axle)
    const seatStayL = createTube([-0.24, 1.15, 0], [-0.95, 0.48, 0.065], 0.018, frameMat);
    const seatStayR = createTube([-0.24, 1.15, 0], [-0.95, 0.48, -0.065], 0.018, frameMat);
    this.bicycleGroup.add(seatStayL, seatStayR);

    // ================= 2. FRONT FORK (CARBON BLADES) =================
    const forkCrown = [0.72, 1.15, 0];
    const forkBladeL = createTube(forkCrown, [0.95, 0.48, 0.065], 0.024, frameMat);
    const forkBladeR = createTube(forkCrown, [0.95, 0.48, -0.065], 0.024, frameMat);
    forkBladeL.scale.set(0.6, 1.0, 1.1);
    forkBladeR.scale.set(0.6, 1.0, 1.1);
    this.bicycleGroup.add(forkBladeL, forkBladeR);

    // Fork Accent Highlights
    const forkTipL = createTube([0.88, 0.65, 0.068], [0.94, 0.50, 0.068], 0.01, accentMat);
    const forkTipR = createTube([0.88, 0.65, -0.068], [0.94, 0.50, -0.068], 0.01, accentMat);
    this.bicycleGroup.add(forkTipL, forkTipR);

    // ================= 3. COCKPIT & HANDLEBARS =================
    // Stem
    const stem = createTube(headTubeTop, [0.76, 1.38, 0], 0.026, darkMetal);
    this.bicycleGroup.add(stem);

    // Handlebar Top Crossbar
    const barCenter = [0.76, 1.38, 0];
    const barGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.44, 16);
    const barMesh = new THREE.Mesh(barGeo, darkMetal);
    barMesh.rotation.x = Math.PI / 2;
    barMesh.position.set(0.76, 1.38, 0);
    this.bicycleGroup.add(barMesh);

    // Drop Bar Curvatures (Aero Road Drops)
    const createDropCurve = (zOffset) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.76, 1.38, zOffset),
        new THREE.Vector3(0.85, 1.36, zOffset),
        new THREE.Vector3(0.88, 1.26, zOffset),
        new THREE.Vector3(0.80, 1.20, zOffset),
        new THREE.Vector3(0.68, 1.19, zOffset)
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.014, 12, false);
      const mesh = new THREE.Mesh(tubeGeo, darkMetal);
      mesh.castShadow = true;
      return mesh;
    };
    this.bicycleGroup.add(createDropCurve(0.22));
    this.bicycleGroup.add(createDropCurve(-0.22));

    // Integrated Futuristic GPS Computer & Headlamp Mount
    const gpsGeo = new THREE.BoxGeometry(0.06, 0.016, 0.04);
    const gpsMesh = new THREE.Mesh(gpsGeo, darkMetal);
    gpsMesh.position.set(0.84, 1.39, 0);
    gpsMesh.rotation.z = -0.15;
    this.bicycleGroup.add(gpsMesh);

    // GPS Screen
    const gpsScreenGeo = new THREE.PlaneGeometry(0.048, 0.032);
    const gpsScreenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const gpsScreen = new THREE.Mesh(gpsScreenGeo, gpsScreenMat);
    gpsScreen.position.set(0.84, 1.40, 0);
    gpsScreen.rotation.x = -Math.PI / 2;
    gpsScreen.rotation.y = 0.15;
    this.bicycleGroup.add(gpsScreen);

    // LED Projector Lens
    const ledGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.02, 16);
    const ledMesh = new THREE.Mesh(ledGeo, this.materials.glowLed);
    ledMesh.rotation.z = Math.PI / 2;
    ledMesh.position.set(0.85, 1.34, 0);
    this.bicycleGroup.add(ledMesh);

    // ================= 4. SADDLE =================
    const saddleShape = new THREE.Shape();
    saddleShape.moveTo(-0.16, 0);
    saddleShape.quadraticCurveTo(-0.06, 0.08, 0.15, 0.03);
    saddleShape.quadraticCurveTo(0.18, 0, 0.15, -0.03);
    saddleShape.quadraticCurveTo(-0.06, -0.08, -0.16, 0);

    const extrudeSettings = { depth: 0.035, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.015, bevelThickness: 0.015 };
    const saddleGeo = new THREE.ExtrudeGeometry(saddleShape, extrudeSettings);
    const saddleMesh = new THREE.Mesh(saddleGeo, this.materials.saddle);
    saddleMesh.rotation.x = -Math.PI / 2;
    saddleMesh.rotation.y = -0.05;
    saddleMesh.position.set(-0.35, 1.48, 0);
    saddleMesh.castShadow = true;
    this.bicycleGroup.add(saddleMesh);

    // ================= 5. WHEELS & TIRES & ROTORS =================
    const buildWheelAssembly = (xPos, isRear = false) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(xPos, 0.48, 0);

      // Tire (Rubber outer torus)
      const tireGeo = new THREE.TorusGeometry(0.46, 0.024, 16, 64);
      const tireMesh = new THREE.Mesh(tireGeo, rubber);
      tireMesh.castShadow = true;
      wheelGroup.add(tireMesh);

      // Deep-Dish Aero Carbon Rim (50mm depth)
      const rimGeo = new THREE.TorusGeometry(0.42, 0.038, 16, 64);
      const rimMesh = new THREE.Mesh(rimGeo, carbonWheels);
      rimMesh.castShadow = true;
      wheelGroup.add(rimMesh);

      // Rim Decal / Lime Accent Line
      const rimStripeGeo = new THREE.RingGeometry(0.395, 0.405, 32);
      const rimStripeMeshL = new THREE.Mesh(rimStripeGeo, accentMat);
      rimStripeMeshL.position.z = 0.019;
      const rimStripeMeshR = new THREE.Mesh(rimStripeGeo, accentMat);
      rimStripeMeshR.position.z = -0.019;
      wheelGroup.add(rimStripeMeshL, rimStripeMeshR);

      // Hub (Anodized dark metal)
      const hubGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.12, 16);
      const hubMesh = new THREE.Mesh(hubGeo, darkMetal);
      hubMesh.rotation.x = Math.PI / 2;
      wheelGroup.add(hubMesh);

      // Spokes (Radial pattern)
      const spokeCount = 20;
      for (let i = 0; i < spokeCount; i++) {
        const angle = (i / spokeCount) * Math.PI * 2;
        const spokeGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.39, 6);
        const spoke = new THREE.Mesh(spokeGeo, chrome);
        spoke.position.set(Math.cos(angle) * 0.20, Math.sin(angle) * 0.20, (i % 2 === 0 ? 0.02 : -0.02));
        spoke.rotation.z = angle + Math.PI / 2;
        wheelGroup.add(spoke);
      }

      // Disc Brake Rotor (Stainless Steel Ice-Tech)
      const rotorGeo = new THREE.RingGeometry(0.06, 0.12, 32);
      const rotorMesh = new THREE.Mesh(rotorGeo, chrome);
      rotorMesh.position.z = 0.052;
      wheelGroup.add(rotorMesh);

      // Disc Caliper
      const caliperGeo = new THREE.BoxGeometry(0.045, 0.065, 0.035);
      const caliperMesh = new THREE.Mesh(caliperGeo, darkMetal);
      caliperMesh.position.set(-0.08, 0.08, 0.055);
      wheelGroup.add(caliperMesh);

      // If Rear Wheel, Add 12-Speed Cassette
      if (isRear) {
        for (let c = 0; c < 6; c++) {
          const cogGeo = new THREE.CylinderGeometry(0.04 + c * 0.014, 0.04 + c * 0.014, 0.005, 24);
          const cog = new THREE.Mesh(cogGeo, chrome);
          cog.rotation.x = Math.PI / 2;
          cog.position.z = -0.035 - c * 0.006;
          wheelGroup.add(cog);
        }
      }

      return wheelGroup;
    };

    const frontWheel = buildWheelAssembly(0.95, false);
    const rearWheel = buildWheelAssembly(-0.95, true);
    this.bicycleGroup.add(frontWheel, rearWheel);
    this.wheels = [frontWheel, rearWheel];

    // ================= 6. BOTTOM BRACKET & DRIVETRAIN =================
    const bbGroup = new THREE.Group();
    bbGroup.position.set(-0.08, 0.42, 0);

    // BB Axle
    const bbAxleGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.14, 16);
    const bbAxle = new THREE.Mesh(bbAxleGeo, darkMetal);
    bbAxle.rotation.x = Math.PI / 2;
    bbGroup.add(bbAxle);

    // 54T Aero Chainring (Carbon + Silver Teeth)
    const chainringGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.006, 32);
    const chainring = new THREE.Mesh(chainringGeo, darkMetal);
    chainring.rotation.x = Math.PI / 2;
    chainring.position.z = -0.045;
    bbGroup.add(chainring);

    // Crank Arms (Left & Right)
    const crankLGeo = new THREE.BoxGeometry(0.028, 0.17, 0.015);
    const crankL = new THREE.Mesh(crankLGeo, darkMetal);
    crankL.position.set(0, -0.065, 0.068);
    bbGroup.add(crankL);

    const crankRGeo = new THREE.BoxGeometry(0.028, 0.17, 0.015);
    const crankR = new THREE.Mesh(crankRGeo, darkMetal);
    crankR.position.set(0, 0.065, -0.068);
    bbGroup.add(crankR);

    // Pedals (Clipless SPD)
    const pedalLGeo = new THREE.BoxGeometry(0.04, 0.016, 0.065);
    const pedalL = new THREE.Mesh(pedalLGeo, chrome);
    pedalL.position.set(0, -0.14, 0.10);
    bbGroup.add(pedalL);

    const pedalRGeo = new THREE.BoxGeometry(0.04, 0.016, 0.065);
    const pedalR = new THREE.Mesh(pedalRGeo, chrome);
    pedalR.position.set(0, 0.14, -0.10);
    bbGroup.add(pedalR);

    // Di2 Electronic Rear Derailleur
    const rdGeo = new THREE.BoxGeometry(0.07, 0.09, 0.035);
    const rd = new THREE.Mesh(rdGeo, darkMetal);
    rd.position.set(-0.92, 0.38, -0.065);
    this.bicycleGroup.add(rd);

    // Mid-drive motor housing bulge (integrated around BB)
    const motorGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.11, 24);
    const motorMesh = new THREE.Mesh(motorGeo, darkMetal);
    motorMesh.rotation.x = Math.PI / 2;
    motorMesh.position.set(-0.04, 0.45, 0);
    bbGroup.add(motorMesh);

    this.bicycleGroup.add(bbGroup);

    // Center bicycle slightly for optimal viewport framing
    this.bicycleGroup.position.set(0, 0.05, 0);
    this.scene.add(this.bicycleGroup);
  }

  setupParticles() {
    // 150 atmospheric floating micro particles
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = Math.random() * 3.5 + 0.2;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.035,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  setupMouseInteractivity() {
    let isDragging = false;
    let prevMouseX = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX || (e.touches && e.touches[0].clientX);
    };

    const onPointerMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      if (isDragging && this.bicycleGroup) {
        const deltaX = clientX - prevMouseX;
        this.bicycleGroup.rotation.y += deltaX * 0.008;
        prevMouseX = clientX;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    this.container.addEventListener('mousedown', onPointerDown);
    this.container.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.container.addEventListener('touchstart', onPointerDown, { passive: true });
    this.container.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
  }

  // Live Color Switcher API
  setBicycleColor(hexColor, name = "") {
    if (!this.materials.frame) return;
    const targetColor = new THREE.Color(hexColor);
    
    // Smooth transition or direct update
    this.materials.frame.color.set(targetColor);

    // If platinum or chrome, adjust metalness for liquid metal effect
    if (hexColor.toLowerCase() === "#e2e8f0" || hexColor.toLowerCase() === "#cbd5e1") {
      this.materials.frame.metalness = 0.85;
      this.materials.frame.roughness = 0.12;
    } else {
      this.materials.frame.metalness = 0.2;
      this.materials.frame.roughness = 0.25;
    }

    // Trigger visual toast or UI label update
    const labelEl = document.getElementById('active-color-name');
    if (labelEl && name) {
      labelEl.textContent = name;
    }
  }

  // Camera Presets API
  setCameraPreset(preset) {
    if (!this.camera) return;

    switch (preset) {
      case 'front':
        this.targetCameraPos = new THREE.Vector3(2.4, 1.25, 1.5);
        this.targetLookAt = new THREE.Vector3(0.5, 1.1, 0);
        break;
      case 'drivetrain':
        this.targetCameraPos = new THREE.Vector3(-0.35, 0.7, -1.6);
        this.targetLookAt = new THREE.Vector3(-0.15, 0.45, 0);
        break;
      case 'wheels':
        this.targetCameraPos = new THREE.Vector3(-1.8, 0.8, 1.8);
        this.targetLookAt = new THREE.Vector3(-0.8, 0.5, 0);
        break;
      case 'cockpit':
        this.targetCameraPos = new THREE.Vector3(1.2, 1.7, 0.8);
        this.targetLookAt = new THREE.Vector3(0.7, 1.35, 0);
        break;
      case 'all':
      default:
        this.targetCameraPos = new THREE.Vector3(2.9, 1.4, 3.2);
        this.targetLookAt = new THREE.Vector3(0, 0.85, 0);
        break;
    }
  }

  toggleRotation() {
    this.isRotating = !this.isRotating;
    return this.isRotating;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();

    // Elegant 360 rotation when enabled
    if (this.isRotating && this.bicycleGroup) {
      this.bicycleGroup.rotation.y += delta * 0.35;
    }

    // Gentle particle floating
    if (this.particles) {
      this.particles.rotation.y += delta * 0.05;
    }

    // Camera preset smooth interpolation
    if (this.targetCameraPos) {
      this.camera.position.lerp(this.targetCameraPos, 0.06);
      if (this.controls) {
        this.controls.target.lerp(this.targetLookAt, 0.06);
      }
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.05) {
        this.targetCameraPos = null;
      }
    }

    if (this.controls) {
      this.controls.update();
    }

    // Update 2D hotspot overlays if attached
    this.updateHotspotPositions();

    this.renderer.render(this.scene, this.camera);
  }

  updateHotspotPositions() {
    const container = document.getElementById('hotspots-overlay');
    if (!container || !this.bicycleGroup) return;
    if (this.container.id !== 'studio-3d-canvas') return;

    this.hotspots.forEach(spot => {
      const pin = document.getElementById(spot.id);
      if (!pin) return;

      // Transform 3D coordinate with bicycleGroup rotation & position
      const worldPos = spot.pos.clone();
      worldPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.bicycleGroup.rotation.y);
      worldPos.add(this.bicycleGroup.position);

      // Project to 2D screen coordinates
      const screenPos = worldPos.clone().project(this.camera);

      // Check if behind camera
      if (screenPos.z > 1) {
        pin.style.display = 'none';
        return;
      }

      const x = (screenPos.x * 0.5 + 0.5) * this.container.clientWidth;
      const y = (-(screenPos.y * 0.5) + 0.5) * this.container.clientHeight;

      pin.style.display = 'block';
      pin.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  showFallback() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="webgl-fallback" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; position:relative;">
        <img src="assets/images/hero_ebike.jpg" alt="Dev Cycle Performance E-Bike" style="max-width:100%; max-height:100%; object-fit:contain; filter:drop-shadow(0 20px 40px rgba(0,0,0,0.8));">
        <div class="fallback-badge" style="position:absolute; bottom:20px; left:20px; background:rgba(0,0,0,0.7); backdrop-filter:blur(8px); padding:8px 16px; border-radius:30px; border:1px solid rgba(16,185,129,0.3); font-size:12px; color:#10b981;">
          Photorealistic Studio Render Mode Active
        </div>
      </div>
    `;
  }
}

// Global hook
window.BicycleShowroom3D = BicycleShowroom3D;
