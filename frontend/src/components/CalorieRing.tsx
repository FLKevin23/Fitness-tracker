interface Props {
  consumed: number
  goal: number
  label?: string
}

export default function CalorieRing({ consumed, goal, label = 'kcal eaten' }: Props) {
  const radius = 72
  const stroke = 10
  const circumference = 2 * Math.PI * radius
  const ratio = goal > 0 ? Math.min(consumed / goal, 1) : 0
  const offset = circumference * (1 - ratio)
  const over = goal > 0 && consumed > goal

  return (
    <svg width={180} height={180} viewBox="0 0 180 180">
      <circle
        cx={90} cy={90} r={radius}
        fill="none" stroke="#e5e7eb" strokeWidth={stroke}
      />
      <circle
        cx={90} cy={90} r={radius}
        fill="none"
        stroke={over ? '#ef4444' : '#3b82f6'}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 90 90)"
      />
      <text x={90} y={82} textAnchor="middle" fontSize={26} fontWeight="700" fill="#111827">
        {consumed.toLocaleString()}
      </text>
      <text x={90} y={102} textAnchor="middle" fontSize={12} fill="#6b7280">
        {label}
      </text>
      {goal > 0 && (
        <text x={90} y={120} textAnchor="middle" fontSize={11} fill="#9ca3af">
          goal {goal.toLocaleString()}
        </text>
      )}
    </svg>
  )
}
