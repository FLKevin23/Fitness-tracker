import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { getMeals, addFoodEntry, addWorkout, addSportNutrition } from '../api/client'
import { MEAL_TIMES } from '../types'

const today = () => format(new Date(), 'yyyy-MM-dd')

type Tab = 'food' | 'workout' | 'sport'

export default function LogPage() {
  const qc = useQueryClient()
  const [date, setDate] = useState(today())
  const [tab, setTab] = useState<Tab>('food')

  // ── Food entry ──────────────────────────────────────────────────────────────
  const { data: meals = [] } = useQuery({ queryKey: ['meals'], queryFn: getMeals })
  const [mealId, setMealId] = useState<number | ''>('')
  const [mealTime, setMealTime] = useState('breakfast')
  const [portion, setPortion] = useState(1.0)

  const foodMut = useMutation({
    mutationFn: () => addFoodEntry(date, {
      meal_id: mealId as number,
      portion_multiplier: portion,
      meal_time: mealTime,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['summary', date] })
      setMealId('')
      setPortion(1.0)
    },
  })

  const selectedMeal = meals.find(m => m.id === mealId)
  const previewKcal = selectedMeal ? Math.round(selectedMeal.kcal * portion) : null

  // ── Workout ─────────────────────────────────────────────────────────────────
  const [actType, setActType] = useState('Running')
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [kcalBurned, setKcalBurned] = useState('')
  const [workoutNotes, setWorkoutNotes] = useState('')

  const workoutMut = useMutation({
    mutationFn: () => addWorkout(date, {
      source: 'manual',
      activity_type: actType,
      duration_min: duration ? parseInt(duration) : undefined,
      distance_km: distance ? parseFloat(distance) : undefined,
      kcal_burned: kcalBurned ? parseInt(kcalBurned) : undefined,
      notes: workoutNotes || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['summary', date] })
      setDuration(''); setDistance(''); setKcalBurned(''); setWorkoutNotes('')
    },
  })

  // ── Sport nutrition ──────────────────────────────────────────────────────────
  const [product, setProduct] = useState('')
  const [amount, setAmount] = useState('')
  const [snKcal, setSnKcal] = useState('')
  const [snCarb, setSnCarb] = useState('')

  const sportMut = useMutation({
    mutationFn: () => addSportNutrition(date, {
      product_name: product,
      amount_g_or_ml: parseFloat(amount),
      kcal: parseInt(snKcal),
      carb_g: snCarb ? parseInt(snCarb) : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['summary', date] })
      setProduct(''); setAmount(''); setSnKcal(''); setSnCarb('')
    },
  })

  const tabs: { id: Tab; label: string }[] = [
    { id: 'food', label: '🍽️ Food' },
    { id: 'workout', label: '🏃 Workout' },
    { id: 'sport', label: '⚡ Sport Fuel' },
  ]

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Log Entry</h1>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Date</label>
        <input
          type="date" value={date} onChange={e => setDate(e.target.value)} max={today()}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 border-b pb-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Food ── */}
      {tab === 'food' && (
        <form
          onSubmit={e => { e.preventDefault(); if (mealId) foodMut.mutate() }}
          className="bg-white rounded-2xl shadow-sm p-5 space-y-4"
        >
          <div>
            <label className="block text-xs text-gray-500 mb-1">Meal *</label>
            <select
              required
              value={mealId}
              onChange={e => setMealId(parseInt(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select a meal…</option>
              {meals.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({Math.round(m.kcal)} kcal)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Meal time</label>
            <div className="flex gap-2 flex-wrap">
              {MEAL_TIMES.map(t => (
                <button
                  key={t} type="button"
                  onClick={() => setMealTime(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize border transition-colors ${
                    mealTime === t
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Portion</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(p => (
                <button
                  key={p} type="button"
                  onClick={() => setPortion(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    portion === p
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {p}×
                </button>
              ))}
            </div>
            <input
              type="number" step="0.05" min="0.1" value={portion}
              onChange={e => setPortion(parseFloat(e.target.value))}
              className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {previewKcal !== null && (
            <p className="text-sm text-amber-600 font-semibold">
              Preview: {previewKcal} kcal
            </p>
          )}

          <button
            type="submit"
            disabled={!mealId || foodMut.isPending}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {foodMut.isPending ? 'Saving…' : 'Log Food'}
          </button>
          {foodMut.isSuccess && (
            <p className="text-green-600 text-sm text-center">Logged! <a href="/" className="underline">View dashboard</a></p>
          )}
        </form>
      )}

      {/* ── Workout ── */}
      {tab === 'workout' && (
        <form
          onSubmit={e => { e.preventDefault(); workoutMut.mutate() }}
          className="bg-white rounded-2xl shadow-sm p-5 space-y-4"
        >
          <div>
            <label className="block text-xs text-gray-500 mb-1">Activity type</label>
            <input
              value={actType} onChange={e => setActType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Duration (min)</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Distance (km)</label>
              <input type="number" step="0.01" value={distance} onChange={e => setDistance(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">kcal burned</label>
              <input type="number" value={kcalBurned} onChange={e => setKcalBurned(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Notes</label>
              <input value={workoutNotes} onChange={e => setWorkoutNotes(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
          <button
            type="submit"
            disabled={workoutMut.isPending}
            className="w-full bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {workoutMut.isPending ? 'Saving…' : 'Log Workout'}
          </button>
          {workoutMut.isSuccess && (
            <p className="text-green-600 text-sm text-center">Logged! <a href="/" className="underline">View dashboard</a></p>
          )}
        </form>
      )}

      {/* ── Sport nutrition ── */}
      {tab === 'sport' && (
        <form
          onSubmit={e => { e.preventDefault(); sportMut.mutate() }}
          className="bg-white rounded-2xl shadow-sm p-5 space-y-4"
        >
          <div>
            <label className="block text-xs text-gray-500 mb-1">Product name *</label>
            <input required value={product} onChange={e => setProduct(e.target.value)}
              placeholder="e.g. Maurten Gel 100"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Amount (g/ml) *</label>
              <input required type="number" step="0.1" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">kcal *</label>
              <input required type="number" value={snKcal} onChange={e => setSnKcal(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Carbs (g)</label>
              <input type="number" value={snCarb} onChange={e => setSnCarb(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
          <button
            type="submit"
            disabled={sportMut.isPending}
            className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50"
          >
            {sportMut.isPending ? 'Saving…' : 'Log Sport Fuel'}
          </button>
          {sportMut.isSuccess && (
            <p className="text-green-600 text-sm text-center">Logged! <a href="/" className="underline">View dashboard</a></p>
          )}
        </form>
      )}
    </div>
  )
}
