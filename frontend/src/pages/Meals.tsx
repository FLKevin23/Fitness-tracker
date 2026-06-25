import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMeals, getIngredients, createMeal, updateMeal, deleteMeal } from '../api/client'
import type { Meal, Ingredient } from '../types'
import { CATEGORIES } from '../types'

interface IngredientRow {
  ingredient_id: number
  raw_weight_g: number
}

function MealForm({
  initial,
  ingredients,
  onSave,
  onCancel,
}: {
  initial: { name: string; category: string; notes: string; ingredients: IngredientRow[] }
  ingredients: Ingredient[]
  onSave: (d: { name: string; category: string; notes: string; ingredients: IngredientRow[] }) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial)
  const addRow = () => setForm(f => ({
    ...f,
    ingredients: [...f.ingredients, { ingredient_id: ingredients[0]?.id ?? 0, raw_weight_g: 100 }],
  }))
  const removeRow = (i: number) => setForm(f => ({
    ...f,
    ingredients: f.ingredients.filter((_, idx) => idx !== i),
  }))
  const updateRow = (i: number, key: keyof IngredientRow, val: number) =>
    setForm(f => ({
      ...f,
      ingredients: f.ingredients.map((r, idx) => idx === i ? { ...r, [key]: val } : r),
    }))

  const previewKcal = form.ingredients.reduce((sum, row) => {
    const ing = ingredients.find(i => i.id === row.ingredient_id)
    return sum + (ing ? ing.kcal_per_100g * row.raw_weight_g / 100 : 0)
  }, 0)

  return (
    <form
      onSubmit={e => { e.preventDefault(); onSave(form) }}
      className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Name *</label>
          <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Category</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">—</option>
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Notes</label>
          <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase">Ingredients</span>
          {previewKcal > 0 && (
            <span className="text-xs font-semibold text-amber-600">{Math.round(previewKcal)} kcal total</span>
          )}
        </div>
        <div className="space-y-2">
          {form.ingredients.map((row, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select
                value={row.ingredient_id}
                onChange={e => updateRow(i, 'ingredient_id', parseInt(e.target.value))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {ingredients.map(ing => (
                  <option key={ing.id} value={ing.id}>{ing.name}</option>
                ))}
              </select>
              <input
                type="number" step="1" min="1" value={row.raw_weight_g}
                onChange={e => updateRow(i, 'raw_weight_g', parseFloat(e.target.value))}
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="g"
              />
              <button type="button" onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 text-sm px-1">✕</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addRow} className="mt-2 text-sm text-blue-600 hover:underline">
          + Add ingredient
        </button>
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700">Save</button>
      </div>
    </form>
  )
}

const EMPTY_FORM = { name: '', category: '', notes: '', ingredients: [] as IngredientRow[] }

export default function Meals() {
  const qc = useQueryClient()
  const { data: meals = [], isLoading } = useQuery({ queryKey: ['meals'], queryFn: getMeals })
  const { data: ingredients = [] } = useQuery({ queryKey: ['ingredients'], queryFn: getIngredients })

  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Meal | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  const createMut = useMutation({
    mutationFn: createMeal,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['meals'] }); setAdding(false) },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateMeal>[1] }) => updateMeal(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['meals'] }); setEditing(null) },
  })
  const deleteMut = useMutation({
    mutationFn: deleteMeal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meals'] }),
  })

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meal Library</h1>
        <button
          onClick={() => { setAdding(true); setEditing(null) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + New meal
        </button>
      </div>

      {adding && (
        <MealForm
          initial={EMPTY_FORM}
          ingredients={ingredients}
          onSave={d => createMut.mutate(d)}
          onCancel={() => setAdding(false)}
        />
      )}

      {isLoading ? (
        <p className="text-gray-400">Loading…</p>
      ) : meals.length === 0 ? (
        <p className="text-gray-400 text-sm">No meals yet. Create your first meal above.</p>
      ) : (
        <div className="space-y-3">
          {meals.map(meal => (
            <div key={meal.id}>
              {editing?.id === meal.id ? (
                <MealForm
                  initial={{
                    name: meal.name,
                    category: meal.category ?? '',
                    notes: meal.notes ?? '',
                    ingredients: meal.ingredients.map(mi => ({
                      ingredient_id: mi.ingredient_id,
                      raw_weight_g: mi.raw_weight_g,
                    })),
                  }}
                  ingredients={ingredients}
                  onSave={d => updateMut.mutate({ id: meal.id, data: d })}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpanded(expanded === meal.id ? null : meal.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{meal.name}</span>
                      {meal.category && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                          {meal.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-amber-600">{Math.round(meal.kcal)} kcal</span>
                      <button
                        onClick={e => { e.stopPropagation(); setEditing(meal); setAdding(false) }}
                        className="text-blue-500 hover:text-blue-700 text-xs"
                      >Edit</button>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          if (confirm(`Delete "${meal.name}"?`)) deleteMut.mutate(meal.id)
                        }}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >Delete</button>
                      <span className="text-gray-400 text-sm">{expanded === meal.id ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {expanded === meal.id && (
                    <div className="border-t px-5 pb-4 pt-3">
                      <table className="w-full text-sm">
                        <thead className="text-xs text-gray-400 uppercase">
                          <tr>
                            <th className="text-left pb-2">Ingredient</th>
                            <th className="text-right pb-2">Raw weight</th>
                            <th className="text-right pb-2">kcal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {meal.ingredients.map(mi => (
                            <tr key={mi.id}>
                              <td className="py-1.5">{mi.ingredient.name}</td>
                              <td className="py-1.5 text-right text-gray-500">{mi.raw_weight_g}g</td>
                              <td className="py-1.5 text-right font-medium">
                                {Math.round(mi.ingredient.kcal_per_100g * mi.raw_weight_g / 100)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
