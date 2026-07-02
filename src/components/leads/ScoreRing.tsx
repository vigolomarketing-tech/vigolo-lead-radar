import { opportunityLevel } from '../../lib/scoring'
import { OPPORTUNITY_HEX } from '../../lib/labels'

interface ScoreRingProps {
  score: number
  size?: number
}

/** Anillo circular SVG que muestra el puntaje 1-100 con color por nivel. */
export function ScoreRing({ score, size = 52 }: ScoreRingProps) {
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, score))
  const offset = circumference - (clamped / 100) * circumference
  const color = OPPORTUNITY_HEX[opportunityLevel(score)]

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      title={`Puntaje de oportunidad: ${score}/100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-sm font-bold"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  )
}
