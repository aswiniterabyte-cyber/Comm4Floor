// Generates a fully self-contained, standalone offline HTML 3D Viewer file
export function generateStandaloneHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commercial Building 3D BIM Viewer (Offline Deliverable C)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1120; color: #f8fafc; overflow: hidden; }
    #canvas-container { width: 100vw; height: 100vh; display: block; }
    .header { position: absolute; top: 16px; left: 20px; z-index: 10; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); padding: 14px 20px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
    .header h1 { font-size: 16px; font-weight: 700; color: #38bdf8; margin-bottom: 4px; letter-spacing: -0.01em; }
    .header p { font-size: 12px; color: #94a3b8; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; font-size: 10px; font-weight: 700; margin-left: 6px; }
    .dock { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 10; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(14px); padding: 10px 20px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.15); display: flex; gap: 8px; align-items: center; max-width: 95vw; flex-wrap: wrap; justify-content: center; box-shadow: 0 20px 30px -10px rgba(0,0,0,0.6); }
    .btn { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; padding: 7px 13px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn:hover { background: #0284c7; color: #fff; border-color: #38bdf8; transform: translateY(-1px); }
    .btn.active { background: #0284c7; color: #fff; border-color: #38bdf8; }
    .slider-wrap { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600; color: #94a3b8; padding: 0 10px; border-left: 1px solid #334155; }
    input[type=range] { accent-color: #38bdf8; cursor: pointer; }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
  <div class="header">
    <h1>COMMERCIAL BUILDING 3D BIM VIEWER <span class="badge">DELIVERABLE C</span></h1>
    <p>Authoritative Scale 1:100 Model | G+3 Commercial Structure | Dual Staircases & Rear Garages</p>
  </div>

  <div id="canvas-container"></div>

  <div class="dock">
    <button class="btn" onclick="setView('front')">Front Elevation</button>
    <button class="btn" onclick="setView('rear')">Rear Elevation</button>
    <button class="btn" onclick="setView('left')">Left Elevation</button>
    <button class="btn" onclick="setView('right')">Right Elevation</button>
    <button class="btn" onclick="setView('top')">Top Aerial</button>
    <button class="btn" onclick="setView('corner')">3D Perspective</button>
    <button class="btn" onclick="setView('stairs')">Dual Stairs Focus</button>
    <button class="btn" onclick="setView('garages')">Rear 4 Garages</button>
    <button class="btn" id="btn-glass" onclick="toggleGlass()">Glass BIM</button>
    <div class="slider-wrap">
      <span>Exploded Floors:</span>
      <input type="range" min="0" max="100" value="0" oninput="setExplode(this.value / 100)">
    </div>
  </div>

  <script>
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.012);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(22, 18, 26);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 4.5, 0);

    // Architectural Lighting
    const sun = new THREE.DirectionalLight(0xfffaed, 1.8);
    sun.position.set(28, 45, 24);
    sun.castShadow = true;
    scene.add(sun);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    fillLight.position.set(-20, 20, -20);
    scene.add(fillLight);

    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.85);
    scene.add(hemi);

    // Site & Road Context
    const road = new THREE.Mesh(new THREE.PlaneGeometry(42, 10), new THREE.MeshStandardMaterial({ color: 0x1e2229, roughness: 0.8 }));
    road.rotation.x = -Math.PI / 2;
    road.position.set(1.5, 0.01, 15.5);
    scene.add(road);

    const site = new THREE.Mesh(new THREE.BoxGeometry(32, 0.2, 40), new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 }));
    site.position.set(1.5, -0.1, 0);
    scene.add(site);

    // Floor Groups
    const gFloor = new THREE.Group();
    const fFloor = new THREE.Group();
    const uFloor = new THREE.Group();
    const rFloor = new THREE.Group();
    scene.add(gFloor);
    scene.add(fFloor);
    scene.add(uFloor);
    scene.add(rFloor);

    // Architectural Materials
    const panelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5, metalness: 0.1 });
    const colMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.5 });
    const fasciaMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.4 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x60a5fa, transmission: 0.5, opacity: 0.85, transparent: true, roughness: 0.1, metalness: 0.2 });
    const floorTileMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
    const stairTreadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
    const carMatWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.3 });
    const carMatBlue = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.2, metalness: 0.4 });
    const carMatDark = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.4 });

    // Custom Footprint Slab with Stairwell Hole
    function createFloorSlab(hasStairHole) {
      const shape = new THREE.Shape();
      shape.moveTo(-7.2, 9.2);
      shape.lineTo(5.2, 9.2);
      shape.lineTo(5.2, 3.5);
      shape.lineTo(4.8, 3.5);
      shape.lineTo(4.8, -3.8);
      shape.lineTo(7.6, -3.8);
      shape.lineTo(7.6, -13.6);
      shape.lineTo(-7.2, -13.6);
      shape.closePath();

      if (hasStairHole) {
        const hole = new THREE.Path();
        hole.moveTo(-6.6, 2.2);
        hole.lineTo(-3.0, 2.2);
        hole.lineTo(-3.0, -3.8);
        hole.lineTo(-6.6, -3.8);
        hole.closePath();
        shape.holes.push(hole);
      }

      const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: false });
      const mesh = new THREE.Mesh(geom, floorTileMat);
      mesh.rotation.x = Math.PI / 2;
      return mesh;
    }

    const gSlab = createFloorSlab(false);
    gSlab.position.y = 0.05;
    gFloor.add(gSlab);

    const fSlab = createFloorSlab(true);
    fSlab.position.y = 3.40;
    fFloor.add(fSlab);

    const sSlab = createFloorSlab(true);
    sSlab.position.y = 6.75;
    uFloor.add(sSlab);

    const tSlab = createFloorSlab(true);
    tSlab.position.y = 10.10;
    uFloor.add(tSlab);

    const rSlab = createFloorSlab(true);
    rSlab.position.y = 13.45;
    rFloor.add(rSlab);

    // Columns
    const colCoords = [
      [-6.8, -11.5], [-6.8, -6.0], [-6.8, -3.5], [-6.8, -0.5], [-6.8, 3.5], [-6.8, 9.6],
      [-2.4, -11.5], [-2.4, -3.5], [-2.4, -0.5], [-2.4, 3.5], [-2.4, 9.6],
      [1.2, -3.5], [1.2, 3.5], [0.9, 9.6],
      [7.4, -11.5], [7.4, -6.0], [4.8, 3.5], [5.0, 9.6]
    ];

    function addColumns(parent, baseY) {
      colCoords.forEach(([x, z]) => {
        const col = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.35, 0.4), colMat);
        col.position.set(x, baseY + 1.675, z);
        parent.add(col);
      });
    }

    addColumns(gFloor, 0);
    addColumns(fFloor, 3.35);
    addColumns(uFloor, 6.70);
    addColumns(uFloor, 10.05);

    // Dual Staircases in West Core (X = -4.8)
    function addDualStaircase(parent, baseY) {
      const stairGroup = new THREE.Group();
      stairGroup.position.set(-4.8, baseY, -0.8);

      // Upper Staircase (Z = -1.6)
      for (let i = 0; i < 9; i++) {
        const tr1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.17, 0.28), stairTreadMat);
        tr1.position.set(0.65, (i + 0.5) * 0.18, -1.6 - (i - 4) * 0.28);
        stairGroup.add(tr1);
      }
      const midLand1 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.18, 1.2), stairTreadMat);
      midLand1.position.set(-0.65, 1.675, -2.8);
      stairGroup.add(midLand1);

      // Lower Staircase (Z = 1.6)
      for (let i = 0; i < 9; i++) {
        const tr2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.17, 0.28), stairTreadMat);
        tr2.position.set(-0.65, (i + 0.5) * 0.18, 1.6 + (i - 4) * 0.28);
        stairGroup.add(tr2);
      }
      const midLand2 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.18, 1.2), stairTreadMat);
      midLand2.position.set(0.65, 1.675, 2.8);
      stairGroup.add(midLand2);

      // Lift Shaft (X = 3.4 relative to core = -1.4 global, Z = -1.5)
      const lift = new THREE.Mesh(new THREE.BoxGeometry(1.75, 3.35, 1.80), colMat);
      lift.position.set(3.4, 1.675, -1.5);
      stairGroup.add(lift);

      parent.add(stairGroup);
    }

    addDualStaircase(gFloor, 0);
    addDualStaircase(fFloor, 3.35);
    addDualStaircase(uFloor, 6.70);
    addDualStaircase(uFloor, 10.05);

    // Ground Floor: 4 Garages in Rear (2 on left after stairs + 2 on right), Front Garage, Showrooms
    function buildGroundDetails() {
      // Procedural car helper
      function addCar(x, z, mat, parent) {
        const car = new THREE.Group();
        car.position.set(x, 0.1, z);
        const b = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.55, 4.3), mat);
        b.position.y = 0.45;
        car.add(b);
        const c = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 2.3), mat);
        c.position.y = 0.95;
        car.add(c);
        parent.add(car);
      }

      // Rear 4 garages in Ground Floor only:
      addCar(-4.4, -6.5, carMatBlue, gFloor);   // Car 3 (Blue) after stairs
      addCar(-4.4, -11.0, carMatWhite, gFloor);  // Car 1 (White) after stairs
      addCar(3.2, -6.5, carMatWhite, gFloor);    // Car 4 (White) extended right
      addCar(3.2, -11.0, carMatDark, gFloor);    // Car 2 (Dark Gray) extended right

      // Dividing wall between left 2 and right 2 garages
      const divW = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.2, 9.8), panelMat);
      divW.position.set(-0.6, 0.6, -8.7);
      gFloor.add(divW);

      // Front-left garage
      addCar(-4.8, 6.2, carMatWhite, gFloor);
      const shutter = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.7, 0.08), fasciaMat);
      shutter.position.set(-4.8, 1.35, 9.2);
      gFloor.add(shutter);

      // Showrooms glazing
      const shop1 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.8, 0.06), glassMat);
      shop1.position.set(-1.0, 1.4, 9.2);
      gFloor.add(shop1);
      const shop2 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.8, 0.06), glassMat);
      shop2.position.set(3.5, 1.4, 9.2);
      gFloor.add(shop2);
    }
    buildGroundDetails();

    // Commercial Facade Function (Solid panels + Vision Glass + Stair Feature Glazing)
    function addCommercialFacade(parent, baseY) {
      const h = 3.35;
      // Front Facade (X: -7.2 to 5.2, width = 12.4)
      const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(12.4, 1.8, 0.08), glassMat);
      frontGlass.position.set(-1.0, baseY + 1.75, 9.2);
      parent.add(frontGlass);

      // Rear Facade across all 4 bays (X: -7.2 to 7.6, width = 14.8m)
      const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(14.8, 1.8, 0.08), glassMat);
      rearGlass.position.set(0.2, baseY + 1.75, -13.6);
      parent.add(rearGlass);

      // West Wall (X = -7.1) with Feature Glazing for Dual Staircases
      const westStairGlass = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.2, 6.0), glassMat);
      westStairGlass.position.set(-7.15, baseY + 1.675, -0.8);
      parent.add(westStairGlass);

      const westWallS = new THREE.Mesh(new THREE.BoxGeometry(0.25, h, 6.8), panelMat);
      westWallS.position.set(-7.1, baseY + h / 2, 5.8);
      parent.add(westWallS);

      const westWallN = new THREE.Mesh(new THREE.BoxGeometry(0.25, h, 9.8), panelMat);
      westWallN.position.set(-7.1, baseY + h / 2, -8.7);
      parent.add(westWallN);

      // East Facade tracing exact footprint:
      // Front-right (Z: 9.2 to 3.5, X = 5.2)
      const eastF = new THREE.Mesh(new THREE.BoxGeometry(0.25, h, 5.7), panelMat);
      eastF.position.set(5.2, baseY + h / 2, 6.35);
      parent.add(eastF);

      // Middle-right (lesser width: Z: 3.5 to -3.8, X = 4.8)
      const eastM = new THREE.Mesh(new THREE.BoxGeometry(0.25, h, 7.3), panelMat);
      eastM.position.set(4.8, baseY + h / 2, -0.15);
      parent.add(eastM);

      // Step right (Z = -3.8, X: 4.8 to 7.6)
      const eastStep = new THREE.Mesh(new THREE.BoxGeometry(2.8, h, 0.25), panelMat);
      eastStep.position.set(6.2, baseY + h / 2, -3.8);
      parent.add(eastStep);

      // Backside extended right (Z: -3.8 to -13.6, X = 7.6)
      const eastR = new THREE.Mesh(new THREE.BoxGeometry(0.25, h, 9.8), panelMat);
      eastR.position.set(7.6, baseY + h / 2, -8.7);
      parent.add(eastR);
    }

    addCommercialFacade(gFloor, 0);
    addCommercialFacade(fFloor, 3.35);
    addCommercialFacade(uFloor, 6.70);
    addCommercialFacade(uFloor, 10.05);

    // Roof Parapet Walls & Coping Caps
    function buildRoofLevel() {
      const rY = 13.4;
      const pH = 1.1;
      const pThick = 0.22;

      const fP = new THREE.Mesh(new THREE.BoxGeometry(12.4, pH, pThick), panelMat);
      fP.position.set(-1.0, rY + pH / 2, 9.2);
      rFloor.add(fP);

      const rP = new THREE.Mesh(new THREE.BoxGeometry(14.8, pH, pThick), panelMat);
      rP.position.set(0.2, rY + pH / 2, -13.6);
      rFloor.add(rP);

      const lP = new THREE.Mesh(new THREE.BoxGeometry(pThick, pH, 22.8), panelMat);
      lP.position.set(-7.2, rY + pH / 2, -2.2);
      rFloor.add(lP);

      const eMP = new THREE.Mesh(new THREE.BoxGeometry(pThick, pH, 7.3), panelMat);
      eMP.position.set(4.8, rY + pH / 2, -0.15);
      rFloor.add(eMP);

      const eSP = new THREE.Mesh(new THREE.BoxGeometry(2.8, pH, pThick), panelMat);
      eSP.position.set(6.2, rY + pH / 2, -3.8);
      rFloor.add(eSP);

      const eRP = new THREE.Mesh(new THREE.BoxGeometry(pThick, pH, 9.8), panelMat);
      eRP.position.set(7.6, rY + pH / 2, -8.7);
      rFloor.add(eRP);

      // Lift/Stair machine tower
      const tower = new THREE.Mesh(new THREE.BoxGeometry(5.8, 3.2, 7.8), panelMat);
      tower.position.set(-4.0, rY + 1.6, -1.2);
      rFloor.add(tower);
    }
    buildRoofLevel();

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // View & Explode functions
    window.setView = function(type) {
      if (type === 'front') { camera.position.set(0, 6, 26); controls.target.set(0, 6, 0); }
      else if (type === 'rear') { camera.position.set(0, 6, -26); controls.target.set(0, 6, 0); }
      else if (type === 'left') { camera.position.set(-26, 6, 0); controls.target.set(0, 6, 0); }
      else if (type === 'right') { camera.position.set(26, 6, 0); controls.target.set(0, 6, 0); }
      else if (type === 'top') { camera.position.set(0, 38, 0); controls.target.set(0, 0, 0); }
      else if (type === 'corner') { camera.position.set(22, 18, 26); controls.target.set(0, 4.5, 0); }
      else if (type === 'stairs') { camera.position.set(-16, 5, -0.8); controls.target.set(-4.8, 5, -0.8); }
      else if (type === 'garages') { camera.position.set(2.0, 3.2, -22); controls.target.set(0.2, 1.4, -8.7); }
      controls.update();
    };

    let isGlass = false;
    window.toggleGlass = function() {
      isGlass = !isGlass;
      panelMat.transmission = isGlass ? 0.75 : 0;
      panelMat.transparent = isGlass;
      panelMat.opacity = isGlass ? 0.35 : 1.0;
      panelMat.color.setHex(isGlass ? 0x93c5fd : 0xe2e8f0);
      panelMat.needsUpdate = true;
      const b = document.getElementById('btn-glass');
      if (b) {
        b.classList.toggle('active', isGlass);
        b.innerText = isGlass ? 'Glass BIM: ON' : 'Glass BIM';
      }
    };

    window.setExplode = function(factor) {
      const d = factor * 5.0;
      gFloor.position.y = 0;
      fFloor.position.y = d;
      uFloor.position.y = d * 2;
      rFloor.position.y = d * 3;
    };

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>`;
}
