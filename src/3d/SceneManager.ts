import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import { MaterialLibrary } from './materials';
import { BuildingModel } from './BuildingModel';
import { ELEVATION_VIEWS } from '../data/buildingData';
import { CameraPreset, FloorVisibility, LayerVisibility, RoomData } from '../types/architecture';

export class SceneManager {
  container: HTMLDivElement;
  scene: THREE.Scene;
  perspectiveCamera: THREE.PerspectiveCamera;
  orthographicCamera: THREE.OrthographicCamera;
  activeCamera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;

  materials: MaterialLibrary;
  building: BuildingModel;

  isSoftwareGl: boolean;
  isOrthographicMode: boolean = false;

  // Animation & Rendering loop state
  frameId: number = 0;
  clock: THREE.Clock;
  targetExplodedFactor: number = 0;

  // Camera transition state
  isTransitioningCamera: boolean = false;
  cameraStartPos: THREE.Vector3 = new THREE.Vector3();
  cameraEndPos: THREE.Vector3 = new THREE.Vector3();
  targetStart: THREE.Vector3 = new THREE.Vector3();
  targetEnd: THREE.Vector3 = new THREE.Vector3();
  transitionProgress: number = 1;
  transitionDuration: number = 0.8;

  // Raycaster for room inspection
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  hoveredRoom: RoomData | null = null;
  selectedRoom: RoomData | null = null;
  onRoomSelectCallback?: (room: RoomData | null) => void;
  onRoomHoverCallback?: (room: RoomData | null) => void;

  constructor(container: HTMLDivElement) {
    this.container = container;

    // 1. Detect software WebGL per Three.js skill
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const aspect = width / height;

    // 2. Setup Scene & Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf1f5f9);
    this.scene.fog = new THREE.FogExp2(0xf1f5f9, 0.012);

    // 3. Dual Cameras (Perspective for immersive 3D, Orthographic for CAD elevations)
    this.perspectiveCamera = new THREE.PerspectiveCamera(45, aspect, 0.2, 500);
    this.perspectiveCamera.position.set(22, 18, 26);

    const frustumSize = 35;
    this.orthographicCamera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      500
    );
    this.orthographicCamera.position.set(22, 18, 26);

    this.activeCamera = this.perspectiveCamera;

    // 4. WebGLRenderer with ACES Filmic tone mapping & SRGB output
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // Needed for high-res snapshot export
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 5. Procedural Studio Environment Reflection
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {
      console.warn('PMREM environment initialization skipped:', e);
    }

    // 6. OrbitControls
    this.controls = new OrbitControls(this.activeCamera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.06;
    this.controls.target.set(0, 4.5, 0);
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
    this.controls.minDistance = 4;
    this.controls.maxDistance = 140;

    // Cancel camera scripted transition on manual user orbit
    this.controls.addEventListener('start', () => {
      this.isTransitioningCamera = false;
    });

    // 7. Architectural 3-Point Lighting Rig
    this.setupLighting();

    // 8. Materials & Building Model
    this.materials = new MaterialLibrary(this.isSoftwareGl);
    this.building = new BuildingModel(this.materials);
    this.scene.add(this.building.rootGroup);

    // 9. Raycasting Setup
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.clock = new THREE.Clock();

    this.bindEvents();
    this.startLoop();
  }

  private setupLighting() {
    // 1. Warm Sun Key Light with Shadow Cascade
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    sunLight.position.set(24, 38, 20);
    sunLight.castShadow = !this.isSoftwareGl;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 90;
    const d = 26;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.02;
    this.scene.add(sunLight);

    // 2. Cool Sky / Ground Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x94a3b8, 0.9);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    // 3. North Fill Light (softens shadow areas in rear parking garage)
    const fillLight = new THREE.DirectionalLight(0xbfdbfe, 0.65);
    fillLight.position.set(-18, 22, -26);
    this.scene.add(fillLight);
  }

  private bindEvents() {
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.addEventListener('click', this.onPointerClick);
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height;

    this.perspectiveCamera.aspect = aspect;
    this.perspectiveCamera.updateProjectionMatrix();

    const frustumSize = 35;
    this.orthographicCamera.left = (-frustumSize * aspect) / 2;
    this.orthographicCamera.right = (frustumSize * aspect) / 2;
    this.orthographicCamera.top = frustumSize / 2;
    this.orthographicCamera.bottom = -frustumSize / 2;
    this.orthographicCamera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  private onPointerMove = (e: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.activeCamera);
    const intersects = this.raycaster.intersectObjects(this.building.roomHitMeshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const room = hit.userData.roomData as RoomData;
      if (this.hoveredRoom?.id !== room.id) {
        this.hoveredRoom = room;
        this.renderer.domElement.style.cursor = 'pointer';
        if (this.onRoomHoverCallback) this.onRoomHoverCallback(room);
      }
    } else {
      if (this.hoveredRoom !== null) {
        this.hoveredRoom = null;
        this.renderer.domElement.style.cursor = 'default';
        if (this.onRoomHoverCallback) this.onRoomHoverCallback(null);
      }
    }
  };

  private onPointerClick = (e: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.activeCamera);
    const intersects = this.raycaster.intersectObjects(this.building.roomHitMeshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const room = hit.userData.roomData as RoomData;
      this.selectedRoom = room;
      if (this.onRoomSelectCallback) this.onRoomSelectCallback(room);
    } else {
      this.selectedRoom = null;
      if (this.onRoomSelectCallback) this.onRoomSelectCallback(null);
    }
  };

  setCameraPreset(preset: CameraPreset) {
    const view = ELEVATION_VIEWS.find((v) => v.id === preset);
    if (!view) return;

    this.cameraStartPos.copy(this.activeCamera.position);
    this.cameraEndPos.set(view.position[0], view.position[1], view.position[2]);

    this.targetStart.copy(this.controls.target);
    this.targetEnd.set(view.target[0], view.target[1], view.target[2]);

    this.transitionProgress = 0;
    this.isTransitioningCamera = true;
  }

  setOrthographicMode(enabled: boolean) {
    if (this.isOrthographicMode === enabled) return;
    this.isOrthographicMode = enabled;

    const currentPos = this.activeCamera.position.clone();
    const currentTarget = this.controls.target.clone();

    if (enabled) {
      this.activeCamera = this.orthographicCamera;
    } else {
      this.activeCamera = this.perspectiveCamera;
    }

    this.activeCamera.position.copy(currentPos);
    this.controls.object = this.activeCamera;
    this.controls.target.copy(currentTarget);
    this.controls.update();
  }

  setFloorVisibility(vis: FloorVisibility) {
    this.building.setFloorVisibility(vis);
  }

  setLayerVisibility(layers: LayerVisibility) {
    this.building.setLayerVisibility(layers);
  }

  setTransparentMode(enabled: boolean) {
    this.building.setTransparentMode(enabled);
  }

  setExplodedSlider(val: number) {
    this.targetExplodedFactor = val;
  }

  // Animation render loop
  private startLoop() {
    const tick = () => {
      const delta = Math.min(this.clock.getDelta(), 0.1);

      // 1. Camera interpolation
      if (this.isTransitioningCamera) {
        this.transitionProgress += delta / this.transitionDuration;
        const t = Math.min(1, this.transitionProgress);
        // Smooth ease-in-out cubic
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        this.activeCamera.position.lerpVectors(this.cameraStartPos, this.cameraEndPos, ease);
        this.controls.target.lerpVectors(this.targetStart, this.targetEnd, ease);

        if (t >= 1) {
          this.isTransitioningCamera = false;
        }
      }

      // 2. Exploded floor animation with spring damping
      this.building.updateExplodedDamping(this.targetExplodedFactor, delta);

      // 3. OrbitControls update
      this.controls.update();

      // 4. Render
      this.renderer.render(this.scene, this.activeCamera);

      this.frameId = requestAnimationFrame(tick);
    };

    this.frameId = requestAnimationFrame(tick);
  }

  // Capture High-Res Snapshot
  captureScreenshot(): string {
    this.renderer.render(this.scene, this.activeCamera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  // Export 3D GLB
  exportGLB(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const exporter = new GLTFExporter();
      exporter.parse(
        this.building.rootGroup,
        (gltf) => {
          const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
          resolve(blob);
        },
        (err) => reject(err),
        { binary: true }
      );
    });
  }

  // Export 3D OBJ
  exportOBJ(): string {
    const exporter = new OBJExporter();
    return exporter.parse(this.building.rootGroup);
  }

  dispose() {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.removeEventListener('click', this.onPointerClick);

    this.controls.dispose();
    this.building.dispose();
    this.materials.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
