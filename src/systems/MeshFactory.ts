import * as THREE from "three";
import type { ItemDef } from "../types";

/**
 * Procedural low-poly meshes for placeable items. All meshes are
 * centered at (0,0,0) and aligned to the Y-up grid.
 */

const sharedMaterials = new Map<number, THREE.MeshStandardMaterial>();
function mat(color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}): THREE.MeshStandardMaterial {
  let m = sharedMaterials.get(color);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05, ...opts });
    sharedMaterials.set(color, m);
  }
  return m;
}

function box(w: number, h: number, d: number, color: number, y = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  mesh.position.y = y + h / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cyl(r: number, h: number, color: number, y = 0, segs = 12): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, segs), mat(color));
  mesh.position.y = y + h / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createMeshForItem(def: ItemDef): THREE.Object3D {
  const root = new THREE.Group();
  root.userData.itemId = def.id;
  switch (def.category) {
    case "floor":
      root.add(box(0.98, 0.05, 0.98, def.color, 0));
      break;
    case "wall":
      root.add(box(0.98, 1.8, 0.98, def.color, 0));
      // Top trim
      root.add(box(1.0, 0.1, 1.0, 0x4a3325, 1.7));
      break;
    case "door":
      // Frame
      root.add(box(0.98, 0.05, 0.98, 0x6a4a3a, 0));
      // Door arch
      root.add(box(0.7, 1.8, 0.1, 0x6a4a3a, 0));
      // Door panel
      root.add(box(0.6, 1.6, 0.08, def.color, 0.1));
      // Top trim
      root.add(box(0.7, 0.1, 0.1, 0x4a3325, 1.7));
      break;
    case "table": {
      const seats = def.seats ?? 2;
      // Table top
      const topR = seats <= 2 ? 0.3 : seats <= 4 ? 0.4 : 0.5;
      root.add(cyl(topR, 0.05, def.color, 0.7));
      // Table leg
      root.add(cyl(0.08, 0.7, 0x4a3020, 0));
      // Base
      root.add(cyl(topR * 0.7, 0.05, 0x4a3020, 0));
      break;
    }
    case "chair": {
      // Seat
      root.add(box(0.4, 0.05, 0.4, def.color, 0.4));
      // Back
      root.add(box(0.4, 0.5, 0.05, def.color, 0.65));
      // Legs
      root.add(box(0.05, 0.4, 0.05, 0x3a2a1a, 0));
      break;
    }
    case "stove": {
      // Body
      root.add(box(0.9, 0.85, 0.9, def.color, 0));
      // Top
      root.add(box(0.9, 0.05, 0.9, 0x222222, 0.85));
      // 4 burners
      for (const [x, z] of [
        [-0.25, -0.25],
        [0.25, -0.25],
        [-0.25, 0.25],
        [0.25, 0.25],
      ]) {
        root.add(cyl(0.1, 0.02, 0x444444, 0.9).translateY(0));
        const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 8), mat(0x222222));
        burner.position.set(x, 0.91, z);
        burner.castShadow = true;
        root.add(burner);
      }
      break;
    }
    case "sink": {
      root.add(box(0.9, 0.85, 0.6, def.color, 0));
      // Basin
      root.add(box(0.7, 0.1, 0.5, 0x88a0b0, 0.85));
      // Tap
      root.add(cyl(0.03, 0.2, 0xcccccc, 0.9));
      break;
    }
    case "toilet": {
      root.add(box(0.5, 0.4, 0.7, def.color, 0));
      root.add(cyl(0.22, 0.05, 0xeeeeee, 0.4));
      root.add(box(0.45, 0.5, 0.05, def.color, 0.4));
      break;
    }
    case "trash": {
      root.add(cyl(0.25, 0.6, def.color, 0));
      root.add(cyl(0.27, 0.05, 0x222222, 0.55));
      break;
    }
    case "decoration": {
      if (def.id === "plant_small") {
        // Pot
        root.add(cyl(0.18, 0.25, 0x6a3a1a, 0));
        // Leaves
        const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 0), mat(def.color));
        leaves.position.y = 0.5;
        leaves.castShadow = true;
        root.add(leaves);
      } else if (def.id === "painting") {
        // Frame
        root.add(box(0.6, 0.45, 0.04, 0x4a3020, 1.2));
        // Canvas
        const canvas = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), mat(def.color));
        canvas.position.set(0, 1.2, 0.025);
        root.add(canvas);
      } else if (def.id === "rug") {
        root.add(box(0.9, 0.02, 0.9, def.color, 0));
      } else if (def.id === "grass") {
        root.add(box(0.98, 0.05, 0.98, def.color, 0));
      } else if (def.id === "path") {
        root.add(box(0.98, 0.05, 0.98, def.color, 0));
      } else {
        root.add(box(0.5, 0.5, 0.5, def.color, 0));
      }
      break;
    }
    case "plot": {
      // Wood border
      root.add(box(0.95, 0.1, 0.95, 0x4a3020, 0));
      // Soil
      root.add(box(0.85, 0.05, 0.85, def.color, 0.05));
      break;
    }
    case "pond": {
      // Stone border
      root.add(cyl(0.48, 0.1, 0x6a6a6a, 0));
      // Water (slightly inset)
      const water = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.02, 16), mat(def.color, { roughness: 0.1, metalness: 0.4 }));
      water.position.y = 0.05;
      root.add(water);
      break;
    }
    default:
      root.add(box(0.8, 0.8, 0.8, def.color, 0));
      break;
  }
  return root;
}

export function createGhostMesh(def: ItemDef, valid: boolean): THREE.Object3D {
  const mesh = createMeshForItem(def);
  const color = valid ? 0x88ff88 : 0xff8888;
  const ghostMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  mesh.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const m = child as THREE.Mesh;
      m.material = ghostMat;
      m.castShadow = false;
      m.receiveShadow = false;
    }
  });
  mesh.userData.isGhost = true;
  return mesh;
}

export function createCharacterMesh(tint: number, hatColor?: number): THREE.Object3D {
  const group = new THREE.Group();

  // Ground shadow disc
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.32, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  group.add(shadow);

  // Body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.7, 10), mat(tint));
  body.position.y = 0.4;
  body.castShadow = true;
  group.add(body);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), mat(0xf2d4a8));
  head.position.y = 0.92;
  head.castShadow = true;
  group.add(head);

  // Eyes
  const eyeMat = mat(0x222222);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), eyeMat);
  eyeL.position.set(-0.07, 0.95, 0.19);
  group.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.07;
  group.add(eyeR);

  // Bright hat/marker on top so characters are easy to spot
  if (hatColor !== undefined) {
    const hat = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), mat(hatColor));
    hat.position.y = 1.2;
    hat.castShadow = true;
    group.add(hat);
  }

  return group;
}

export function disposeMesh(obj: THREE.Object3D): void {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const m = child as THREE.Mesh;
      m.geometry.dispose();
    }
  });
}
