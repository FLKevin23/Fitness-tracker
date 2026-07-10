import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile, getTrainerTokens, createTrainerToken, deactivateTrainerToken } from '../api/client'
import type { ActivityLevel } from '../types'

export default function ProfilePage() {
  const qc = useQueryClient()
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile })
  const { data: tokens = [] } = useQuery({ queryKey: ['trainer-tokens'], queryFn: getTrainerTokens })

  const [form, setForm] = useState({
    name: '', gender: '', height_cm: '', birth_date: '',
    body_fat_percentage: '', activity_level: 'sedentary', goal_kcal_deficit: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? '',
        gender: profile.gender ?? '',
        height_cm: profile.height_cm?.toString() ?? '',
        birth_date: profile.birth_date ?? '',
        body_fat_percentage: profile.body_fat_percentage?.toString() ?? '',
        activity_level: profile.activity_level ?? 'sedentary',
        goal_kcal_deficit: profile.goal_kcal_deficit?.toString() ?? '',
      })
    }
  }, [profile])

  const updateMut = useMutation({
    mutationFn: () => updateProfile({
      name: form.name || undefined,
      gender: form.gender || undefined,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : undefined,
      birth_date: form.birth_date || undefined,
      body_fat_percentage: form.body_fat_percentage ? parseFloat(form.body_fat_percentage) : undefined,
      activity_level: (form.activity_level || undefined) as ActivityLevel | undefined,
      goal_kcal_deficit: form.goal_kcal_deficit ? parseFloat(form.goal_kcal_deficit) : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const createTokenMut = useMutation({
    mutationFn: (label: string) => createTrainerToken(label),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trainer-tokens'] }),
  })

  const deactivateMut = useMutation({
    mutationFn: deactivateTrainerToken,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trainer-tokens'] }),
  })

  const [newLabel, setNewLabel] = useState('')

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Profile & Settings</h1>

      {/* Profile form */}
      <form
        onSubmit={e => { e.preventDefault(); updateMut.mutate() }}
        className="bg-white rounded-2xl shadow-sm p-5 space-y-4"
      >
        <h2 className="font-semibold text-gray-700">Personal Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Gender</label>
            <select value={form.gender} onChange={e => set('gender', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">—</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Height (cm)</label>
            <input type="number" step="0.1" value={form.height_cm} onChange={e => set('height_cm', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Birth date</label>
            <input type="date" value={form.birth_date} onChange={e => set('birth_date', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Body fat %</label>
            <input type="number" step="0.1" value={form.body_fat_percentage} onChange={e => set('body_fat_percentage', e.target.value)}
              placeholder="e.g. 16"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Daily activity level</label>
            <select value={form.activity_level} onChange={e => set('activity_level', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="sedentary">Sedentary — desk job, no regular commute activity</option>
              <option value="light">Light — walking/biking commute or on your feet sometimes</option>
              <option value="moderate">Moderate — on-your-feet job or lots of daily movement</option>
              <option value="active">Active — physically demanding job or daily training</option>
              <option value="very_active">Very active — physically demanding job and daily training</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Calorie deficit goal (kcal/day)</label>
            <input type="number" value={form.goal_kcal_deficit} onChange={e => set('goal_kcal_deficit', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={updateMut.isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            {updateMut.isPending ? 'Saving…' : 'Save'}
          </button>
          {saved && <span className="text-green-600 text-sm">Saved!</span>}
        </div>
        <p className="text-xs text-gray-400">
          BMR uses the Katch-McArdle formula (lean body mass, from body fat %) when body fat % is set — more accurate
          for muscular builds than weight-only formulas. Without body fat %, it falls back to Mifflin-St Jeor
          (weight, height, age, gender). Your daily activity level then scales BMR up into TDEE, the number actually
          used for your calorie budget — this is what accounts for commuting, being on your feet at work, etc.,
          separately from logged workouts.
        </p>
      </form>

      {/* Trainer tokens */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-700">Trainer Access</h2>
        <p className="text-sm text-gray-500">
          Generate a secret URL to share with your trainer. They'll see your last 7 days of food, workouts and calorie data — read-only.
        </p>

        <form onSubmit={e => { e.preventDefault(); createTokenMut.mutate(newLabel); setNewLabel('') }}
          className="flex gap-2">
          <input
            placeholder="Label (e.g. Marc)"
            value={newLabel} onChange={e => setNewLabel(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            Generate link
          </button>
        </form>

        {tokens.length > 0 && (
          <div className="space-y-2">
            {tokens.map(t => (
              <div key={t.id} className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
                t.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-60'
              }`}>
                <div>
                  <span className="font-medium">{t.label ?? 'Trainer'}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    t.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                  }`}>{t.active ? 'Active' : 'Inactive'}</span>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono break-all">
                    {window.location.origin}/trainer/{t.token}
                  </p>
                  {t.last_accessed && (
                    <p className="text-xs text-gray-400">Last accessed: {new Date(t.last_accessed).toLocaleDateString()}</p>
                  )}
                </div>
                {t.active && (
                  <button
                    onClick={() => deactivateMut.mutate(t.id)}
                    className="text-xs text-red-400 hover:text-red-600 ml-3"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
