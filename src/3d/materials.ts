import * as THREE from 'three';

// Procedural texture generators to ensure 100% zero 404 dependencies
export function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#24272c';
  ctx.fillRect(0, 0, 512, 512);

  // Add subtle grain noise
  for (let i = 0; i < 30000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const brightness = Math.floor(Math.random() * 40 + 30);
    ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness + 3})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createPaverTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#c8cbcf';
  ctx.fillRect(0, 0, 512, 512);

  // Paver grid
  const tileSize = 64;
  ctx.strokeStyle = '#9ca0a6';
  ctx.lineWidth = 2;

  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      const shade = Math.floor(Math.random() * 14 - 7);
      ctx.fillStyle = `rgb(${200 + shade}, ${203 + shade}, ${207 + shade})`;
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
    }
  }

  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createFloorTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f3eedf';
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 128;
  ctx.strokeStyle = '#dfd6c5';
  ctx.lineWidth = 2;

  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      const v = Math.floor(Math.random() * 8 - 4);
      ctx.fillStyle = `rgb(${243 + v}, ${238 + v}, ${223 + v})`;
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
    }
  }

  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#b89467';
  ctx.fillRect(0, 0, 256, 256);

  // Wood grain stripes
  for (let y = 0; y < 256; y += 4) {
    const alpha = Math.random() * 0.15;
    ctx.fillStyle = `rgba(120, 75, 40, ${alpha})`;
    ctx.fillRect(0, y, 256, Math.random() * 3 + 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class MaterialLibrary {
  isSoftwareGl: boolean;

  // Exterior materials
  facadeConcrete: THREE.MeshStandardMaterial;
  facadePanel: THREE.MeshPhysicalMaterial;
  spandrelFascia: THREE.MeshStandardMaterial;
  structuralColumn: THREE.MeshStandardMaterial;
  columnHighlight: THREE.MeshStandardMaterial;
  floorSlab: THREE.MeshStandardMaterial;
  floorTile: THREE.MeshStandardMaterial;
  interiorWall: THREE.MeshStandardMaterial;
  glassCurtain: THREE.MeshPhysicalMaterial;
  glassShopfront: THREE.MeshPhysicalMaterial;
  aluminumFrame: THREE.MeshStandardMaterial;
  garageShutter: THREE.MeshStandardMaterial;
  canopyGlass: THREE.MeshPhysicalMaterial;
  asphaltRoad: THREE.MeshStandardMaterial;
  paverDriveway: THREE.MeshStandardMaterial;
  sidewalk: THREE.MeshStandardMaterial;
  curb: THREE.MeshStandardMaterial;
  roadLine: THREE.MeshStandardMaterial;
  grass: THREE.MeshStandardMaterial;
  shrubLeaf: THREE.MeshStandardMaterial;
  treeTrunk: THREE.MeshStandardMaterial;
  boundaryWall: THREE.MeshStandardMaterial;

  // Interior & Furniture
  woodDesk: THREE.MeshStandardMaterial;
  officeChair: THREE.MeshStandardMaterial;
  leatherSofa: THREE.MeshStandardMaterial;
  countertopGranite: THREE.MeshStandardMaterial;
  stainlessSteel: THREE.MeshStandardMaterial;
  sanitaryPorcelain: THREE.MeshStandardMaterial;
  metalRail: THREE.MeshStandardMaterial;
  stairConcrete: THREE.MeshStandardMaterial;
  stairTread: THREE.MeshStandardMaterial;
  stairRiser: THREE.MeshStandardMaterial;
  stairGlassRail: THREE.MeshPhysicalMaterial;
  liftShaftInterior: THREE.MeshStandardMaterial;
  liftDoor: THREE.MeshStandardMaterial;

  // Car paints
  carWhite: THREE.MeshStandardMaterial;
  carDarkGray: THREE.MeshStandardMaterial;
  carBlue: THREE.MeshStandardMaterial;
  carBlack: THREE.MeshStandardMaterial;
  carTire: THREE.MeshStandardMaterial;
  carGlass: THREE.MeshPhysicalMaterial;

  // Overlay / Wireframe & Visual Design
  wireframeMaterial: THREE.MeshBasicMaterial;
  roomHighlightMaterial: THREE.MeshStandardMaterial;

  // Modern Architectural Visual Design Elements
  architecturalFin: THREE.MeshStandardMaterial;
  ledWarmWhite: THREE.MeshStandardMaterial;
  ledCyanGlow: THREE.MeshStandardMaterial;
  signageGold: THREE.MeshStandardMaterial;
  wheelStop: THREE.MeshStandardMaterial;
  garageLouver: THREE.MeshStandardMaterial;

  isTransparentMode: boolean = false;

  constructor(isSoftwareGl: boolean) {
    this.isSoftwareGl = isSoftwareGl;

    const asphaltTex = createAsphaltTexture();
    const paverTex = createPaverTexture();
    const floorTileTex = createFloorTileTexture();
    const woodTex = createWoodTexture();

    this.facadeConcrete = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.65,
      metalness: 0.1,
    });

    // Solid architectural exterior composite paneling (clean commercial cladding, supports glass BIM mode)
    this.facadePanel = new THREE.MeshPhysicalMaterial({
      color: 0x334155, // Architectural slate gray
      roughness: 0.45,
      metalness: 0.3,
      transmission: 0,
      ior: 1.5,
    });

    // Structural floor slab edge fascia (horizontal commercial definition)
    this.spandrelFascia = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Dark anthracite metallic fascia
      roughness: 0.35,
      metalness: 0.75,
    });

    // Dark architectural structural columns as featured in the CAD drawings
    this.structuralColumn = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.35,
      metalness: 0.6,
    });

    this.columnHighlight = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.4,
    });

    this.floorSlab = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.8,
      metalness: 0.05,
    });

    this.floorTile = new THREE.MeshStandardMaterial({
      map: floorTileTex,
      roughness: 0.3,
      metalness: 0.1,
    });

    this.interiorWall = new THREE.MeshStandardMaterial({
      color: 0xf4f4f5,
      roughness: 0.85,
      metalness: 0.02,
    });

    // Architectural Vision Glass - Realistic solar reflective commercial glazing (solid presence, NOT transparent cellophane)
    this.glassCurtain = new THREE.MeshPhysicalMaterial({
      color: 0x1e3a5f, // Deep architectural solar blue
      roughness: 0.1,
      metalness: 0.5,
      transmission: isSoftwareGl ? 0 : 0.35, // Subtle realistic transparency, mostly reflective
      opacity: 0.75,
      transparent: true,
      ior: 1.52,
      depthWrite: true, // Crucial: write to depth buffer so it doesn't look like a ghost box!
    });

    this.glassShopfront = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      roughness: 0.08,
      metalness: 0.2,
      transmission: isSoftwareGl ? 0 : 0.5,
      opacity: 0.65,
      transparent: true,
      ior: 1.5,
      depthWrite: true,
    });

    this.aluminumFrame = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep charcoal architectural aluminum
      roughness: 0.3,
      metalness: 0.85,
    });

    this.garageShutter = new THREE.MeshStandardMaterial({
      color: 0x475569, // Steel roll-up garage door
      roughness: 0.4,
      metalness: 0.7,
    });

    this.canopyGlass = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.2,
      transmission: isSoftwareGl ? 0 : 0.6,
      opacity: 0.7,
      transparent: true,
      depthWrite: true,
    });

    this.asphaltRoad = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      roughness: 0.9,
      metalness: 0.05,
    });

    this.paverDriveway = new THREE.MeshStandardMaterial({
      map: paverTex,
      roughness: 0.7,
      metalness: 0.05,
    });

    this.sidewalk = new THREE.MeshStandardMaterial({
      color: 0xd6d3d1,
      roughness: 0.75,
      metalness: 0.05,
    });

    this.curb = new THREE.MeshStandardMaterial({
      color: 0x78716c,
      roughness: 0.85,
      metalness: 0.1,
    });

    this.roadLine = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.1,
    });

    this.grass = new THREE.MeshStandardMaterial({
      color: 0x3f6212,
      roughness: 0.9,
      metalness: 0.02,
    });

    this.shrubLeaf = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.6,
      metalness: 0.05,
    });

    this.treeTrunk = new THREE.MeshStandardMaterial({
      color: 0x713f12,
      roughness: 0.9,
      metalness: 0.02,
    });

    this.boundaryWall = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.75,
      metalness: 0.15,
    });

    // Interior furniture
    this.woodDesk = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.45,
      metalness: 0.1,
    });

    this.officeChair = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.2,
    });

    this.leatherSofa = new THREE.MeshStandardMaterial({
      color: 0xd4c5b9,
      roughness: 0.5,
      metalness: 0.05,
    });

    this.countertopGranite = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.2,
      metalness: 0.3,
    });

    this.stainlessSteel = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.25,
      metalness: 0.92,
    });

    this.sanitaryPorcelain = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.05,
    });

    this.metalRail = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.8,
    });

    this.stairConcrete = new THREE.MeshStandardMaterial({
      color: 0xc4c7cb,
      roughness: 0.7,
      metalness: 0.1,
    });

    // High contrast dark stone / polished concrete staircase treads
    this.stairTread = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep charcoal stone
      roughness: 0.35,
      metalness: 0.2,
    });

    // Clean white risers
    this.stairRiser = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.05,
    });

    // Commercial glass balustrade panels
    this.stairGlassRail = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      roughness: 0.08,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.75,
      opacity: 0.85,
      transparent: true,
      depthWrite: false,
    });

    this.liftShaftInterior = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.4,
    });

    this.liftDoor = new THREE.MeshStandardMaterial({
      color: 0xcfd6df,
      roughness: 0.22,
      metalness: 0.9,
    });

    // Vehicles
    this.carWhite = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.6,
    });

    this.carDarkGray = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.3,
      metalness: 0.7,
    });

    this.carBlue = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.28,
      metalness: 0.75,
    });

    this.carBlack = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.7,
    });

    this.carTire = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
      metalness: 0.1,
    });

    this.carGlass = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      transmission: 0.7,
      opacity: 0.8,
      transparent: true,
      roughness: 0.1,
    });

    this.wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });

    this.roomHighlightMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });

    // High-End Architectural Visual Design Materials
    // 1. Sleek vertical solar fins / brise-soleil (dark anodized charcoal aluminum)
    this.architecturalFin = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.25,
      metalness: 0.85,
    });

    // 2. Warm-white ceiling architectural lights & troffers (illuminates offices and garages)
    this.ledWarmWhite = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xfff5db,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });

    // 3. Crisp cyan-blue architectural perimeter accent lighting
    this.ledCyanGlow = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 2.5,
      roughness: 0.2,
    });

    // 4. Polished commercial gold entrance signage
    this.signageGold = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.9,
    });

    // 5. Rubber/concrete parking wheel stops
    this.wheelStop = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
      metalness: 0.1,
    });

    // 6. Architectural ventilation louvers for covered garage
    this.garageLouver = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.7,
    });
  }

  // Toggle between Photorealistic Solid Cladding and High-End Glass BIM / Transparent Mode
  setTransparentMode(enabled: boolean) {
    this.isTransparentMode = enabled;

    if (enabled) {
      // High-End Glass BIM / Transparent Mode:
      // Exterior panels become frosted architectural glass with subtle glow so internal rooms, 4 rear garages, and staircases are beautifully visible!
      this.facadePanel.transmission = this.isSoftwareGl ? 0 : 0.78;
      this.facadePanel.transparent = true;
      this.facadePanel.opacity = 0.32;
      this.facadePanel.roughness = 0.12;
      this.facadePanel.metalness = 0.15;
      this.facadePanel.color.setHex(0x93c5fd);

      this.spandrelFascia.transparent = true;
      this.spandrelFascia.opacity = 0.55;

      this.glassCurtain.transmission = this.isSoftwareGl ? 0 : 0.9;
      this.glassCurtain.opacity = 0.3;
      this.glassCurtain.color.setHex(0x60a5fa);

      this.interiorWall.transparent = true;
      this.interiorWall.opacity = 0.45;

      this.ledWarmWhite.emissiveIntensity = 3.5;
      this.ledCyanGlow.emissiveIntensity = 3.8;
    } else {
      // Solid Photorealistic Modern Commercial Cladding
      this.facadePanel.transmission = 0;
      this.facadePanel.transparent = false;
      this.facadePanel.opacity = 1.0;
      this.facadePanel.roughness = 0.45;
      this.facadePanel.metalness = 0.3;
      this.facadePanel.color.setHex(0x334155);

      this.spandrelFascia.transparent = false;
      this.spandrelFascia.opacity = 1.0;

      this.glassCurtain.transmission = this.isSoftwareGl ? 0 : 0.35;
      this.glassCurtain.opacity = 0.75;
      this.glassCurtain.color.setHex(0x1e3a5f);

      this.interiorWall.transparent = false;
      this.interiorWall.opacity = 1.0;

      this.ledWarmWhite.emissiveIntensity = 2.2;
      this.ledCyanGlow.emissiveIntensity = 2.5;
    }

    this.facadePanel.needsUpdate = true;
    this.spandrelFascia.needsUpdate = true;
    this.glassCurtain.needsUpdate = true;
    this.interiorWall.needsUpdate = true;
    this.ledWarmWhite.needsUpdate = true;
    this.ledCyanGlow.needsUpdate = true;
  }

  dispose() {
    // Clean up
    const mats = [
      this.facadeConcrete,
      this.facadePanel,
      this.spandrelFascia,
      this.structuralColumn,
      this.columnHighlight,
      this.floorSlab,
      this.floorTile,
      this.interiorWall,
      this.glassCurtain,
      this.glassShopfront,
      this.aluminumFrame,
      this.garageShutter,
      this.canopyGlass,
      this.asphaltRoad,
      this.paverDriveway,
      this.sidewalk,
      this.curb,
      this.roadLine,
      this.grass,
      this.shrubLeaf,
      this.treeTrunk,
      this.boundaryWall,
      this.woodDesk,
      this.officeChair,
      this.leatherSofa,
      this.countertopGranite,
      this.stainlessSteel,
      this.sanitaryPorcelain,
      this.metalRail,
      this.stairConcrete,
      this.stairTread,
      this.stairRiser,
      this.stairGlassRail,
      this.liftShaftInterior,
      this.liftDoor,
      this.carWhite,
      this.carDarkGray,
      this.carBlue,
      this.carBlack,
      this.carTire,
      this.carGlass,
      this.wireframeMaterial,
      this.roomHighlightMaterial,
      this.architecturalFin,
      this.ledWarmWhite,
      this.ledCyanGlow,
      this.signageGold,
      this.wheelStop,
      this.garageLouver,
    ];

    mats.forEach((m) => m.dispose());
  }
}
