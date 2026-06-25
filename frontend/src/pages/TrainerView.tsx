import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTrainerView } from '../api/client'

interface DayData {
  date: string
  body_weight_kg?: number
  water_glasses: number
  food_kcal: number
  sport_kcal: number
  burned_kcal: number
  bmr?: number
  net_kcal?: number
  food_entries: { meal_name: string; meal_time?: string; portion_multiplier: number; kcal: number }[]
  workouts: { activity_type?: string; duration_min?: number; distance_km?: number; kcal_burned?: number }[]
}

export default function TrainerView() {
  const { token } = useParams<{ token: string }>()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['trainer', token],
    queryFn: () => getTrainerView(token!),
    enabled: !!token,
    retry: false,
  })

  if (isLoading) return <div className="p-8 text-gray-400">Loading…</div>
  if (isError) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl font-bold text-red-500">Access denied</p>
        <p className="text-gray-400 mt-2">This link is invalid or has been deactivated.</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="bg-gray-900 text-white rounded-2xl p-5">
        <h1 className="text-xl font-bold">Athlete Report</h1>
        <p className="text-gray-400 text-sm mt-1">{data?.athlete} · Last 7 days</p>
      </div>

      {data?.days?.map((day: DayData) => (
        <div key={day.date} className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              {new Date(day.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
            </h2>
            {day.body_weight_kg && (
              <span className="text-sm text-gray-500">{day.body_weight_kg} kg</span>
            )}
          </div>

          {/* Calorie summary */}
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            {[
              { label: 'Food', val: day.food_kcal, color: 'text-amber-600' },
              { label: 'Burned', val: day.burned_kcal, color: 'text-green-600' },
              { label: 'BMR', val: day.bmr, color: 'text-purple-600' },
              { label: 'Net', val: day.net_kcal, color: day.net_kcal != null && day.net_kcal < 0 ? 'text-green-600' : 'text-red-500' },
            ].map(({ label, val, color }) => val != null ? (
              <div key={label} className="bg-gray-50 rounded-lg py-2">
                <p className={`font-bold ${color}`}>{val > 0 ? '+' : ''}{val}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ) : null)}
          </div>

          {/* Food */}
          {day.food_entries.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium mb-1">Food</p>
              {day.food_entries.map((e, i) => (
                <div key={i} className="flex justify-between text-sm py-0.5">
                  <span className="text-gray-700 capitalize">
                    {e.meal_time && <span className="text-gray-400">{e.meal_time} · </span>}
                    {e.meal_name}
                    {e.portion_multiplier !== 1 && <span className="text-gray-400"> ×{e.portion_multiplier}</span>}
                  </span>
                  <span className="text-amber-600 font-medium">{Math.round(e.kcal)} kcal</span>
                </div>
              ))}
            </div>
          )}

          {/* Workouts */}
          {day.workouts.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium mb-1">Workouts</p>
              {day.workouts.map((w, i) => (
                <div key={i} className="flex justify-between text-sm py-0.5">
                  <span className="text-gray-700 capitalize">
                    {w.activity_type ?? 'Workout'}
                    {w.duration_min && ` · ${w.duration_min}min`}
                    {w.distance_km && ` · ${w.distance_km}km`}
                  </span>
                  {w.kcal_burned && (
                    <span className="text-green-600 font-medium">-{w.kcal_burned} kcal</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
