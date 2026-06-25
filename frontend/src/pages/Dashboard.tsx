import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { getDailySummary, updateDailyLog, deleteFoodEntry, deleteWorkout, deleteSportNutrition } from '../api/client'
import CalorieRing from '../components/CalorieRing'

const today = () => format(new Date(), 'yyyy-MM-dd')

function WaterTracker({ glasses, onSet }: { glasses: number; onSet: (n: number) => void }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">Water</p>
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: 8 }, (_, i) => (
          <button
            key={i}
            onClick={() => onSet(i < glasses ? i : i + 1)}
            className={`w-7 h-7 rounded-full text-sm border transition-colors ${
              i < glasses
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'border-gray-300 text-gray-300 hover:border-blue-400'
            }`}
          >
            💧
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-1">{glasses} / 8 glasses</p>
    </div>
  )
}

function NetBadge({ net }: { net?: number }) {
  if (net === undefined || net === null) return null
  const deficit = net < 0
  return (
    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
      deficit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {deficit ? '↓' : '↑'} {Math.abs(net).toLocaleString()} kcal {deficit ? 'deficit' : 'surplus'}
    </div>
  )
}

export default function Dashboard() {
  const [date, setDate] = useState(today())
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['summary', date],
    queryFn: () => getDailySummary(date),
  })

  const logMutation = useMutation({
    mutationFn: (patch: { body_weight_kg?: number; water_glasses?: number }) =>
      updateDailyLog(date, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['summary', date] }),
  })

  const delFood = useMutation({
    mutationFn: deleteFoodEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['summary', date] }),
  })
  const delWorkout = useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['summary', date] }),
  })
  const delSport = useMutation({
    mutationFn: deleteSportNutrition,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['summary', date] }),
  })

  const [weightInput, setWeightInput] = useState('')

  const navigate = (dir: number) =>
    setDate(format(addDays(parseISO(date), dir), 'yyyy-MM-dd'))

  if (isLoading) return <div className="p-8 text-gray-400">Loading…</div>
  if (!data) return null

  const goalKcal = data.bmr
    ? Math.max(0, data.bmr - (data.goal_kcal_deficit ?? 500) + data.burned_kcal)
    : undefined

  const byTime = (time: string) =>
    data.food_entries.filter(e => (e.meal_time ?? 'other') === time)

  const timeGroups = ['breakfast', 'lunch', 'dinner', 'snack']

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Date nav */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-200 text-gray-600">←</button>
        <h1 className="text-xl font-bold">
          {date === today() ? 'Today' : format(parseISO(date), 'EEE, d MMM yyyy')}
        </h1>
        <button
          onClick={() => navigate(1)}
          disabled={date >= today()}
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 disabled:opacity-30"
        >→</button>
        {date !== today() && (
          <button onClick={() => setDate(today())} className="ml-2 text-sm text-blue-600 hover:underline">
            Back to today
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Calorie ring */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center">
          <CalorieRing
            consumed={data.food_kcal + data.sport_kcal}
            goal={goalKcal ?? 2000}
          />
          <NetBadge net={data.net_kcal} />
        </div>

        {/* Body weight */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Body Weight</p>
          {data.body_weight_kg ? (
            <p className="text-3xl font-bold">{data.body_weight_kg} <span className="text-lg font-normal text-gray-500">kg</span></p>
          ) : (
            <p className="text-gray-400 text-sm">Not logged yet</p>
          )}
          <form
            onSubmit={e => {
              e.preventDefault()
              const kg = parseFloat(weightInput)
              if (!isNaN(kg)) {
                logMutation.mutate({ body_weight_kg: kg })
                setWeightInput('')
              }
            }}
            className="flex gap-2"
          >
            <input
              type="number" step="0.1" placeholder="e.g. 75.5"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">
              Log
            </button>
          </form>
        </div>

        {/* Water */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <WaterTracker
            glasses={data.water_glasses}
            onSet={n => logMutation.mutate({ water_glasses: n })}
          />
        </div>
      </div>

      {/* Calorie breakdown */}
      {data.bmr && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Calorie Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Food', val: data.food_kcal, color: 'text-amber-600' },
              { label: 'Sport fuel', val: data.sport_kcal, color: 'text-orange-500' },
              { label: 'Burned', val: -data.burned_kcal, color: 'text-green-600' },
              { label: 'BMR', val: -data.bmr, color: 'text-purple-600' },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 uppercase">{label}</p>
                <p className={`text-xl font-bold ${color}`}>
                  {val > 0 ? '+' : ''}{val.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">kcal</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <span className="text-sm text-gray-500">Net balance</span>
            <NetBadge net={data.net_kcal} />
          </div>
          {/* Macros */}
          <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-3 text-center text-sm">
            <div><span className="text-gray-400">Protein</span><br /><strong>{data.macros.protein_g}g</strong></div>
            <div><span className="text-gray-400">Carbs</span><br /><strong>{data.macros.carb_g}g</strong></div>
            <div><span className="text-gray-400">Fat</span><br /><strong>{data.macros.fat_g}g</strong></div>
          </div>
        </div>
      )}

      {/* Food entries */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Food Today</h2>
          <a href="/log" className="text-sm text-blue-600 hover:underline">+ Add</a>
        </div>
        {data.food_entries.length === 0 ? (
          <p className="text-gray-400 text-sm">Nothing logged yet.</p>
        ) : (
          <div className="space-y-4">
            {timeGroups.map(time => {
              const entries = byTime(time)
              if (!entries.length) return null
              return (
                <div key={time}>
                  <p className="text-xs font-medium text-gray-400 uppercase mb-1 capitalize">{time}</p>
                  {entries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                      <div>
                        <span className="text-sm font-medium">{entry.meal_name}</span>
                        {entry.portion_multiplier !== 1 && (
                          <span className="ml-2 text-xs text-gray-400">×{entry.portion_multiplier}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-amber-600">{Math.round(entry.kcal)} kcal</span>
                        <button
                          onClick={() => delFood.mutate(entry.id)}
                          className="text-gray-300 hover:text-red-400 text-xs"
                        >✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
            <div className="pt-2 text-right text-sm font-semibold text-gray-700">
              Total: {data.food_kcal.toLocaleString()} kcal
            </div>
          </div>
        )}
      </div>

      {/* Workouts */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Workouts</h2>
          <a href="/log" className="text-sm text-blue-600 hover:underline">+ Add</a>
        </div>
        {data.workouts.length === 0 ? (
          <p className="text-gray-400 text-sm">No workouts logged.</p>
        ) : (
          data.workouts.map(w => (
            <div key={w.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <span className="text-sm font-medium capitalize">{w.activity_type ?? 'Workout'}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {w.duration_min && `${w.duration_min}min`}
                  {w.distance_km && ` · ${w.distance_km}km`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {w.kcal_burned && (
                  <span className="text-sm font-semibold text-green-600">-{w.kcal_burned} kcal</span>
                )}
                <button onClick={() => delWorkout.mutate(w.id)} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sport nutrition */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Sport Nutrition</h2>
          <a href="/log" className="text-sm text-blue-600 hover:underline">+ Add</a>
        </div>
        {data.sport_nutrition.length === 0 ? (
          <p className="text-gray-400 text-sm">No sport fuel logged.</p>
        ) : (
          data.sport_nutrition.map(sn => (
            <div key={sn.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <span className="text-sm font-medium">{sn.product_name}</span>
                <span className="text-xs text-gray-400 ml-2">{sn.amount_g_or_ml}g/ml</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-orange-500">{sn.kcal} kcal</span>
                <button onClick={() => delSport.mutate(sn.id)} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
