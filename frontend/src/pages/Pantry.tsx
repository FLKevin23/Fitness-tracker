import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from '../api/client'
import type { Ingredient } from '../types'

const EMPTY: Omit<Ingredient, 'id'> = {
  name: '', unit: 'g', kcal_per_100g: 0,
  protein_per_100g: 0, carb_per_100g: 0, fat_per_100g: 0, notes: '',
}

function IngredientForm({
  initial, onSave, onCancel,
}: {
  initial: Omit<Ingredient, 'id'>
  onSave: (data: Omit<Ingredient, 'id'>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form
      onSubmit={e => { e.preventDefault(); onSave(form) }}
      className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">kcal / 100g *</label>
          <input required type="number" step="0.1" value={form.kcal_per_100g}
            onChange={e => set('kcal_per_100g', parseFloat(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Unit</label>
          <input value={form.unit} onChange={e => set('unit', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Protein / 100g</label>
          <input type="number" step="0.1" value={form.protein_per_100g}
            onChange={e => set('protein_per_100g', parseFloat(e.target.value) || 0)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Carbs / 100g</label>
          <input type="number" step="0.1" value={form.carb_per_100g}
            onChange={e => set('carb_per_100g', parseFloat(e.target.value) || 0)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fat / 100g</label>
          <input type="number" step="0.1" value={form.fat_per_100g}
            onChange={e => set('fat_per_100g', parseFloat(e.target.value) || 0)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Notes</label>
          <input value={form.notes ?? ''} onChange={e => set('notes', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700">Save</button>
      </div>
    </form>
  )
}

export default function Pantry() {
  const qc = useQueryClient()
  const { data: ingredients = [], isLoading } = useQuery({
    queryKey: ['ingredients'],
    queryFn: getIngredients,
  })

  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Ingredient | null>(null)

  const createMut = useMutation({
    mutationFn: createIngredient,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ingredients'] }); setAdding(false) },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Ingredient> }) => updateIngredient(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ingredients'] }); setEditing(null) },
  })
  const deleteMut = useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients'] }),
  })

  const filtered = ingredients.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pantry</h1>
        <button
          onClick={() => { setAdding(true); setEditing(null) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + New ingredient
        </button>
      </div>

      <input
        placeholder="Search ingredients…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {adding && (
        <IngredientForm
          initial={EMPTY}
          onSave={data => createMut.mutate(data)}
          onCancel={() => setAdding(false)}
        />
      )}

      {isLoading ? (
        <p className="text-gray-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">No ingredients found.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-right px-4 py-3">kcal/100g</th>
                <th className="text-right px-4 py-3">P</th>
                <th className="text-right px-4 py-3">C</th>
                <th className="text-right px-4 py-3">F</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(ing => (
                <>
                  <tr key={ing.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{ing.name}</td>
                    <td className="px-4 py-3 text-right text-amber-600 font-semibold">{ing.kcal_per_100g}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{ing.protein_per_100g}g</td>
                    <td className="px-4 py-3 text-right text-gray-500">{ing.carb_per_100g}g</td>
                    <td className="px-4 py-3 text-right text-gray-500">{ing.fat_per_100g}g</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setEditing(ing); setAdding(false) }}
                        className="text-blue-500 hover:text-blue-700 mr-3 text-xs"
                      >Edit</button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${ing.name}"?`)) deleteMut.mutate(ing.id)
                        }}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >Delete</button>
                    </td>
                  </tr>
                  {editing?.id === ing.id && (
                    <tr key={`edit-${ing.id}`}>
                      <td colSpan={6} className="px-4 py-3">
                        <IngredientForm
                          initial={{ ...ing }}
                          onSave={data => updateMut.mutate({ id: ing.id, data })}
                          onCancel={() => setEditing(null)}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
