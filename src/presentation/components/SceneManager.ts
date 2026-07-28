import * as THREE from "three";
import type {
  CubeColor,
  CubeState,
  Face,
  Move,
} from "@/src/domain/cube";

const CUBIE_SIZE = 0.88;
const GAP = 1;
const DARK_BODY = 0x3e3e52;

const COLOR_HEX: Record<CubeColor, number> = {
  white: 0xffffff,
  red: 0xc82a1a,
  green: 0x35b978,
  yellow: 0xf0c928,
  orange: 0xff8800,
  blue: 0x367bd8,
};

const FACE_AXIS: Record<
  Face,
  { axis: "x" | "y" | "z"; layer: -1 | 1; quarter: -1 | 1 }
> = {
  U: { axis: "y", layer: 1, quarter: -1 },
  R: { axis: "x", layer: 1, quarter: -1 },
  F: { axis: "z", layer: 1, quarter: -1 },
  D: { axis: "y", layer: -1, quarter: 1 },
  L: { axis: "x", layer: -1, quarter: 1 },
  B: { axis: "z", layer: -1, quarter: 1 },
};

const AXIS_KEY: Record<string, "x" | "y" | "z"> = { x: "x", y: "y", z: "z" };

function stickerIndex(face: Face, x: number, y: number, z: number): number {
  switch (face) {
    case "U": return (z + 1) * 3 + (x + 1);
    case "D": return (1 - z) * 3 + (x + 1);
    case "R": return (1 - y) * 3 + (1 - z);
    case "L": return (1 - y) * 3 + (z + 1);
    case "F": return (1 - y) * 3 + (x + 1);
    case "B": return (1 - y) * 3 + (1 - x);
  }
}

type CubieData = {
  x: number;
  y: number;
  z: number;
  mesh: THREE.Mesh;
  edges: THREE.LineSegments;
};

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private cubies: CubieData[] = [];
  private cubieGroup: THREE.Group;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private pointerDownPos = { x: 0, y: 0 };
  private isDragging = false;
  private animating = false;
  private disposeCallback: (() => void)[] = [];
  private onStickerClick: ((face: Face, index: number) => void) | null = null;
  private animationId = 0;
  private moveAnimationId = 0;
  private disposed = false;
  private needsRebuild = false;
  private readonly cubieGeometry = new THREE.BoxGeometry(
    CUBIE_SIZE,
    CUBIE_SIZE,
    CUBIE_SIZE,
  );
  private readonly edgeGeometry = new THREE.EdgesGeometry(this.cubieGeometry);
  private readonly darkMaterial = new THREE.MeshPhongMaterial({
    color: DARK_BODY,
    specular: new THREE.Color(0x111122),
    shininess: 10,
  });
  private readonly stickerMaterials = Object.fromEntries(
    Object.entries(COLOR_HEX).map(([color, hex]) => [
      color,
      new THREE.MeshPhongMaterial({
        color: hex,
        shininess: 40,
        specular: new THREE.Color(0x222233),
      }),
    ]),
  ) as Record<CubeColor, THREE.MeshPhongMaterial>;
  private readonly edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x7777aa,
    transparent: true,
    opacity: 0.6,
  });

  constructor(container: HTMLDivElement) {
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn("[SceneManager] container has zero size, using fallback");
    }

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      40,
      Math.max(rect.width, 1) / Math.max(rect.height, 1),
      0.1,
      20,
    );
    this.camera.position.set(4.2, 3.2, 4.2);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "default",
      failIfMajorPerformanceCaveat: false,
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1));
    this.renderer.setClearColor(0x12122a, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = this.renderer.domElement;
    canvas.style.display = "block";
    container.appendChild(canvas);

    this.cubieGroup = new THREE.Group();
    this.scene.add(this.cubieGroup);

    this.setupLights();
    this.setupControls(container);
    this.setupInteraction(container);
    this.animate();
  }

  isValid(): boolean {
    try {
      const gl = this.renderer.getContext();
      return gl != null && !gl.isContextLost();
    } catch {
      return false;
    }
  }

  setOnStickerClick(cb: ((face: Face, index: number) => void) | null) {
    this.onStickerClick = cb;
  }

  updateState(state: CubeState) {
    if (this.cubies.length > 0 && !this.needsRebuild) {
      for (const cubie of this.cubies) {
        cubie.mesh.material = this.materialsForCubie(
          state,
          cubie.x,
          cubie.y,
          cubie.z,
        );
      }
      return;
    }

    this.clearCubies();
    this.needsRebuild = false;

    for (let x = -1; x <= 1; x += 1) {
      for (let y = -1; y <= 1; y += 1) {
        for (let z = -1; z <= 1; z += 1) {
          if (x === 0 && y === 0 && z === 0) continue;
          this.addCubie(state, x, y, z);
        }
      }
    }
  }

  animateMove(move: Move): Promise<void> {
    return new Promise((resolve) => {
      if (this.animating) { resolve(); return; }
      this.animating = true;

      const face = move[0] as Face;
      const suffix = move.slice(1);
      const turns = suffix === "2" ? 2 : suffix === "'" ? 3 : 1;
      const geo = FACE_AXIS[face];
      const axis = geo.axis;
      const layer = geo.layer;
      const axisIdx = AXIS_KEY[axis];
      const idx = { x: 0, y: 1, z: 2 }[axis];

      const rawAngle = (Math.PI / 2) * turns * geo.quarter;
      let totalAngle = rawAngle;
      if (totalAngle > Math.PI) totalAngle -= 2 * Math.PI;
      if (totalAngle < -Math.PI) totalAngle += 2 * Math.PI;

      const targetCubies = this.cubies.filter(
        (c) => [c.x, c.y, c.z][idx] === layer,
      );

      const pivot = new THREE.Group();
      this.cubieGroup.add(pivot);

      for (const c of targetCubies) {
        pivot.attach(c.mesh);
        pivot.attach(c.edges);
      }

      const angleRatio = Math.abs(totalAngle) / (Math.PI / 2);
      const duration = Math.round(380 * angleRatio);
      const startTime = performance.now();

      const animate = () => {
        if (this.disposed) {
          resolve();
          return;
        }
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const angle = eased * totalAngle;

        pivot.rotation.set(0, 0, 0);
        pivot.rotation[axisIdx] = angle;

        if (t < 1) {
          this.moveAnimationId = requestAnimationFrame(animate);
        } else {
          pivot.rotation.set(0, 0, 0);
          pivot.rotation[axisIdx] = totalAngle;

          for (const c of targetCubies) {
            this.cubieGroup.attach(c.mesh);
            this.cubieGroup.attach(c.edges);
          }
          this.cubieGroup.remove(pivot);
          this.needsRebuild = true;
          this.animating = false;
          resolve();
        }
      };

      animate();
    });
  }

  resize(width: number, height: number) {
    if (width === 0 || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.animationId);
    cancelAnimationFrame(this.moveAnimationId);
    this.clearCubies();
    this.cubieGeometry.dispose();
    this.edgeGeometry.dispose();
    this.darkMaterial.dispose();
    Object.values(this.stickerMaterials).forEach((material) =>
      material.dispose(),
    );
    this.edgeMaterial.dispose();
    this.renderer.forceContextLoss();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    for (const cb of this.disposeCallback) cb();
  }

  private addCubie(state: CubeState, x: number, y: number, z: number) {
    const materials = this.materialsForCubie(state, x, y, z);
    const mesh = new THREE.Mesh(this.cubieGeometry, materials);
    mesh.position.set(x * GAP, y * GAP, z * GAP);
    mesh.userData = { x, y, z, isCubie: true };

    const edges = new THREE.LineSegments(
      this.edgeGeometry,
      this.edgeMaterial,
    );
    edges.position.copy(mesh.position);

    this.cubieGroup.add(mesh);
    this.cubieGroup.add(edges);

    this.cubies.push({ x, y, z, mesh, edges });
  }

  private materialsForCubie(
    state: CubeState,
    x: number,
    y: number,
    z: number,
  ): THREE.Material[] {
    const faceConfigs: [number, boolean, Face][] = [
      [0, x === 1, "R"],
      [1, x === -1, "L"],
      [2, y === 1, "U"],
      [3, y === -1, "D"],
      [4, z === 1, "F"],
      [5, z === -1, "B"],
    ];

    return faceConfigs.map(([, isStickerFace, face]) => {
      if (isStickerFace) {
        const idx = stickerIndex(face, x, y, z);
        const colorName = state[face][idx];
        return this.stickerMaterials[colorName];
      }
      return this.darkMaterial;
    });
  }

  private clearCubies() {
    for (const c of this.cubies) {
      this.cubieGroup.remove(c.mesh);
      this.cubieGroup.remove(c.edges);
    }
    this.cubies = [];
  }

  private setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(5, 8, 6);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xaaaaff, 0.6);
    fill.position.set(-3, 1, -4);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffeecc, 0.5);
    rim.position.set(-2, -4, 5);
    this.scene.add(rim);

    const hemi = new THREE.HemisphereLight(0x8888ff, 0x444422, 0.6);
    this.scene.add(hemi);
  }

  private orbit = {
    active: false,
    prevX: 0,
    prevY: 0,
    theta: 0.6,
    phi: 0.4,
    distance: 7.5,
    target: new THREE.Vector3(0, 0, 0),
  };

  private setupControls(container: HTMLDivElement) {
    const onDown = (e: PointerEvent) => {
      this.orbit.active = true;
      this.orbit.prevX = e.clientX;
      this.orbit.prevY = e.clientY;
      container.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!this.orbit.active) return;
      const dx = e.clientX - this.orbit.prevX;
      const dy = e.clientY - this.orbit.prevY;
      this.orbit.theta += dx * 0.008;
      this.orbit.phi = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, this.orbit.phi + dy * 0.008),
      );
      this.orbit.prevX = e.clientX;
      this.orbit.prevY = e.clientY;
    };

    const onUp = () => {
      this.orbit.active = false;
    };

    const onWheel = (e: WheelEvent) => {
      this.orbit.distance = Math.max(
        3.5,
        Math.min(12, this.orbit.distance + e.deltaY * 0.006),
      );
    };

    container.addEventListener("pointerdown", onDown);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerup", onUp);
    container.addEventListener("wheel", onWheel, { passive: true });

    this.disposeCallback.push(() => {
      container.removeEventListener("pointerdown", onDown);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerup", onUp);
      container.removeEventListener("wheel", onWheel);
    });
  }

  private setupInteraction(container: HTMLDivElement) {
    const onDown = (e: PointerEvent) => {
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
      this.isDragging = false;
    };

    const onMove = (e: PointerEvent) => {
      if (
        Math.abs(e.clientX - this.pointerDownPos.x) > 4 ||
        Math.abs(e.clientY - this.pointerDownPos.y) > 4
      ) {
        this.isDragging = true;
      }
    };

    const onUp = (e: PointerEvent) => {
      if (this.isDragging || !this.onStickerClick) return;

      const rect = container.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hits = this.raycaster.intersectObjects(
        this.cubies.map((c) => c.mesh),
      );

      if (hits.length > 0) {
        const hit = hits[0];
        const mesh = hit.object as THREE.Mesh;
        const { x, y, z } = mesh.userData as Record<string, number>;
        const faceIdx = hit.faceIndex ?? 0;
        const matIdx = Math.floor(faceIdx / 2);

        const result = this.faceFromHit(matIdx, x, y, z);
        if (result) {
          this.onStickerClick(result.face, result.index);
        }
      }
    };

    container.addEventListener("pointerdown", onDown);
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerup", onUp);

    this.disposeCallback.push(() => {
      container.removeEventListener("pointerdown", onDown);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerup", onUp);
    });
  }

  private faceFromHit(
    matIdx: number,
    x: number,
    y: number,
    z: number,
  ): { face: Face; index: number } | null {
    switch (matIdx) {
      case 0: return x === 1 ? { face: "R", index: stickerIndex("R", x, y, z) } : null;
      case 1: return x === -1 ? { face: "L", index: stickerIndex("L", x, y, z) } : null;
      case 2: return y === 1 ? { face: "U", index: stickerIndex("U", x, y, z) } : null;
      case 3: return y === -1 ? { face: "D", index: stickerIndex("D", x, y, z) } : null;
      case 4: return z === 1 ? { face: "F", index: stickerIndex("F", x, y, z) } : null;
      case 5: return z === -1 ? { face: "B", index: stickerIndex("B", x, y, z) } : null;
      default: return null;
    }
  }

  private animate = () => {
    if (this.disposed) return;
    this.updateCamera();
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.animate);
  };

  private updateCamera() {
    const dist = this.orbit.distance;
    this.camera.position.x = dist * Math.sin(this.orbit.theta) * Math.cos(this.orbit.phi);
    this.camera.position.y = dist * Math.sin(this.orbit.phi);
    this.camera.position.z = dist * Math.cos(this.orbit.theta) * Math.cos(this.orbit.phi);
    this.camera.lookAt(this.orbit.target);
  }
}
