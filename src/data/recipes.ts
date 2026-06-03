import { itemCatalog } from "./items";

export type Recipe = {
  dishId: string;
  ingredients: string[];
  cookTime: number;
  sellPrice: number;
  gourmetPoints: number;
};

/** All recipes are derived from item defs of category "dish". */
export function getAllRecipes(): Recipe[] {
  const recipes: Recipe[] = [];
  for (const item of itemCatalog.values()) {
    if (item.category !== "dish" || !item.recipe) continue;
    recipes.push({
      dishId: item.id,
      ingredients: item.recipe,
      cookTime: item.cookTime ?? 5000,
      sellPrice: item.sellPrice ?? 0,
      gourmetPoints: item.gourmetPoints ?? 0,
    });
  }
  return recipes;
}

export function getRecipe(dishId: string): Recipe | undefined {
  const item = itemCatalog.get(dishId);
  if (!item || item.category !== "dish" || !item.recipe) return undefined;
  return {
    dishId: item.id,
    ingredients: item.recipe,
    cookTime: item.cookTime ?? 5000,
    sellPrice: item.sellPrice ?? 0,
    gourmetPoints: item.gourmetPoints ?? 0,
  };
}

export function isDish(itemId: string): boolean {
  const item = itemCatalog.get(itemId);
  return item?.category === "dish";
}

export function isIngredient(itemId: string): boolean {
  const item = itemCatalog.get(itemId);
  return item?.category === "ingredient";
}
