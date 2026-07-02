import { levelFromScore } from '../../lib/scoring'
import { OPPORTUNITY_HEX } from '../../lib/labels'

export function ScoreRing({ score, size = 52 }: { score: number; size?: number }) {
  const stroke = size >= 60 ? 6 : 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, score))
  const offset = c - (clamped / 100) * c
  const color = OPPORTUNITY_HEX[levelFromScore(score)]
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} title={`Score ${score}/100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          fill="none"
          style={{ transition: 'stroke-dashoffset 0.7s ease' }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-bold"
        style={{ color, fontSize: size * 0.3 }}
      >
        {score}
      </span>
    </div>
  )
}
