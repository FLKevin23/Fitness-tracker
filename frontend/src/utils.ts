import type { Ingredient } from './types'

/**
 * Format a raw_weight_g value into a human-readable quantity.
 * Examples:
 *   150g  Hackfleisch → "150 g"
 *   110g  Eier (55g/Ei)  → "2 Ei  (110 g)"
 *   28g   Olivenöl (14g/EL) → "2 EL  (28 g)"
 */
export function formatQty(raw_weight_g: number, ingredient: Ingredient): string {
  if (ingredient.unit === 'g' || ingredient.unit === 'ml' || ingredient.grams_per_unit === 1) {
    return `${raw_weight_g} ${ingredient.unit}`
  }
  const qty = raw_weight_g / ingredient.grams_per_unit
  const qtyStr = Number.isInteger(qty) ? qty.toString() : qty.toFixed(1)
  return `${qtyStr} ${ingredient.unit}  (${Math.round(raw_weight_g)} g)`
}

/** Convert a user-entered quantity (in ingredient.unit) to raw grams. */
export function toGrams(quantity: number, ingredient: Ingredient): number {
  return quantity * ingredient.grams_per_unit
}
