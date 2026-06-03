import type { ItemDef, ItemCategory } from "../types";

const make = (d: Omit<ItemDef, "category"> & { category: ItemCategory }): ItemDef => d;

export const ITEMS: ItemDef[] = [
  // ===== Floors =====
  make({ id: "floor_basic", name: "Basic Floor", category: "floor", cost: 5, levelRequired: 1, walkable: true, color: 0xc9a47a, area: "indoor", description: "Cheap wooden floor." }),
  make({ id: "floor_tile", name: "Tiled Floor", category: "floor", cost: 25, levelRequired: 3, walkable: true, color: 0xd6c4a0, area: "indoor", description: "Clean ceramic tiles." }),
  make({ id: "floor_marble", name: "Marble Floor", category: "floor", cost: 150, levelRequired: 12, walkable: true, color: 0xefe7d8, area: "indoor", description: "Elegant marble." }),

  // ===== Walls =====
  make({ id: "wall_brick", name: "Brick Wall", category: "wall", cost: 20, levelRequired: 1, walkable: false, color: 0x8a4f3a, area: "indoor" }),
  make({ id: "wall_wood", name: "Wooden Wall", category: "wall", cost: 15, levelRequired: 1, walkable: false, color: 0x6a4a3a, area: "indoor" }),
  make({ id: "wall_paint", name: "Painted Wall", category: "wall", cost: 30, levelRequired: 2, walkable: false, color: 0xb5d4d8, area: "indoor" }),

  // ===== Doors =====
  make({ id: "door_basic", name: "Front Door", category: "door", cost: 30, levelRequired: 1, walkable: true, color: 0x8b5a2b, area: "indoor" }),

  // ===== Tables =====
  make({ id: "table_small", name: "Small Table", category: "table", cost: 50, levelRequired: 1, walkable: false, color: 0xa8743a, area: "indoor", seats: 2 }),
  make({ id: "table_medium", name: "Medium Table", category: "table", cost: 100, levelRequired: 2, walkable: false, color: 0x8a5a28, area: "indoor", seats: 4 }),
  make({ id: "table_large", name: "Large Table", category: "table", cost: 200, levelRequired: 5, walkable: false, color: 0x6e4a20, area: "indoor", seats: 6 }),

  // ===== Chairs =====
  make({ id: "chair_basic", name: "Chair", category: "chair", cost: 20, levelRequired: 1, walkable: false, color: 0x8a5a30, area: "indoor" }),

  // ===== Stoves =====
  make({ id: "stove_basic", name: "Stove", category: "stove", cost: 150, levelRequired: 1, walkable: false, color: 0x444444, area: "indoor", cookSpeed: 1.0 }),
  make({ id: "stove_advanced", name: "Pro Stove", category: "stove", cost: 500, levelRequired: 8, walkable: false, color: 0x6a6a6a, area: "indoor", cookSpeed: 1.6 }),
  make({ id: "stove_industrial", name: "Industrial Stove", category: "stove", cost: 2000, levelRequired: 25, walkable: false, color: 0x888888, area: "indoor", cookSpeed: 2.5 }),

  // ===== Sinks =====
  make({ id: "sink_basic", name: "Sink", category: "sink", cost: 100, levelRequired: 3, walkable: false, color: 0xa8c0d0, area: "indoor" }),

  // ===== Toilets =====
  make({ id: "toilet_basic", name: "Toilet", category: "toilet", cost: 150, levelRequired: 8, walkable: false, color: 0xe8e8e8, area: "indoor" }),

  // ===== Trash =====
  make({ id: "trash_can", name: "Trash Can", category: "trash", cost: 30, levelRequired: 1, walkable: false, color: 0x3a4a3a, area: "indoor" }),

  // ===== Decorations =====
  make({ id: "plant_small", name: "Potted Plant", category: "decoration", cost: 25, levelRequired: 1, walkable: false, color: 0x3a8a3a, area: "both" }),
  make({ id: "painting", name: "Painting", category: "decoration", cost: 40, levelRequired: 2, walkable: false, color: 0xc0a060, area: "indoor" }),
  make({ id: "rug", name: "Decorative Rug", category: "decoration", cost: 35, levelRequired: 1, walkable: true, color: 0xa05a4a, area: "indoor" }),

  // ===== Outdoor =====
  make({ id: "grass", name: "Grass Tile", category: "decoration", cost: 5, levelRequired: 1, walkable: true, color: 0x6a9a4a, area: "outdoor" }),
  make({ id: "path", name: "Path Tile", category: "decoration", cost: 8, levelRequired: 1, walkable: true, color: 0xa98c6a, area: "outdoor" }),
  make({ id: "plot", name: "Planting Plot", category: "plot", cost: 50, levelRequired: 1, walkable: true, color: 0x6e4a2a, area: "outdoor", description: "Plant seeds here to grow ingredients." }),
  make({ id: "pond", name: "Fish Pond", category: "pond", cost: 500, levelRequired: 2, walkable: false, color: 0x3a6a9a, area: "outdoor", description: "Catch fish for fresh dishes." }),

  // ===== Ingredients (not placeable, used in recipes) =====
  make({ id: "i_flour", name: "Flour", category: "ingredient", cost: 2, levelRequired: 1, walkable: true, color: 0xefe1c2, area: "indoor" }),
  make({ id: "i_sugar", name: "Sugar", category: "ingredient", cost: 2, levelRequired: 1, walkable: true, color: 0xf2e8d8, area: "indoor" }),
  make({ id: "i_salt", name: "Salt", category: "ingredient", cost: 1, levelRequired: 1, walkable: true, color: 0xeeeeee, area: "indoor" }),
  make({ id: "i_milk", name: "Milk", category: "ingredient", cost: 3, levelRequired: 1, walkable: true, color: 0xfafafa, area: "indoor" }),
  make({ id: "i_egg", name: "Egg", category: "ingredient", cost: 2, levelRequired: 1, walkable: true, color: 0xfff4d4, area: "indoor" }),
  make({ id: "i_butter", name: "Butter", category: "ingredient", cost: 3, levelRequired: 1, walkable: true, color: 0xfff2a8, area: "indoor" }),
  make({ id: "i_water", name: "Water", category: "ingredient", cost: 1, levelRequired: 1, walkable: true, color: 0x88aaff, area: "indoor" }),
  make({ id: "i_tomato", name: "Tomato", category: "ingredient", cost: 4, levelRequired: 1, walkable: true, color: 0xd04444, area: "indoor" }),
  make({ id: "i_lettuce", name: "Lettuce", category: "ingredient", cost: 3, levelRequired: 1, walkable: true, color: 0x5aaa3a, area: "indoor" }),
  make({ id: "i_cheese", name: "Cheese", category: "ingredient", cost: 6, levelRequired: 2, walkable: true, color: 0xffe066, area: "indoor" }),
  make({ id: "i_beef", name: "Beef", category: "ingredient", cost: 12, levelRequired: 5, walkable: true, color: 0xa04444, area: "indoor" }),
  make({ id: "i_bread", name: "Bread", category: "ingredient", cost: 4, levelRequired: 1, walkable: true, color: 0xd2a05a, area: "indoor" }),
  make({ id: "i_fish", name: "Fish", category: "ingredient", cost: 10, levelRequired: 2, walkable: true, color: 0x88aacc, area: "indoor" }),
  make({ id: "i_rice", name: "Rice", category: "ingredient", cost: 3, levelRequired: 1, walkable: true, color: 0xeeeecc, area: "indoor" }),

  // ===== Dishes (not placeable, made at stoves) =====
  make({ id: "d_drink", name: "Soda", category: "dish", cost: 10, levelRequired: 1, walkable: true, color: 0x88aaff, area: "indoor", recipe: ["i_water", "i_sugar"], cookTime: 2000, sellPrice: 18, gourmetPoints: 1 }),
  make({ id: "d_salad", name: "Salad", category: "dish", cost: 15, levelRequired: 1, walkable: true, color: 0x5aaa3a, area: "indoor", recipe: ["i_lettuce", "i_tomato"], cookTime: 3000, sellPrice: 28, gourmetPoints: 3 }),
  make({ id: "d_pasta", name: "Pasta", category: "dish", cost: 30, levelRequired: 2, walkable: true, color: 0xd04444, area: "indoor", recipe: ["i_flour", "i_tomato", "i_water"], cookTime: 6000, sellPrice: 55, gourmetPoints: 7 }),
  make({ id: "d_pizza", name: "Pizza", category: "dish", cost: 50, levelRequired: 5, walkable: true, color: 0xdda044, area: "indoor", recipe: ["i_flour", "i_tomato", "i_cheese"], cookTime: 10000, sellPrice: 95, gourmetPoints: 14 }),
  make({ id: "d_burger", name: "Burger", category: "dish", cost: 45, levelRequired: 5, walkable: true, color: 0xa8743a, area: "indoor", recipe: ["i_bread", "i_beef", "i_cheese"], cookTime: 8000, sellPrice: 85, gourmetPoints: 12 }),
  make({ id: "d_cake", name: "Cake", category: "dish", cost: 60, levelRequired: 10, walkable: true, color: 0xfff2a8, area: "indoor", recipe: ["i_flour", "i_sugar", "i_egg", "i_butter"], cookTime: 12000, sellPrice: 120, gourmetPoints: 20 }),
  make({ id: "d_fish_dish", name: "Grilled Fish", category: "dish", cost: 40, levelRequired: 2, walkable: true, color: 0x88aacc, area: "indoor", recipe: ["i_fish", "i_salt"], cookTime: 7000, sellPrice: 75, gourmetPoints: 10 }),
  make({ id: "d_rice_bowl", name: "Rice Bowl", category: "dish", cost: 25, levelRequired: 1, walkable: true, color: 0xeeeecc, area: "indoor", recipe: ["i_rice", "i_water", "i_salt"], cookTime: 5000, sellPrice: 45, gourmetPoints: 5 }),
];

export const itemCatalog: Map<string, ItemDef> = new Map(ITEMS.map((i) => [i.id, i]));

export const itemsByCategory = (cat: ItemCategory): ItemDef[] =>
  ITEMS.filter((i) => i.category === cat);

export function getItem(id: string): ItemDef | undefined {
  return itemCatalog.get(id);
}
