import * as THREE from 'three';
import { MaterialLibrary } from './materials';
import {
  BUILDING_DIMENSIONS,
  STRUCTURAL_COLUMNS,
  GROUND_ROOMS,
  FIRST_ROOMS,
} from '../data/buildingData';
import { FloorVisibility, LayerVisibility } from '../types/architecture';

export type FacadeMode = 'commercial' | 'cutaway' | 'xray';

export class BuildingModel {
  materials: MaterialLibrary;
  rootGroup: THREE.Group;

  // Floor groups for separate toggling and exploded view
  siteGroup: THREE.Group;
  groundGroup: THREE.Group;
  firstGroup: THREE.Group;
  secondGroup: THREE.Group;
  thirdGroup: THREE.Group;
  roofGroup: THREE.Group;

  // Facade groups for controlling facade appearance (solid commercial vs interior cutaway vs xray)
  exteriorFacadeGroup: THREE.Group;
  facadeMode: FacadeMode = 'commercial';

  // Layer categorizations
  columnsGroup: THREE.Group;
  gridLinesGroup: THREE.Group;
  stairsGroup: THREE.Group;

  // Blueprint overlay meshes
  groundBlueprintMesh: THREE.Mesh | null = null;
  firstBlueprintMesh: THREE.Mesh | null = null;

  // Interactive room click bounds
  roomHitMeshes: THREE.Mesh[] = [];

  // Exploded spacing
  explodedFactor: number = 0; // 0 to 1

  constructor(materials: MaterialLibrary) {
    this.materials = materials;
    this.rootGroup = new THREE.Group();

    this.siteGroup = new THREE.Group();
    this.groundGroup = new THREE.Group();
    this.firstGroup = new THREE.Group();
    this.secondGroup = new THREE.Group();
    this.thirdGroup = new THREE.Group();
    this.roofGroup = new THREE.Group();

    this.exteriorFacadeGroup = new THREE.Group();
    this.columnsGroup = new THREE.Group();
    this.gridLinesGroup = new THREE.Group();
    this.stairsGroup = new THREE.Group();

    this.rootGroup.add(this.siteGroup);
    this.rootGroup.add(this.groundGroup);
    this.rootGroup.add(this.firstGroup);
    this.rootGroup.add(this.secondGroup);
    this.rootGroup.add(this.thirdGroup);
    this.rootGroup.add(this.roofGroup);

    this.buildSite();
    this.buildGroundFloor();
    this.buildFirstFloor();
    this.buildUpperFloors();
    this.buildRoof();
    this.buildStructuralGridLines();
    this.loadBlueprintOverlays();
  }

  // Helper to create floor slab shape with stairwell void opening
  private createSlabShape(hasStairHole: boolean): THREE.Shape {
    const s = new THREE.Shape();
    // Front-left
    s.moveTo(-7.2, 9.2);
    // Front wall across showrooms
    s.lineTo(5.2, 9.2);
    // Front-right transition
    s.lineTo(5.2, 3.5);
    // Middle section: LESSER WIDTH BEFORE GARAGE PART!
    s.lineTo(4.8, 3.5);
    s.lineTo(4.8, -3.8);
    // EXTEND TO THE RIGHT AT THE BACKSIDE WHERE THE GARAGES ARE!
    s.lineTo(7.6, -3.8);
    s.lineTo(7.6, -13.6);
    // Rear wall across all 4 garages (14.8 m total width)
    s.lineTo(-7.2, -13.6);
    s.closePath();

    if (hasStairHole) {
      // Cut out stairwell opening over the dual staircase core so stairs ascend cleanly between floors!
      const hole = new THREE.Path();
      hole.moveTo(-6.6, 2.2);
      hole.lineTo(-3.0, 2.2);
      hole.lineTo(-3.0, -3.8);
      hole.lineTo(-6.6, -3.8);
      hole.closePath();
      s.holes.push(hole);
    }
    return s;
  }

  // 1. SITE & PLOT GEOMETRY
  private buildSite() {
    const siteW = 28;
    const siteD = 38;

    // Base earth/subgrade
    const baseGeo = new THREE.BoxGeometry(siteW, 0.4, siteD);
    const baseMesh = new THREE.Mesh(baseGeo, this.materials.sidewalk);
    baseMesh.position.set(2, -0.22, 0);
    baseMesh.receiveShadow = true;
    this.siteGroup.add(baseMesh);

    // Main Road (South / Bottom)
    const roadW = siteW + 10;
    const roadD = 9.0;
    const roadGeo = new THREE.PlaneGeometry(roadW, roadD);
    const roadMesh = new THREE.Mesh(roadGeo, this.materials.asphaltRoad);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(2, 0.01, 15.5);
    roadMesh.receiveShadow = true;
    this.siteGroup.add(roadMesh);

    // Road dashed lane divider line
    const lineGeo = new THREE.PlaneGeometry(roadW, 0.22);
    const lineMesh = new THREE.Mesh(lineGeo, this.materials.roadLine);
    lineMesh.rotation.x = -Math.PI / 2;
    lineMesh.position.set(2, 0.015, 15.5);
    this.siteGroup.add(lineMesh);

    // Road text "MAIN ROAD"
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 512;
    textCanvas.height = 128;
    const ctx = textCanvas.getContext('2d')!;
    ctx.fillStyle = '#24272c';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('M A I N   R O A D', 256, 64);
    const textTex = new THREE.CanvasTexture(textCanvas);
    textTex.colorSpace = THREE.SRGBColorSpace;
    const textGeo = new THREE.PlaneGeometry(8, 2);
    const textMat = new THREE.MeshBasicMaterial({ map: textTex, transparent: true, opacity: 0.85 });
    const textMesh = new THREE.Mesh(textGeo, textMat);
    textMesh.rotation.x = -Math.PI / 2;
    textMesh.position.set(0, 0.02, 17.5);
    this.siteGroup.add(textMesh);

    // Sidewalk & Curb along Main Road
    const curbGeo = new THREE.BoxGeometry(siteW, 0.18, 0.4);
    const curbMesh = new THREE.Mesh(curbGeo, this.materials.curb);
    curbMesh.position.set(2, 0.09, 10.8);
    this.siteGroup.add(curbMesh);

    const walkGeo = new THREE.BoxGeometry(siteW, 0.12, 1.8);
    const walkMesh = new THREE.Mesh(walkGeo, this.materials.sidewalk);
    walkMesh.position.set(2, 0.06, 9.8);
    walkMesh.receiveShadow = true;
    this.siteGroup.add(walkMesh);

    // Open vehicular driveway along right side (wider at lesser width middle section, wraps around extended rear garage)
    const drivewayShape = new THREE.Shape();
    drivewayShape.moveTo(5.4, 9.0);
    drivewayShape.lineTo(11.2, 9.0);
    drivewayShape.lineTo(8.4, -14.0);
    drivewayShape.lineTo(7.8, -14.0);
    drivewayShape.lineTo(7.8, -3.8);
    drivewayShape.lineTo(5.0, -3.8);
    drivewayShape.lineTo(5.0, 3.5);
    drivewayShape.lineTo(5.4, 3.5);
    drivewayShape.closePath();

    const drivewayGeo = new THREE.ShapeGeometry(drivewayShape);
    const drivewayMesh = new THREE.Mesh(drivewayGeo, this.materials.paverDriveway);
    drivewayMesh.rotation.x = -Math.PI / 2;
    drivewayMesh.position.y = 0.02;
    drivewayMesh.receiveShadow = true;
    this.siteGroup.add(drivewayMesh);

    // Angled boundary wall & landscaping strip along right perimeter
    this.buildAngledPerimeterWall();
    this.buildLandscapingStrip();
    this.addStreetVegetation();
  }

  private buildAngledPerimeterWall() {
    const wallPts = [
      new THREE.Vector3(11.2, 0, 9.0),
      new THREE.Vector3(8.2, 0, -14.0),
      new THREE.Vector3(-7.5, 0, -14.0),
      new THREE.Vector3(-7.5, 0, 9.0),
    ];

    const rightWallLen = wallPts[0].distanceTo(wallPts[1]);
    const rightWallGeo = new THREE.BoxGeometry(0.25, 2.2, rightWallLen);
    const rightWall = new THREE.Mesh(rightWallGeo, this.materials.boundaryWall);
    const rightMid = new THREE.Vector3().addVectors(wallPts[0], wallPts[1]).multiplyScalar(0.5);
    rightWall.position.set(rightMid.x + 0.15, 1.1, rightMid.z);
    const angle = Math.atan2(wallPts[1].x - wallPts[0].x, wallPts[1].z - wallPts[0].z);
    rightWall.rotation.y = angle;
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    this.siteGroup.add(rightWall);

    const rearLen = wallPts[1].distanceTo(wallPts[2]);
    const rearWallGeo = new THREE.BoxGeometry(rearLen, 2.2, 0.25);
    const rearWall = new THREE.Mesh(rearWallGeo, this.materials.boundaryWall);
    rearWall.position.set(-0.5 * (7.5 - 8.2), 1.1, -14.0);
    rearWall.castShadow = true;
    this.siteGroup.add(rearWall);

    const leftLen = wallPts[2].distanceTo(wallPts[3]);
    const leftWallGeo = new THREE.BoxGeometry(0.25, 2.2, leftLen);
    const leftWall = new THREE.Mesh(leftWallGeo, this.materials.boundaryWall);
    leftWall.position.set(-7.5, 1.1, -2.5);
    leftWall.castShadow = true;
    this.siteGroup.add(leftWall);
  }

  private buildLandscapingStrip() {
    const plantStripShape = new THREE.Shape();
    plantStripShape.moveTo(9.8, 8.8);
    plantStripShape.lineTo(11.0, 8.8);
    plantStripShape.lineTo(8.1, -13.8);
    plantStripShape.lineTo(7.3, -13.8);
    plantStripShape.closePath();

    const plantGeo = new THREE.ShapeGeometry(plantStripShape);
    const plantMesh = new THREE.Mesh(plantGeo, this.materials.grass);
    plantMesh.rotation.x = -Math.PI / 2;
    plantMesh.position.y = 0.05;
    this.siteGroup.add(plantMesh);

    const treeCount = 9;
    for (let i = 0; i < treeCount; i++) {
      const t = i / (treeCount - 1);
      const px = THREE.MathUtils.lerp(10.3, 7.6, t);
      const pz = THREE.MathUtils.lerp(8.0, -13.0, t);
      this.createProceduralTree(px, pz, 0.7 + (i % 3) * 0.15, this.siteGroup);
    }
  }

  private addStreetVegetation() {
    this.createProceduralTree(-6.5, 9.8, 1.0, this.siteGroup);
    this.createProceduralTree(-3.0, 9.8, 0.8, this.siteGroup);
    this.createProceduralTree(5.2, 9.8, 0.9, this.siteGroup);
  }

  private createProceduralTree(x: number, z: number, scale: number, parent: THREE.Group) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    tree.scale.set(scale, scale, scale);

    const trunkGeo = new THREE.CylinderGeometry(0.1, 0.15, 1.2, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.treeTrunk);
    trunk.position.y = 0.6;
    trunk.castShadow = true;
    tree.add(trunk);

    const folMat = this.materials.shrubLeaf;
    const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 1), folMat);
    f1.position.y = 1.6;
    f1.castShadow = true;
    tree.add(f1);

    const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 1), folMat);
    f2.position.set(0.15, 2.1, -0.1);
    f2.castShadow = true;
    tree.add(f2);

    const f3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4, 1), folMat);
    f3.position.set(-0.1, 2.5, 0.05);
    f3.castShadow = true;
    tree.add(f3);

    parent.add(tree);
  }

  // 2. GROUND FLOOR (Y = 0 to 3.35)
  private buildGroundFloor() {
    // Ground Floor Slab (solid ground plinth)
    const slabShape = this.createSlabShape(false);
    const slabGeo = new THREE.ExtrudeGeometry(slabShape, { depth: 0.25, bevelEnabled: false });
    const slabMesh = new THREE.Mesh(slabGeo, this.materials.floorTile);
    slabMesh.rotation.x = Math.PI / 2;
    slabMesh.position.y = 0.05;
    slabMesh.receiveShadow = true;
    this.groundGroup.add(slabMesh);

    // Horizontal Spandrel Fascia Band at floor level
    this.createFloorFasciaBand(0.0, this.groundGroup);

    // Front Entrance Steps for Showrooms
    this.buildEntranceSteps();

    // Structural Columns for Ground Floor (18 columns)
    this.buildColumnsForFloor(0, this.groundGroup);

    // Rear 4-Car Parking Garages (arranged 2x2 with cars)
    this.buildRearParkingGarages();

    // Front-Left Garage (enclosed with 1 car)
    this.buildFrontLeftGarage();

    // Two Commercial Showrooms (14'0" x 16'0" each)
    this.buildGroundShowrooms();

    // Central Core: Dual Staircases & Lift (1750x1800)
    this.buildDualStaircaseCore(0, this.groundGroup);
    this.buildLiftCore(0, this.groundGroup);

    // Central Lobby (12'0" wide), Pantry (6'x8'), 2 Toilets (6'x7' each)
    this.buildGroundLobbyAndUtilities();

    // Solid Commercial Exterior Facade for Ground Floor
    this.buildGroundCommercialFacade();

    // Register room clickable zones
    GROUND_ROOMS.forEach((room) => {
      this.createRoomHitBox(room, 0, this.groundGroup);
    });
  }

  private createFloorFasciaBand(floorY: number, parent: THREE.Group) {
    const bandH = 0.35;
    const bandD = 0.12;

    // Front horizontal fascia band (X: -7.2 to 5.2, length: 12.4m)
    const frontBand = new THREE.Mesh(
      new THREE.BoxGeometry(12.4, bandH, bandD),
      this.materials.spandrelFascia
    );
    frontBand.position.set(-1.0, floorY + bandH / 2, 9.25);
    frontBand.castShadow = true;
    parent.add(frontBand);

    // Middle right fascia band (lesser width: X = 4.85, Z: 3.5 to -3.8, length: 7.3m)
    const midRightBand = new THREE.Mesh(
      new THREE.BoxGeometry(bandD, bandH, 7.3),
      this.materials.spandrelFascia
    );
    midRightBand.position.set(4.85, floorY + bandH / 2, -0.15);
    parent.add(midRightBand);

    // Step fascia band extending out to the right at backside (Z: -3.8, X: 4.8 to 7.6, length: 2.8m)
    const stepBand = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, bandH, bandD),
      this.materials.spandrelFascia
    );
    stepBand.position.set(6.2, floorY + bandH / 2, -3.8);
    parent.add(stepBand);

    // Extended rear-right fascia band where the garages are (X = 7.65, Z: -3.8 to -13.6, length: 9.8m)
    const rearRightBand = new THREE.Mesh(
      new THREE.BoxGeometry(bandD, bandH, 9.8),
      this.materials.spandrelFascia
    );
    rearRightBand.position.set(7.65, floorY + bandH / 2, -8.7);
    parent.add(rearRightBand);

    // Rear horizontal fascia band across all 4 garages (X: -7.2 to 7.6, length: 14.8m)
    const rearBand = new THREE.Mesh(
      new THREE.BoxGeometry(14.8, bandH, bandD),
      this.materials.spandrelFascia
    );
    rearBand.position.set(0.2, floorY + bandH / 2, -13.65);
    rearBand.castShadow = true;
    parent.add(rearBand);

    // Left fascia band (West: X = -7.25, length: 22.8m)
    const leftBand = new THREE.Mesh(
      new THREE.BoxGeometry(bandD, bandH, 22.8),
      this.materials.spandrelFascia
    );
    leftBand.position.set(-7.25, floorY + bandH / 2, -2.2);
    leftBand.castShadow = true;
    parent.add(leftBand);
  }

  private buildEntranceSteps() {
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.15, 1.2), this.materials.curb);
    step1.position.set(1.1, 0.075, 9.6);
    this.groundGroup.add(step1);

    const step2 = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.15, 0.8), this.materials.curb);
    step2.position.set(1.1, 0.225, 9.3);
    this.groundGroup.add(step2);

    // Entrance landing mats
    const matGeo = new THREE.PlaneGeometry(1.8, 0.9);
    const matMesh = new THREE.Mesh(matGeo, this.materials.interiorWall);
    matMesh.rotation.x = -Math.PI / 2;
    matMesh.position.set(1.1, 0.31, 9.2);
    this.groundGroup.add(matMesh);

    // Entrance potted plants
    this.createPottedPlant(-4.0, 9.2, this.groundGroup);
    this.createPottedPlant(-0.8, 9.2, this.groundGroup);
    this.createPottedPlant(3.0, 9.2, this.groundGroup);
    this.createPottedPlant(5.6, 9.2, this.groundGroup);
  }

  private createPottedPlant(x: number, z: number, parent: THREE.Group) {
    const pot = new THREE.Group();
    pot.position.set(x, 0.2, z);

    const potGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.45, 12);
    const potMesh = new THREE.Mesh(potGeo, this.materials.interiorWall);
    potMesh.position.y = 0.225;
    pot.add(potMesh);

    const plantGeo = new THREE.DodecahedronGeometry(0.28, 1);
    const plantMesh = new THREE.Mesh(plantGeo, this.materials.shrubLeaf);
    plantMesh.position.y = 0.55;
    pot.add(plantMesh);

    parent.add(pot);
  }

  private buildColumnsForFloor(floorY: number, parent: THREE.Group) {
    const colH = BUILDING_DIMENSIONS.floorHeight;

    STRUCTURAL_COLUMNS.forEach((col) => {
      const colGroup = new THREE.Group();
      colGroup.position.set(col.x, floorY, col.z);

      const colGeo = new THREE.BoxGeometry(col.width, colH, col.depth);
      const colMesh = new THREE.Mesh(colGeo, this.materials.structuralColumn);
      colMesh.position.y = colH / 2;
      colMesh.castShadow = true;
      colMesh.receiveShadow = true;
      colGroup.add(colMesh);

      const plateGeo = new THREE.BoxGeometry(col.width + 0.08, 0.06, col.depth + 0.08);
      const bottomPlate = new THREE.Mesh(plateGeo, this.materials.aluminumFrame);
      bottomPlate.position.y = 0.03;
      colGroup.add(bottomPlate);

      const topPlate = new THREE.Mesh(plateGeo, this.materials.aluminumFrame);
      topPlate.position.y = colH - 0.03;
      colGroup.add(topPlate);

      parent.add(colGroup);
    });
  }

  private buildRearParkingGarages() {
    const baseY = 0.1;
    // Four garages in ground floor only:
    // 2 on the left side (after stairs 2): Car 3 (blue) and Car 1 (white)
    // 2 on the other side (extended right backside): Car 4 (white) and Car 2 (dark gray)
    const carConfigs = [
      // Left side after stairs 2
      { x: -4.4, z: -6.5, color: 'blue', rot: 0, label: 'BAY P3' },
      { x: -4.4, z: -11.0, color: 'white', rot: 0, label: 'BAY P1' },
      // Other side (extended right backside)
      { x: 3.2, z: -6.5, color: 'white', rot: 0, label: 'BAY P4' },
      { x: 3.2, z: -11.0, color: 'darkgray', rot: 0, label: 'BAY P2' },
    ];

    carConfigs.forEach((c) => {
      this.createProceduralCar(c.x, baseY, c.z, c.color, c.rot, this.groundGroup);
    });

    // Concrete Wheel Stops behind every vehicle
    const wheelStops = [
      { x: -4.4, z: -12.9 },
      { x: -4.4, z: -8.4 },
      { x: 3.2, z: -12.9 },
      { x: 3.2, z: -8.4 },
    ];
    wheelStops.forEach((ws) => {
      const stopMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.12, 0.18),
        this.materials.wheelStop
      );
      stopMesh.position.set(ws.x, 0.06, ws.z);
      this.groundGroup.add(stopMesh);
    });

    // Central dividing column & beam structure between left 2 and right 2 garages
    const divWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.9, 9.8), this.materials.interiorWall);
    divWall.position.set(-0.6, 0.45, -8.7);
    this.groundGroup.add(divWall);

    // Structural mid-pier on dividing line
    const divCol = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.35, 0.4), this.materials.structuralColumn);
    divCol.position.set(-0.6, 1.675, -8.7);
    this.groundGroup.add(divCol);

    // Parking slot boundary painted lines
    const lineMat = this.materials.roadLine;
    const lines = [
      { x: -4.4, z: -8.7, w: 0.12, d: 9.8 },
      { x: 3.2, z: -8.7, w: 0.12, d: 9.8 },
      { x: -0.6, z: -8.7, w: 0.14, d: 9.8 },
      { x: -6.8, z: -8.7, w: 0.12, d: 9.8 },
      { x: 5.6, z: -8.7, w: 0.12, d: 9.8 },
    ];
    lines.forEach((l) => {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(l.w, l.d), lineMat);
      p.rotation.x = -Math.PI / 2;
      p.position.set(l.x, 0.12, l.z);
      this.groundGroup.add(p);
    });

    // Transverse parking stall delimiter lines
    const transLines = [
      { x: -4.4, z: -4.2, w: 2.8, d: 0.12 },
      { x: -4.4, z: -8.7, w: 2.8, d: 0.12 },
      { x: -4.4, z: -13.2, w: 2.8, d: 0.12 },
      { x: 3.2, z: -4.2, w: 3.2, d: 0.12 },
      { x: 3.2, z: -8.7, w: 3.2, d: 0.12 },
      { x: 3.2, z: -13.2, w: 3.2, d: 0.12 },
    ];
    transLines.forEach((tl) => {
      const tp = new THREE.Mesh(new THREE.PlaneGeometry(tl.w, tl.d), lineMat);
      tp.rotation.x = -Math.PI / 2;
      tp.position.set(tl.x, 0.12, tl.z);
      this.groundGroup.add(tp);
    });

    // Industrial Suspended Linear LED Fixtures directly above the 4 vehicles
    const lightPositions = [
      { x: -4.4, z: -6.5 },
      { x: -4.4, z: -11.0 },
      { x: 3.2, z: -6.5 },
      { x: 3.2, z: -11.0 },
    ];
    lightPositions.forEach((pos) => {
      const fixture = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.1, 2.8),
        this.materials.aluminumFrame
      );
      fixture.position.set(pos.x, 3.15, pos.z);
      this.groundGroup.add(fixture);

      const led = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.04, 2.7),
        this.materials.ledWarmWhite
      );
      led.position.set(pos.x, 3.1, pos.z);
      this.groundGroup.add(led);

      const rod1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 6), this.materials.stainlessSteel);
      rod1.position.set(pos.x, 3.25, pos.z - 1.1);
      this.groundGroup.add(rod1);
      const rod2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 6), this.materials.stainlessSteel);
      rod2.position.set(pos.x, 3.25, pos.z + 1.1);
      this.groundGroup.add(rod2);
    });

    // Real PointLight inside the covered garage to illuminate the 4 cars and floor
    const garagePointLight = new THREE.PointLight(0xfffaed, 2.4, 20, 1.2);
    garagePointLight.position.set(-0.6, 3.0, -8.7);
    this.groundGroup.add(garagePointLight);
  }

  private buildFrontLeftGarage() {
    this.createProceduralCar(-4.8, 0.1, 6.2, 'white', 0, this.groundGroup);

    // Motorized shutter door on the front wall
    const shutterGeo = new THREE.BoxGeometry(3.2, 2.7, 0.08);
    const shutterMesh = new THREE.Mesh(shutterGeo, this.materials.garageShutter);
    shutterMesh.position.set(-4.8, 1.35, 9.2);
    this.groundGroup.add(shutterMesh);

    // Shutter frame
    const frameGeo = new THREE.BoxGeometry(3.4, 0.15, 0.15);
    const shutterHeader = new THREE.Mesh(frameGeo, this.materials.aluminumFrame);
    shutterHeader.position.set(-4.8, 2.78, 9.2);
    this.groundGroup.add(shutterHeader);
  }

  private buildGroundShowrooms() {
    this.buildSingleShowroom(-1.0, 6.7, 4.27, 4.88, 'Shop 1');
    this.buildSingleShowroom(3.5, 6.7, 4.27, 4.88, 'Shop 2');

    const divWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 4.88), this.materials.interiorWall);
    divWall.position.set(1.2, 1.6, 6.7);
    this.groundGroup.add(divWall);
  }

  private buildSingleShowroom(cx: number, cz: number, w: number, d: number, name: string) {
    const shopGroup = new THREE.Group();
    shopGroup.position.set(cx, 0, cz);

    // Clear entrance glass storefront
    const glassW = w - 0.4;
    const glassGeo = new THREE.BoxGeometry(glassW, 2.8, 0.05);
    const glassMesh = new THREE.Mesh(glassGeo, this.materials.glassShopfront);
    glassMesh.position.set(0, 1.4, d / 2);
    shopGroup.add(glassMesh);

    // Solid transom header above storefront
    const transomHeader = new THREE.Mesh(
      new THREE.BoxGeometry(glassW, 0.4, 0.2),
      this.materials.facadePanel
    );
    transomHeader.position.set(0, 3.0, d / 2);
    shopGroup.add(transomHeader);

    // Glass framing mullions
    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(glassW, 0.08, 0.1), this.materials.aluminumFrame);
    frameTop.position.set(0, 2.8, d / 2);
    shopGroup.add(frameTop);

    const frameBot = new THREE.Mesh(new THREE.BoxGeometry(glassW, 0.08, 0.1), this.materials.aluminumFrame);
    frameBot.position.set(0, 0.04, d / 2);
    shopGroup.add(frameBot);

    // Glass entrance door handle
    const doorHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8), this.materials.stainlessSteel);
    doorHandle.position.set(0.4, 1.1, d / 2 + 0.05);
    shopGroup.add(doorHandle);

    // Reception / Checkout counter
    const counterGeo = new THREE.BoxGeometry(1.8, 1.05, 0.7);
    const counterMesh = new THREE.Mesh(counterGeo, this.materials.countertopGranite);
    counterMesh.position.set(0, 0.525, 0.8);
    counterMesh.castShadow = true;
    shopGroup.add(counterMesh);

    const monitorGeo = new THREE.BoxGeometry(0.5, 0.35, 0.04);
    const monitorMesh = new THREE.Mesh(monitorGeo, this.materials.aluminumFrame);
    monitorMesh.position.set(0, 1.25, 0.8);
    shopGroup.add(monitorMesh);

    const chairGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.75, 12);
    const chairMesh = new THREE.Mesh(chairGeo, this.materials.officeChair);
    chairMesh.position.set(0, 0.375, 0.1);
    shopGroup.add(chairMesh);

    // Wall shelving displays
    const shelfGeoL = new THREE.BoxGeometry(0.35, 2.2, 3.2);
    const shelfL = new THREE.Mesh(shelfGeoL, this.materials.woodDesk);
    shelfL.position.set(-w / 2 + 0.25, 1.1, 0);
    shelfL.castShadow = true;
    shopGroup.add(shelfL);

    const shelfGeoR = new THREE.BoxGeometry(0.35, 2.2, 3.2);
    const shelfR = new THREE.Mesh(shelfGeoR, this.materials.woodDesk);
    shelfR.position.set(w / 2 - 0.25, 1.1, 0);
    shelfR.castShadow = true;
    shopGroup.add(shelfR);

    // Rear double door leading into central lobby
    const rearDoor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.3, 0.08), this.materials.woodDesk);
    rearDoor.position.set(0, 1.15, -d / 2);
    shopGroup.add(rearDoor);

    this.groundGroup.add(shopGroup);
  }

  // 3. DUAL STAIRCASES (Both Upper and Lower Staircases with 100% Vertical Accuracy)
  private buildDualStaircaseCore(floorY: number, parent: THREE.Group) {
    const stairCoreGroup = new THREE.Group();
    // Center of staircase core at X = -4.8, Z = -0.8
    stairCoreGroup.position.set(-4.8, floorY, -0.8);

    const totalRise = BUILDING_DIMENSIONS.floorHeight; // 3.35 m
    const midHeight = totalRise / 2; // 1.675 m
    const stepsPerFlight = 10;
    const riserH = midHeight / stepsPerFlight; // ~0.167 m per riser
    const treadD = 0.28; // ~11 inches tread depth
    const flightW = 1.2; // 1.2 m flight width (~4 ft)

    // ----------------------------------------------------
    // STAIR 1: UPPER STAIRCAS (NORTH CORE: Z = -1.6 in core)
    // ----------------------------------------------------
    const upperStair = new THREE.Group();
    upperStair.position.set(0, 0, -1.6);

    // Flight 1: Starts at X = 1.6 (near lobby portal), rises up towards West wall landing at X = -1.2
    for (let i = 0; i < stepsPerFlight; i++) {
      const stepX = 1.4 - (i + 0.5) * treadD;
      const stepY = (i + 0.5) * riserH;

      // Dark polished stone tread
      const tread = new THREE.Mesh(new THREE.BoxGeometry(treadD, 0.04, flightW), this.materials.stairTread);
      tread.position.set(stepX, stepY + riserH / 2 - 0.02, -flightW / 2 - 0.05);
      tread.castShadow = true;
      upperStair.add(tread);

      // White architectural riser
      const riser = new THREE.Mesh(new THREE.BoxGeometry(0.03, riserH, flightW), this.materials.stairRiser);
      riser.position.set(stepX - treadD / 2, stepY, -flightW / 2 - 0.05);
      upperStair.add(riser);
    }

    // Mid-landing at West exterior wall (Y = 1.675 m)
    const midLandingUpper = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.15, flightW * 2 + 0.2),
      this.materials.stairTread
    );
    midLandingUpper.position.set(-1.8, midHeight - 0.075, 0);
    midLandingUpper.castShadow = true;
    upperStair.add(midLandingUpper);

    // Flight 2: Starts at West landing, rises up towards East lobby at Y = 3.35 m
    for (let i = 0; i < stepsPerFlight; i++) {
      const stepX = -1.0 + (i + 0.5) * treadD;
      const stepY = midHeight + (i + 0.5) * riserH;

      const tread = new THREE.Mesh(new THREE.BoxGeometry(treadD, 0.04, flightW), this.materials.stairTread);
      tread.position.set(stepX, stepY + riserH / 2 - 0.02, flightW / 2 + 0.05);
      tread.castShadow = true;
      upperStair.add(tread);

      const riser = new THREE.Mesh(new THREE.BoxGeometry(0.03, riserH, flightW), this.materials.stairRiser);
      riser.position.set(stepX - treadD / 2, stepY, flightW / 2 + 0.05);
      upperStair.add(riser);
    }

    // Handrail & Glass Balustrade for Upper Stair
    const railUpperGeo = new THREE.CylinderGeometry(0.025, 0.025, stepsPerFlight * treadD * 1.3, 8);
    const rail1 = new THREE.Mesh(railUpperGeo, this.materials.stainlessSteel);
    rail1.rotation.z = Math.atan2(midHeight, stepsPerFlight * treadD);
    rail1.position.set(0, midHeight / 2 + 0.85, -flightW - 0.1);
    upperStair.add(rail1);

    const rail2 = new THREE.Mesh(railUpperGeo, this.materials.stainlessSteel);
    rail2.rotation.z = -Math.atan2(midHeight, stepsPerFlight * treadD);
    rail2.position.set(0, midHeight * 1.5 + 0.85, flightW + 0.1);
    upperStair.add(rail2);

    stairCoreGroup.add(upperStair);

    // ----------------------------------------------------
    // STAIR 2: LOWER STAIRCAS (SOUTH CORE: Z = 1.6 in core)
    // ----------------------------------------------------
    const lowerStair = new THREE.Group();
    lowerStair.position.set(0, 0, 1.6);

    // Flight 1: Starts at lobby entrance (where CAD "UP" arrow is), rises towards West wall
    for (let i = 0; i < stepsPerFlight; i++) {
      const stepX = 1.4 - (i + 0.5) * treadD;
      const stepY = (i + 0.5) * riserH;

      const tread = new THREE.Mesh(new THREE.BoxGeometry(treadD, 0.04, flightW), this.materials.stairTread);
      tread.position.set(stepX, stepY + riserH / 2 - 0.02, flightW / 2 + 0.05);
      tread.castShadow = true;
      lowerStair.add(tread);

      const riser = new THREE.Mesh(new THREE.BoxGeometry(0.03, riserH, flightW), this.materials.stairRiser);
      riser.position.set(stepX - treadD / 2, stepY, flightW / 2 + 0.05);
      lowerStair.add(riser);
    }

    // Mid-landing at West exterior wall (Y = 1.675 m)
    const midLandingLower = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.15, flightW * 2 + 0.2),
      this.materials.stairTread
    );
    midLandingLower.position.set(-1.8, midHeight - 0.075, 0);
    midLandingLower.castShadow = true;
    lowerStair.add(midLandingLower);

    // Flight 2: Starts at West landing, rises up towards East
    for (let i = 0; i < stepsPerFlight; i++) {
      const stepX = -1.0 + (i + 0.5) * treadD;
      const stepY = midHeight + (i + 0.5) * riserH;

      const tread = new THREE.Mesh(new THREE.BoxGeometry(treadD, 0.04, flightW), this.materials.stairTread);
      tread.position.set(stepX, stepY + riserH / 2 - 0.02, -flightW / 2 - 0.05);
      tread.castShadow = true;
      lowerStair.add(tread);

      const riser = new THREE.Mesh(new THREE.BoxGeometry(0.03, riserH, flightW), this.materials.stairRiser);
      riser.position.set(stepX - treadD / 2, stepY, -flightW / 2 - 0.05);
      lowerStair.add(riser);
    }

    // Handrail for Lower Stair
    const rail3 = new THREE.Mesh(railUpperGeo, this.materials.stainlessSteel);
    rail3.rotation.z = Math.atan2(midHeight, stepsPerFlight * treadD);
    rail3.position.set(0, midHeight / 2 + 0.85, flightW + 0.1);
    lowerStair.add(rail3);

    const rail4 = new THREE.Mesh(railUpperGeo, this.materials.stainlessSteel);
    rail4.rotation.z = -Math.atan2(midHeight, stepsPerFlight * treadD);
    rail4.position.set(0, midHeight * 1.5 + 0.85, -flightW - 0.1);
    lowerStair.add(rail4);

    stairCoreGroup.add(lowerStair);

    // ----------------------------------------------------
    // ARCHITECTURAL CORE PARTITIONS & OPEN LOBBY PORTALS
    // ----------------------------------------------------
    // North partition wall of stairwell
    const wallNorth = new THREE.Mesh(new THREE.BoxGeometry(3.6, totalRise, 0.2), this.materials.interiorWall);
    wallNorth.position.set(0, totalRise / 2, -3.1);
    stairCoreGroup.add(wallNorth);

    // South partition wall of stairwell
    const wallSouth = new THREE.Mesh(new THREE.BoxGeometry(3.6, totalRise, 0.2), this.materials.interiorWall);
    wallSouth.position.set(0, totalRise / 2, 3.1);
    stairCoreGroup.add(wallSouth);

    // East core wall facing central lobby with 2 GRAND OPEN PORTALS for both staircases!
    // Wall segment between the two stairs
    const wallMidEast = new THREE.Mesh(new THREE.BoxGeometry(0.2, totalRise, 0.6), this.materials.interiorWall);
    wallMidEast.position.set(1.9, totalRise / 2, 0);
    stairCoreGroup.add(wallMidEast);

    // Portal header beams (architraves)
    const headerUpper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 2.5), this.materials.interiorWall);
    headerUpper.position.set(1.9, totalRise - 0.35, -1.6);
    stairCoreGroup.add(headerUpper);

    const headerLower = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 2.5), this.materials.interiorWall);
    headerLower.position.set(1.9, totalRise - 0.35, 1.6);
    stairCoreGroup.add(headerLower);

    // WEST EXTERIOR CURTAIN WALL FEATURE GLAZING (Allows both staircases to be vividly seen from the outside!)
    const stairGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, totalRise, 5.8),
      this.materials.glassCurtain
    );
    stairGlass.position.set(-2.3, totalRise / 2, 0);
    stairCoreGroup.add(stairGlass);

    // Architectural dark vertical aluminum mullions across stair window
    for (let z = -2.6; z <= 2.6; z += 1.3) {
      const mul = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, totalRise, 0.08),
        this.materials.aluminumFrame
      );
      mul.position.set(-2.3, totalRise / 2, z);
      stairCoreGroup.add(mul);
    }

    // Add fully assembled staircase core to parent floor group!
    parent.add(stairCoreGroup);
  }

  // 4. LIFT CORE (1750 mm x 1800 mm)
  private buildLiftCore(floorY: number, parent: THREE.Group) {
    const liftW = 1.75;
    const liftD = 1.80;
    const liftH = BUILDING_DIMENSIONS.floorHeight;
    const lx = -1.4;
    const lz = -2.3;

    const liftGroup = new THREE.Group();
    liftGroup.position.set(lx, floorY, lz);

    const wallThick = 0.2;

    const rearWall = new THREE.Mesh(new THREE.BoxGeometry(liftW + 2 * wallThick, liftH, wallThick), this.materials.interiorWall);
    rearWall.position.set(0, liftH / 2, -liftD / 2 - wallThick / 2);
    liftGroup.add(rearWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, liftH, liftD), this.materials.interiorWall);
    leftWall.position.set(-liftW / 2 - wallThick / 2, liftH / 2, 0);
    liftGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, liftH, liftD), this.materials.interiorWall);
    rightWall.position.set(liftW / 2 + wallThick / 2, liftH / 2, 0);
    liftGroup.add(rightWall);

    const frontWallL = new THREE.Mesh(new THREE.BoxGeometry(0.35, liftH, wallThick), this.materials.interiorWall);
    frontWallL.position.set(-liftW / 2 + 0.175, liftH / 2, liftD / 2 + wallThick / 2);
    liftGroup.add(frontWallL);

    const frontWallR = new THREE.Mesh(new THREE.BoxGeometry(0.35, liftH, wallThick), this.materials.interiorWall);
    frontWallR.position.set(liftW / 2 - 0.175, liftH / 2, liftD / 2 + wallThick / 2);
    liftGroup.add(frontWallR);

    const doorHeader = new THREE.Mesh(new THREE.BoxGeometry(1.05, liftH - 2.3, wallThick), this.materials.interiorWall);
    doorHeader.position.set(0, 2.3 + (liftH - 2.3) / 2, liftD / 2 + wallThick / 2);
    liftGroup.add(doorHeader);

    // Stainless steel automatic lift doors
    const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.52, 2.25, 0.04), this.materials.liftDoor);
    doorL.position.set(-0.25, 1.125, liftD / 2 + wallThick / 2);
    liftGroup.add(doorL);

    const doorR = new THREE.Mesh(new THREE.BoxGeometry(0.52, 2.25, 0.04), this.materials.liftDoor);
    doorR.position.set(0.25, 1.125, liftD / 2 + wallThick / 2);
    liftGroup.add(doorR);

    parent.add(liftGroup);
  }

  private buildGroundLobbyAndUtilities() {
    // 3-Piece sofa lounge set and coffee table matching CAD plan
    const sofaL = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.75, 0.8), this.materials.leatherSofa);
    sofaL.position.set(-0.6, 0.375, 1.6);
    sofaL.castShadow = true;
    this.groundGroup.add(sofaL);

    const sofaR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.75, 1.2), this.materials.leatherSofa);
    sofaR.position.set(0.8, 0.375, 0.9);
    sofaR.castShadow = true;
    this.groundGroup.add(sofaR);

    const table = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.8), this.materials.woodDesk);
    table.position.set(-0.6, 0.2, 0.5);
    table.castShadow = true;
    this.groundGroup.add(table);

    // Pantry: 6'0" x 8'0" (1.83m x 2.44m)
    const px = 3.2;
    const pz = 0.2;
    const pantryGroup = new THREE.Group();
    pantryGroup.position.set(px, 0, pz);

    const pCounter = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.6), this.materials.countertopGranite);
    pCounter.position.set(0, 0.45, -0.8);
    pCounter.castShadow = true;
    pantryGroup.add(pCounter);

    const sink = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.4), this.materials.stainlessSteel);
    sink.position.set(0, 0.92, -0.8);
    pantryGroup.add(sink);

    const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8), this.materials.stainlessSteel);
    tap.position.set(0, 1.05, -0.95);
    pantryGroup.add(tap);

    const pWallN = new THREE.Mesh(new THREE.BoxGeometry(1.83, 3.35, 0.12), this.materials.interiorWall);
    pWallN.position.set(0, 1.675, -1.22);
    pantryGroup.add(pWallN);

    const pWallW = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.35, 2.44), this.materials.interiorWall);
    pWallW.position.set(-0.915, 1.675, 0);
    pantryGroup.add(pWallW);

    this.groundGroup.add(pantryGroup);

    // Two Separate Toilets: 6'0" x 7'0" (1.83m x 2.13m) each
    this.buildSingleToilet(2.3, 2.8, 1.83, 2.13, this.groundGroup);
    this.buildSingleToilet(4.3, 2.8, 1.83, 2.13, this.groundGroup);
  }

  private buildSingleToilet(tx: number, tz: number, w: number, d: number, parent: THREE.Group) {
    const toiletGroup = new THREE.Group();
    toiletGroup.position.set(tx, 0, tz);

    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.42, 12), this.materials.sanitaryPorcelain);
    bowl.position.set(0, 0.21, 0.6);
    toiletGroup.add(bowl);

    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.2), this.materials.sanitaryPorcelain);
    tank.position.set(0, 0.6, 0.85);
    toiletGroup.add(tank);

    const basin = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.15, 0.35), this.materials.sanitaryPorcelain);
    basin.position.set(0, 0.85, -0.7);
    toiletGroup.add(basin);

    const tWallN = new THREE.Mesh(new THREE.BoxGeometry(w, 3.35, 0.12), this.materials.interiorWall);
    tWallN.position.set(0, 1.675, -d / 2);
    toiletGroup.add(tWallN);

    const tWallS = new THREE.Mesh(new THREE.BoxGeometry(w, 3.35, 0.12), this.materials.interiorWall);
    tWallS.position.set(0, 1.675, d / 2);
    toiletGroup.add(tWallS);

    const tWallW = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.35, d), this.materials.interiorWall);
    tWallW.position.set(-w / 2, 1.675, 0);
    toiletGroup.add(tWallW);

    const tWallE = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.35, d), this.materials.interiorWall);
    tWallE.position.set(w / 2, 1.675, 0);
    toiletGroup.add(tWallE);

    parent.add(toiletGroup);
  }

  // Solid commercial building exterior envelope for ground floor
  private buildGroundCommercialFacade() {
    const h = BUILDING_DIMENSIONS.floorHeight/2;

    // West solid wall sections
    // 1. Front-south wall (flanking entrance and staircase feature window)
    const leftWallSouth = new THREE.Mesh(new THREE.BoxGeometry(0.25, h, 6.8), this.materials.facadePanel);
    leftWallSouth.position.set(-7.1, h / 2, 5.8);
    leftWallSouth.castShadow = true;
    this.groundGroup.add(leftWallSouth);

    // 2. Rear-left exterior wall (Z = -3.8 to -13.6, length = 9.8m):
    // Half-height exterior wall (hHalf = 1.4m) with coping cap so the left 2 parking garages (Car 3 & Car 1) are clearly visible!
    const hHalf = 1.4; // Half-height exterior wall (~4'7") leaving top half (1.4m to 3.35m) open air
    const leftWallNorthHalf = new THREE.Mesh(new THREE.BoxGeometry(0.25, hHalf, 9.8), this.materials.facadePanel);
    leftWallNorthHalf.position.set(-7.1, hHalf / 2, -8.7);
    leftWallNorthHalf.castShadow = true;
    this.groundGroup.add(leftWallNorthHalf);

    const leftWallNorthCoping = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 9.86), this.materials.aluminumFrame);
    leftWallNorthCoping.position.set(-7.1, hHalf + 0.025, -8.7);
    this.groundGroup.add(leftWallNorthCoping);

    const leftWallRail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 9.8, 12), this.materials.stainlessSteel);
    leftWallRail.rotation.x = Math.PI / 2;
    leftWallRail.position.set(-7.1, hHalf + 0.12, -8.7);
    this.groundGroup.add(leftWallRail);

    // North / Backside exterior wall across all 4 garage bays (Z = -13.6, X: -7.2 to 7.6, width = 14.8m)
    // HALF-HEIGHT EXTERIOR WALL (hHalf = 1.4m) with top half open air:
    // Gives 100% direct visual clarity over the wall into all 4 parking bays, cars, and dividing structure!
    const rearHalfWall = new THREE.Mesh(new THREE.BoxGeometry(14.8, hHalf, 0.25), this.materials.facadePanel);
    rearHalfWall.position.set(0.2, hHalf / 2, -13.6);
    rearHalfWall.castShadow = true;
    this.groundGroup.add(rearHalfWall);

    const rearCoping = new THREE.Mesh(new THREE.BoxGeometry(14.86, 0.05, 0.32), this.materials.aluminumFrame);
    rearCoping.position.set(0.2, hHalf + 0.025, -13.6);
    this.groundGroup.add(rearCoping);

    // Sleek stainless steel safety handrail tube at top of half-wall
    const rearRail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 14.8, 12), this.materials.stainlessSteel);
    rearRail.rotation.z = Math.PI / 2;
    rearRail.position.set(0.2, hHalf + 0.12, -13.6);
    this.groundGroup.add(rearRail);

    // Stanchion posts for rear handrail
    [-6.8, -2.4, 0.2, 3.2, 7.4].forEach((rx) => {
      const stanchion = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8), this.materials.stainlessSteel);
      stanchion.position.set(rx, hHalf + 0.06, -13.6);
      this.groundGroup.add(stanchion);
    });

    // East facade:
    // 1. Front-right wall (Showroom 2): Z = 9.2 to 3.5 at X = 5.2 (full height)
    const eastWallFront = new THREE.Mesh(new THREE.BoxGeometry(0.25, h, 5.7), this.materials.facadePanel);
    eastWallFront.position.set(5.2, h / 2, 6.35);
    eastWallFront.castShadow = true;
    this.groundGroup.add(eastWallFront);

    // 2. Middle section: LESSER WIDTH BEFORE GARAGE PART! (Z = 3.5 to -3.8 at X = 4.8, full height lobby/toilets)
    const eastWallMid = new THREE.Mesh(new THREE.BoxGeometry(0.25, h, 7.3), this.materials.facadePanel);
    eastWallMid.position.set(4.8, h / 2, -0.15);
    eastWallMid.castShadow = true;
    this.groundGroup.add(eastWallMid);

    // 3. Step wall extending out to the right where the garages are (at Z = -3.8, X: 4.8 to 7.6, width = 2.8m):
    // HALF-HEIGHT EXTERIOR WALL (hHalf = 1.4m) with coping cap so sightlines from driveway/front-right look straight into the front 2 garages!
    const eastStepHalfWall = new THREE.Mesh(new THREE.BoxGeometry(2.8, hHalf, 0.25), this.materials.facadePanel);
    eastStepHalfWall.position.set(6.2, hHalf / 2, -3.8);
    eastStepHalfWall.castShadow = true;
    this.groundGroup.add(eastStepHalfWall);

    const eastStepCoping = new THREE.Mesh(new THREE.BoxGeometry(2.86, 0.05, 0.32), this.materials.aluminumFrame);
    eastStepCoping.position.set(6.2, hHalf + 0.025, -3.8);
    this.groundGroup.add(eastStepCoping);

    const eastStepRail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.8, 12), this.materials.stainlessSteel);
    eastStepRail.rotation.z = Math.PI / 2;
    eastStepRail.position.set(6.2, hHalf + 0.12, -3.8);
    this.groundGroup.add(eastStepRail);

    // 4. Backside garage right facade (Z: -3.8 to -13.6 at X = 7.6, length = 9.8m):
    // HALF-HEIGHT EXTERIOR WALL (hHalf = 1.4m) along the open vehicular driveway!
    // Top half (1.4m to 3.35m) is wide open air so all 4 parking garages and cars are immediately and clearly visible from the driveway
    const eastGarageHalfWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, hHalf, 9.8), this.materials.facadePanel);
    eastGarageHalfWall.position.set(7.6, hHalf / 2, -8.7);
    eastGarageHalfWall.castShadow = true;
    this.groundGroup.add(eastGarageHalfWall);

    const eastGarageCoping = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 9.86), this.materials.aluminumFrame);
    eastGarageCoping.position.set(7.6, hHalf + 0.025, -8.7);
    this.groundGroup.add(eastGarageCoping);

    const eastGarageRail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 9.8, 12), this.materials.stainlessSteel);
    eastGarageRail.rotation.x = Math.PI / 2;
    eastGarageRail.position.set(7.6, hHalf + 0.12, -8.7);
    this.groundGroup.add(eastGarageRail);

    // Stanchion posts for east driveway guardrail
    [-4.2, -6.5, -8.7, -11.0, -13.2].forEach((ez) => {
      const stanchion = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8), this.materials.stainlessSteel);
      stanchion.position.set(7.6, hHalf + 0.06, ez);
      this.groundGroup.add(stanchion);
    });

    // Illuminated Clearance & Directional Parking Signage mounted on the east garage entrance column
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 2.4), this.materials.aluminumFrame);
    signBoard.position.set(7.65, 1.8, -4.8);
    this.groundGroup.add(signBoard);

    const signFace = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.28, 2.2), this.materials.signageGold);
    signFace.position.set(7.7, 1.8, -4.8);
    this.groundGroup.add(signFace);

    // Cantilevered Entrance Canopy over Ground Floor Showrooms
    const canopyW = 9.8;
    const canopyD = 1.8;
    const canopyGlass = new THREE.Mesh(
      new THREE.BoxGeometry(canopyW, 0.08, canopyD),
      this.materials.canopyGlass
    );
    canopyGlass.position.set(1.2, 3.4, 10.1);
    this.groundGroup.add(canopyGlass);

    // Canopy steel frame & support rods
    const canopyFrame = new THREE.Mesh(
      new THREE.BoxGeometry(canopyW + 0.1, 0.12, canopyD + 0.1),
      this.materials.aluminumFrame
    );
    canopyFrame.position.set(1.2, 3.4, 10.1);
    this.groundGroup.add(canopyFrame);

    // Canopy LED Edge Glow Accent Line (High-End Architectural Visual Design)
    const ledEdge = new THREE.Mesh(
      new THREE.BoxGeometry(canopyW + 0.14, 0.04, 0.04),
      this.materials.ledCyanGlow
    );
    ledEdge.position.set(1.2, 3.38, 11.0);
    this.groundGroup.add(ledEdge);

    // Backlit Entrance Building Signage
    const mainSignBack = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.5, 0.06), this.materials.aluminumFrame);
    mainSignBack.position.set(1.2, 3.8, 9.35);
    this.groundGroup.add(mainSignBack);

    const mainSignLetters = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.36, 0.04), this.materials.signageGold);
    mainSignLetters.position.set(1.2, 3.8, 9.39);
    this.groundGroup.add(mainSignLetters);

    // Diagonal stainless steel suspension tie-rods
    const rodGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.2, 8);
    const rod1 = new THREE.Mesh(rodGeo, this.materials.stainlessSteel);
    rod1.rotation.x = Math.PI / 4;
    rod1.position.set(-3.2, 4.1, 10.0);
    this.groundGroup.add(rod1);

    const rod2 = new THREE.Mesh(rodGeo, this.materials.stainlessSteel);
    rod2.rotation.x = Math.PI / 4;
    rod2.position.set(5.6, 4.1, 10.0);
    this.groundGroup.add(rod2);
  }

  // 5. FIRST FLOOR (Y = 3.35 to 6.70)
  private buildFirstFloor() {
    const floorY = BUILDING_DIMENSIONS.floorHeight;

    // First Floor Slab with STAIRWELL CUTOUT VOID!
    const slabShape = this.createSlabShape(true);
    const slabGeo = new THREE.ExtrudeGeometry(slabShape, { depth: 0.22, bevelEnabled: false });
    const slabMesh = new THREE.Mesh(slabGeo, this.materials.floorTile);
    slabMesh.rotation.x = Math.PI / 2;
    slabMesh.position.y = floorY + 0.05;
    slabMesh.receiveShadow = true;
    this.firstGroup.add(slabMesh);

    // Floor Spandrel Fascia Band
    this.createFloorFasciaBand(floorY, this.firstGroup);

    // Columns for First Floor
    this.buildColumnsForFloor(floorY, this.firstGroup);

    // Core continuation: Dual Staircases & Lift (100% vertical continuity)
    this.buildDualStaircaseCore(floorY, this.firstGroup);
    this.buildLiftCore(floorY, this.firstGroup);

    // Utilities continuation: Pantry and Toilets
    const px = 3.2;
    const pz = 0.2;
    const pCounter = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.6), this.materials.countertopGranite);
    pCounter.position.set(px, floorY + 0.45, pz - 0.8);
    this.firstGroup.add(pCounter);

    this.buildSingleToilet(2.3, 2.8, 1.83, 2.13, this.firstGroup);
    this.buildSingleToilet(4.3, 2.8, 1.83, 2.13, this.firstGroup);

    // Four Authoritative Office Suites
    this.buildOfficeSuite(-3.8, floorY, -8.2, 6.71, 5.49, 'Rear-Left Office');
    this.buildOfficeSuite(3.1, floorY, -7.5, 4.88, 7.32, 'Rear-Right Office');
    this.buildOfficeSuite(-3.6, floorY, 6.0, 5.49, 6.10, 'Front-Left Office');
    this.buildOfficeSuite(2.8, floorY, 6.0, 4.88, 6.71, 'Front-Right Office');

    // Solid Commercial Facade with ribbon vision windows
    this.buildCommercialFacadeForFloor(floorY, this.firstGroup);

    // Register room clickable zones
    FIRST_ROOMS.forEach((room) => {
      this.createRoomHitBox(room, floorY, this.firstGroup);
    });
  }

  private buildOfficeSuite(
    cx: number,
    floorY: number,
    cz: number,
    w: number,
    d: number,
    title: string
  ) {
    const offGroup = new THREE.Group();
    offGroup.position.set(cx, floorY, cz);

    this.createWorkstationPod(0, 0, 0, offGroup);

    const couch = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.72, 0.75), this.materials.leatherSofa);
    couch.position.set(0, 0.36, -d / 2 + 0.65);
    couch.castShadow = true;
    offGroup.add(couch);

    const coffeeTab = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.38, 0.5), this.materials.woodDesk);
    coffeeTab.position.set(0, 0.19, -d / 2 + 1.3);
    offGroup.add(coffeeTab);

    this.createPottedPlant(-w / 2 + 0.6, d / 2 - 0.6, offGroup);

    this.firstGroup.add(offGroup);
  }

  private createWorkstationPod(x: number, y: number, z: number, parent: THREE.Group) {
    const pod = new THREE.Group();
    pod.position.set(x, y, z);

    const deskConfigs = [
      { dx: -0.85, dz: -0.65, rot: 0 },
      { dx: 0.85, dz: -0.65, rot: 0 },
      { dx: -0.85, dz: 0.65, rot: Math.PI },
      { dx: 0.85, dz: 0.65, rot: Math.PI },
    ];

    deskConfigs.forEach((cfg) => {
      const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.75), this.materials.woodDesk);
      deskTop.position.set(cfg.dx, 0.73, cfg.dz);
      deskTop.castShadow = true;
      pod.add(deskTop);

      const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8);
      const leg1 = new THREE.Mesh(legGeo, this.materials.metalRail);
      leg1.position.set(cfg.dx - 0.6, 0.35, cfg.dz - 0.3);
      pod.add(leg1);
      const leg2 = new THREE.Mesh(legGeo, this.materials.metalRail);
      leg2.position.set(cfg.dx + 0.6, 0.35, cfg.dz + 0.3);
      pod.add(leg2);

      const screen = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.36, 0.03), this.materials.aluminumFrame);
      screen.position.set(cfg.dx, 0.95, cfg.dz + (cfg.rot === 0 ? 0.25 : -0.25));
      pod.add(screen);

      const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.48), this.materials.officeChair);
      chairSeat.position.set(cfg.dx, 0.48, cfg.dz + (cfg.rot === 0 ? -0.55 : 0.55));
      chairSeat.castShadow = true;
      pod.add(chairSeat);

      const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.06), this.materials.officeChair);
      chairBack.position.set(cfg.dx, 0.75, cfg.dz + (cfg.rot === 0 ? -0.76 : 0.76));
      pod.add(chairBack);
    });

    parent.add(pod);
  }

  // Solid Commercial Facade with ribbon vision windows & architectural spandrels
  private buildCommercialFacadeForFloor(floorY: number, parent: THREE.Group) {
    const h = BUILDING_DIMENSIONS.floorHeight/2;

    // FRONT (SOUTH) FACADE:
    // 1. Solid spandrel sill wall (Y = 0 to 0.85m)
    const sillWallF = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.85, 0.25), this.materials.facadePanel);
    sillWallF.position.set(-0.7, floorY + 0.425, 9.2);
    parent.add(sillWallF);

    // 2. Vision Glass Ribbon (Y = 0.85 to 2.65m) - Realistic reflective architectural glass
    const visionGlassF = new THREE.Mesh(new THREE.BoxGeometry(12.8, 1.8, 0.06), this.materials.glassCurtain);
    visionGlassF.position.set(-0.7, floorY + 1.75, 9.2);
    parent.add(visionGlassF);

    // 3. Dark aluminum vertical mullions every 1.6m
    for (let x = -6.4; x <= 5.4; x += 1.6) {
      const mul = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 0.12), this.materials.aluminumFrame);
      mul.position.set(x, floorY + 1.75, 9.2);
      parent.add(mul);
    }

    // 4. Solid header panel (Y = 2.65 to 3.35m)
    const headerWallF = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.7, 0.25), this.materials.facadePanel);
    headerWallF.position.set(-0.7, floorY + 3.0, 9.2);
    parent.add(headerWallF);

    // 5. Vertical Architectural Solar Fins / Brise-Soleil (High-End Corporate Facade Visual Design)
    for (let x = -6.0; x <= 5.0; x += 1.6) {
      const fin = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 2.5, 0.28),
        this.materials.architecturalFin
      );
      fin.position.set(x, floorY + 1.75, 9.35);
      fin.castShadow = true;
      parent.add(fin);
    }

    // Interior Ceiling Recessed Architectural LED Lighting
    const ceilingLights = [
      { x: -3.6, z: 6.0 },
      { x: 2.8, z: 6.0 },
      { x: -3.8, z: -8.2 },
      { x: 3.1, z: -7.5 },
      { x: -0.6, z: 0.8 },
    ];
    ceilingLights.forEach((pos) => {
      const troffer = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.04, 1.2),
        this.materials.ledWarmWhite
      );
      troffer.position.set(pos.x, floorY + 3.25, pos.z);
      parent.add(troffer);
    });

    // REAR (NORTH) FACADE: (spanning X = -7.2 to 7.6 across all 4 bays, width = 14.8m)
    const sillWallR = new THREE.Mesh(new THREE.BoxGeometry(14.6, 0.85, 0.25), this.materials.facadePanel);
    sillWallR.position.set(0.2, floorY + 0.425, -13.6);
    parent.add(sillWallR);

    const visionGlassR = new THREE.Mesh(new THREE.BoxGeometry(14.4, 1.8, 0.06), this.materials.glassCurtain);
    visionGlassR.position.set(0.2, floorY + 1.75, -13.6);
    parent.add(visionGlassR);

    const headerWallR = new THREE.Mesh(new THREE.BoxGeometry(14.6, 0.7, 0.25), this.materials.facadePanel);
    headerWallR.position.set(0.2, floorY + 3.0, -13.6);
    parent.add(headerWallR);

    // WEST FACADE: Solid sections flanking the central staircase curtain wall
    const westWallSouth = new THREE.Mesh(new THREE.BoxGeometry(0.25, h, 6.8), this.materials.facadePanel);
    westWallSouth.position.set(-7.1, floorY + h / 2, 5.8);
    parent.add(westWallSouth);

    const westWallNorth = new THREE.Mesh(new THREE.BoxGeometry(0.25, h, 9.8), this.materials.facadePanel);
    westWallNorth.position.set(-7.1, floorY + h / 2, -8.7);
    parent.add(westWallNorth);

    // EAST FACADE:
    // 1. Front-right office wall: Z = 9.2 to 3.5 at X = 5.2
    const eastWallFront = new THREE.Mesh(new THREE.BoxGeometry(0.25, h, 5.7), this.materials.facadePanel);
    eastWallFront.position.set(5.2, floorY + h / 2, 6.35);
    parent.add(eastWallFront);

    // East vertical architectural fins
    for (let z = 4.2; z <= 8.6; z += 1.4) {
      const finE = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 2.5, 0.06),
        this.materials.architecturalFin
      );
      finE.position.set(5.35, floorY + 1.75, z);
      finE.castShadow = true;
      parent.add(finE);
    }

    // 2. Middle section: LESSER WIDTH BEFORE GARAGE PART! (Z = 3.5 to -3.8 at X = 4.8)
    const eastWallMid = new THREE.Mesh(new THREE.BoxGeometry(0.25, h, 7.3), this.materials.facadePanel);
    eastWallMid.position.set(4.8, floorY + h / 2, -0.15);
    parent.add(eastWallMid);

    // 3. Step wall extending to the right at Z = -3.8 (X: 4.8 to 7.6, width = 2.8m)
    const eastStepWall = new THREE.Mesh(new THREE.BoxGeometry(2.8, h, 0.25), this.materials.facadePanel);
    eastStepWall.position.set(6.2, floorY + h / 2, -3.8);
    parent.add(eastStepWall);

    // 4. Backside extended wall where the rear-right office is (Z: -3.8 to -13.6 at X = 7.6)
    const eastRearWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, h, 9.8), this.materials.facadePanel);
    eastRearWall.position.set(7.6, floorY + h / 2, -8.7);
    parent.add(eastRearWall);
  }

  // 6. UPPER FLOORS (G+3 Commercial Massing Shell per Prompt Section 5)
  private buildUpperFloors() {
    const fH = BUILDING_DIMENSIONS.floorHeight;

    // Second Floor (Y = 6.70m to 10.05m)
    this.buildUpperShell(fH * 2, this.secondGroup, '2nd Floor');

    // Third Floor (Y = 10.05m to 13.40m)
    this.buildUpperShell(fH * 3, this.thirdGroup, '3rd Floor');
  }

  private buildUpperShell(floorY: number, parent: THREE.Group, floorLabel: string) {
    // Floor slab with stairwell hole
    const slabShape = this.createSlabShape(true);
    const slabGeo = new THREE.ExtrudeGeometry(slabShape, { depth: 0.22, bevelEnabled: false });
    const slabMesh = new THREE.Mesh(slabGeo, this.materials.floorSlab);
    slabMesh.rotation.x = Math.PI / 2;
    slabMesh.position.y = floorY + 0.05;
    slabMesh.receiveShadow = true;
    parent.add(slabMesh);

    // Floor Spandrel Fascia Band
    this.createFloorFasciaBand(floorY, parent);

    // Continuous Columns
    this.buildColumnsForFloor(floorY, parent);

    // Core continuation: Dual Staircases & Lift continue all the way to G+3!
    this.buildDualStaircaseCore(floorY, parent);
    this.buildLiftCore(floorY, parent);

    // Solid Commercial Facade matching lower floors
    this.buildCommercialFacadeForFloor(floorY, parent);
  }

  // 7. ROOF LEVEL (Y = 13.40m)
  private buildRoof() {
    const roofY = BUILDING_DIMENSIONS.floorHeight * 4;

    // Roof Slab (solid with stair/lift headroom access)
    const slabShape = this.createSlabShape(true);
    const slabGeo = new THREE.ExtrudeGeometry(slabShape, { depth: 0.25, bevelEnabled: false });
    const slabMesh = new THREE.Mesh(slabGeo, this.materials.floorSlab);
    slabMesh.rotation.x = Math.PI / 2;
    slabMesh.position.y = roofY + 0.05;
    slabMesh.receiveShadow = true;
    this.roofGroup.add(slabMesh);

    // Roof Fascia Band
    this.createFloorFasciaBand(roofY, this.roofGroup);

    // Solid Parapet safety wall (1.1m = 3'7") around entire roof perimeter
    this.buildRoofParapets(roofY);

    // Staircase & Lift Overrun Headroom Penthouse Tower (+3.0m)
    const overrunGeo = new THREE.BoxGeometry(5.8, 3.2, 7.8);
    const overrunMesh = new THREE.Mesh(overrunGeo, this.materials.facadePanel);
    overrunMesh.position.set(-4.0, roofY + 1.6, -1.2);
    overrunMesh.castShadow = true;
    this.roofGroup.add(overrunMesh);

    // Commercial louvers on penthouse tower
    const louverGeo = new THREE.BoxGeometry(4.0, 1.4, 0.08);
    const louverMesh = new THREE.Mesh(louverGeo, this.materials.aluminumFrame);
    louverMesh.position.set(-4.0, roofY + 2.0, 2.75);
    this.roofGroup.add(louverMesh);

    // Rooftop HVAC Chiller units & cooling tower
    this.createHvacUnit(-0.5, roofY + 0.25, -7.0);
    this.createHvacUnit(2.2, roofY + 0.25, -7.0);
    this.createHvacUnit(1.5, roofY + 0.25, 4.0);
  }

  private buildRoofParapets(roofY: number) {
    const pH = BUILDING_DIMENSIONS.parapetHeight;
    const pThick = 0.22;

    // 1. Front Parapet (X: -7.2 to 5.2, width = 12.4m, centered at X = -1.0, Z = 9.2)
    const frontP = new THREE.Mesh(new THREE.BoxGeometry(12.4, pH, pThick), this.materials.facadePanel);
    frontP.position.set(-1.0, roofY + pH / 2, 9.2);
    this.roofGroup.add(frontP);

    const frontCap = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.06, pThick + 0.08), this.materials.aluminumFrame);
    frontCap.position.set(-1.0, roofY + pH + 0.03, 9.2);
    this.roofGroup.add(frontCap);

    // 2. Left (West) Parapet (Z: 9.2 to -13.6, length = 22.8m, centered at Z = -2.2, X = -7.2)
    const leftP = new THREE.Mesh(new THREE.BoxGeometry(pThick, pH, 22.8), this.materials.facadePanel);
    leftP.position.set(-7.2, roofY + pH / 2, -2.2);
    this.roofGroup.add(leftP);

    const leftCap = new THREE.Mesh(new THREE.BoxGeometry(pThick + 0.08, 0.06, 22.9), this.materials.aluminumFrame);
    leftCap.position.set(-7.2, roofY + pH + 0.03, -2.2);
    this.roofGroup.add(leftCap);

    // 3. Rear (North) Parapet across all 4 bays (X: -7.2 to 7.6, width = 14.8m, centered at X = 0.2, Z = -13.6)
    const rearP = new THREE.Mesh(new THREE.BoxGeometry(14.8, pH, pThick), this.materials.facadePanel);
    rearP.position.set(0.2, roofY + pH / 2, -13.6);
    this.roofGroup.add(rearP);

    const rearCap = new THREE.Mesh(new THREE.BoxGeometry(14.9, 0.06, pThick + 0.08), this.materials.aluminumFrame);
    rearCap.position.set(0.2, roofY + pH + 0.03, -13.6);
    this.roofGroup.add(rearCap);

    // 4. East Parapets matching footprint:
    // a. Front-right parapet (Z: 9.2 to 3.5, length = 5.7m, at X = 5.2, Z = 6.35)
    const eastFrontP = new THREE.Mesh(new THREE.BoxGeometry(pThick, pH, 5.7), this.materials.facadePanel);
    eastFrontP.position.set(5.2, roofY + pH / 2, 6.35);
    this.roofGroup.add(eastFrontP);

    const eastFrontCap = new THREE.Mesh(new THREE.BoxGeometry(pThick + 0.08, 0.06, 5.8), this.materials.aluminumFrame);
    eastFrontCap.position.set(5.2, roofY + pH + 0.03, 6.35);
    this.roofGroup.add(eastFrontCap);

    // b. Middle-right parapet (lesser width before garage part: Z = 3.5 to -3.8, length = 7.3m, at X = 4.8, Z = -0.15)
    const eastMidP = new THREE.Mesh(new THREE.BoxGeometry(pThick, pH, 7.3), this.materials.facadePanel);
    eastMidP.position.set(4.8, roofY + pH / 2, -0.15);
    this.roofGroup.add(eastMidP);

    const eastMidCap = new THREE.Mesh(new THREE.BoxGeometry(pThick + 0.08, 0.06, 7.4), this.materials.aluminumFrame);
    eastMidCap.position.set(4.8, roofY + pH + 0.03, -0.15);
    this.roofGroup.add(eastMidCap);

    // c. Step parapet extending to the right at Z = -3.8 (X: 4.8 to 7.6, width = 2.8m, at X = 6.2, Z = -3.8)
    const eastStepP = new THREE.Mesh(new THREE.BoxGeometry(2.8, pH, pThick), this.materials.facadePanel);
    eastStepP.position.set(6.2, roofY + pH / 2, -3.8);
    this.roofGroup.add(eastStepP);

    const eastStepCap = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.06, pThick + 0.08), this.materials.aluminumFrame);
    eastStepCap.position.set(6.2, roofY + pH + 0.03, -3.8);
    this.roofGroup.add(eastStepCap);

    // d. Backside-right parapet where the rear garages / office are (Z: -3.8 to -13.6, length = 9.8m, at X = 7.6, Z = -8.7)
    const eastRearP = new THREE.Mesh(new THREE.BoxGeometry(pThick, pH, 9.8), this.materials.facadePanel);
    eastRearP.position.set(7.6, roofY + pH / 2, -8.7);
    this.roofGroup.add(eastRearP);

    const eastRearCap = new THREE.Mesh(new THREE.BoxGeometry(pThick + 0.08, 0.06, 9.9), this.materials.aluminumFrame);
    eastRearCap.position.set(7.6, roofY + pH + 0.03, -8.7);
    this.roofGroup.add(eastRearCap);
  }

  private createHvacUnit(x: number, y: number, z: number) {
    const hvac = new THREE.Group();
    hvac.position.set(x, y, z);

    const boxGeo = new THREE.BoxGeometry(1.6, 1.2, 2.2);
    const box = new THREE.Mesh(boxGeo, this.materials.stainlessSteel);
    box.position.y = 0.6;
    box.castShadow = true;
    hvac.add(box);

    const louverGeo = new THREE.BoxGeometry(1.62, 0.8, 1.8);
    const louver = new THREE.Mesh(louverGeo, this.materials.aluminumFrame);
    louver.position.y = 0.6;
    hvac.add(louver);

    const fanGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
    const fan1 = new THREE.Mesh(fanGeo, this.materials.aluminumFrame);
    fan1.position.set(0, 1.3, -0.5);
    hvac.add(fan1);

    const fan2 = new THREE.Mesh(fanGeo, this.materials.aluminumFrame);
    fan2.position.set(0, 1.3, 0.5);
    hvac.add(fan2);

    this.roofGroup.add(hvac);
  }

  // 8. PROCEDURAL VEHICLES
  private createProceduralCar(
    x: number,
    y: number,
    z: number,
    colorType: string,
    rotY: number,
    parent: THREE.Group
  ) {
    const car = new THREE.Group();
    car.position.set(x, y, z);
    car.rotation.y = rotY;

    let paintMat = this.materials.carWhite;
    if (colorType === 'darkgray') paintMat = this.materials.carDarkGray;
    else if (colorType === 'blue') paintMat = this.materials.carBlue;
    else if (colorType === 'black') paintMat = this.materials.carBlack;

    const chassisGeo = new THREE.BoxGeometry(1.9, 0.55, 4.3);
    const chassis = new THREE.Mesh(chassisGeo, paintMat);
    chassis.position.y = 0.45;
    chassis.castShadow = true;
    car.add(chassis);

    const cabinGeo = new THREE.BoxGeometry(1.65, 0.5, 2.3);
    const cabin = new THREE.Mesh(cabinGeo, paintMat);
    cabin.position.set(0, 0.95, -0.2);
    cabin.castShadow = true;
    car.add(cabin);

    const glassGeo = new THREE.BoxGeometry(1.67, 0.42, 2.2);
    const glass = new THREE.Mesh(glassGeo, this.materials.carGlass);
    glass.position.set(0, 0.96, -0.2);
    car.add(glass);

    const tireMat = this.materials.carTire;
    const rimMat = this.materials.stainlessSteel;
    const wheelPositions = [
      [-0.95, 0.28, 1.25],
      [0.95, 0.28, 1.25],
      [-0.95, 0.28, -1.25],
      [0.95, 0.28, -1.25],
    ];

    wheelPositions.forEach(([wx, wy, wz]) => {
      const tireGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.22, 16);
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(wx, wy, wz);
      tire.castShadow = true;
      car.add(tire);

      const rimGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.23, 12);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      rim.position.set(wx, wy, wz);
      car.add(rim);
    });

    const headGeo = new THREE.BoxGeometry(0.35, 0.12, 0.05);
    const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const headL = new THREE.Mesh(headGeo, headMat);
    headL.position.set(-0.65, 0.48, 2.15);
    car.add(headL);
    const headR = new THREE.Mesh(headGeo, headMat);
    headR.position.set(0.65, 0.48, 2.15);
    car.add(headR);

    parent.add(car);
  }

  // 9. STRUCTURAL GRID LINES (18 Columns)
  private buildStructuralGridLines() {
    const lineMat = new THREE.LineDashedMaterial({
      color: 0x0284c7,
      dashSize: 0.5,
      gapSize: 0.2,
      linewidth: 1,
    });

    const h = BUILDING_DIMENSIONS.floorHeight * 4;

    STRUCTURAL_COLUMNS.forEach((col) => {
      const points = [
        new THREE.Vector3(col.x, 0, col.z),
        new THREE.Vector3(col.x, h, col.z),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, lineMat);
      line.computeLineDistances();
      this.gridLinesGroup.add(line);

      const markerCanvas = document.createElement('canvas');
      markerCanvas.width = 128;
      markerCanvas.height = 128;
      const mctx = markerCanvas.getContext('2d')!;
      mctx.fillStyle = '#0284c7';
      mctx.beginPath();
      mctx.arc(64, 64, 58, 0, Math.PI * 2);
      mctx.fill();
      mctx.fillStyle = '#ffffff';
      mctx.font = 'bold 48px sans-serif';
      mctx.textAlign = 'center';
      mctx.textBaseline = 'middle';
      mctx.fillText(col.gridRef, 64, 64);

      const mTex = new THREE.CanvasTexture(markerCanvas);
      const mMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 0.7),
        new THREE.MeshBasicMaterial({ map: mTex, transparent: true })
      );
      mMesh.rotation.x = -Math.PI / 2;
      mMesh.position.set(col.x, 0.05, col.z);
      this.gridLinesGroup.add(mMesh);
    });

    this.rootGroup.add(this.gridLinesGroup);
  }

  // 10. BLUEPRINT OVERLAYS
  private loadBlueprintOverlays() {
    const loader = new THREE.TextureLoader();

    loader.load(
      '/assets/aistudio/Detailed_Commercial_Ground_Floor_Plan_863446d9.png',
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const geo = new THREE.PlaneGeometry(16.5, 27.5);
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 0.88,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0.2, 0.26, -1.4);
        mesh.visible = false;
        this.groundBlueprintMesh = mesh;
        this.groundGroup.add(mesh);
      },
      undefined,
      (err) => console.log('Blueprint 1 texture load status:', err)
    );

    loader.load(
      '/assets/aistudio/First_Floor_Office_Plan_9b2b2502.png',
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const geo = new THREE.PlaneGeometry(15.8, 25.0);
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 0.88,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(-0.6, BUILDING_DIMENSIONS.floorHeight + 0.26, -2.2);
        mesh.visible = false;
        this.firstBlueprintMesh = mesh;
        this.firstGroup.add(mesh);
      },
      undefined,
      (err) => console.log('Blueprint 2 texture load status:', err)
    );
  }

  private createRoomHitBox(room: any, floorY: number, parent: THREE.Group) {
    const b = room.bounds;
    const hitGeo = new THREE.BoxGeometry(b.width, 3.2, b.depth);
    const hitMesh = new THREE.Mesh(hitGeo, this.materials.roomHighlightMaterial);
    hitMesh.position.set(b.x, floorY + 1.6, b.z);
    hitMesh.visible = false;
    hitMesh.userData = { roomData: room };
    this.roomHitMeshes.push(hitMesh);
    parent.add(hitMesh);
  }

  // Visibility & Exploded View Controller
  setFloorVisibility(visibility: FloorVisibility) {
    this.siteGroup.visible = visibility.site;
    this.groundGroup.visible = visibility.ground;
    this.firstGroup.visible = visibility.first;
    this.secondGroup.visible = visibility.second;
    this.thirdGroup.visible = visibility.third;
    this.roofGroup.visible = visibility.roof;
  }

  setLayerVisibility(layers: LayerVisibility) {
    this.gridLinesGroup.visible = layers.columnGrid;

    if (this.groundBlueprintMesh) {
      this.groundBlueprintMesh.visible = layers.blueprintOverlay;
    }
    if (this.firstBlueprintMesh) {
      this.firstBlueprintMesh.visible = layers.blueprintOverlay;
    }
  }

  setTransparentMode(enabled: boolean) {
    this.materials.setTransparentMode(enabled);
  }

  setExploded(factor: number) {
    this.explodedFactor = Math.max(0, Math.min(1, factor));
    const maxSpacing = 5.5;
    const dist = this.explodedFactor * maxSpacing;

    this.groundGroup.position.y = 0;
    this.firstGroup.position.y = dist;
    this.secondGroup.position.y = dist * 2;
    this.thirdGroup.position.y = dist * 3;
    this.roofGroup.position.y = dist * 4;
  }

  updateExplodedDamping(targetFactor: number, delta: number) {
    if (Math.abs(this.explodedFactor - targetFactor) > 0.001) {
      this.explodedFactor = THREE.MathUtils.damp(this.explodedFactor, targetFactor, 8, delta);
      this.setExploded(this.explodedFactor);
    }
  }

  dispose() {
    this.rootGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry.dispose();
      }
    });
  }
}
