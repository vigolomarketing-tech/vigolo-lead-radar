import { useEffect, useRef, useState } from 'react'
import { FixedSizeGrid } from 'react-window'
import { LeadCard } from '../../features/leads/LeadCard'
import type { Lead } from '../../types'

const CARD_MIN = 320
const ROW_H = 210
const GAP = 12

/**
 * Grilla virtualizada: renderiza solo las filas visibles. Escala a miles de
 * negocios sin degradar el rendimiento.
 */
export function VirtualLeadGrid({ leads }: { leads: Lead[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width)
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  const cols = Math.max(1, Math.min(4, Math.floor((width + GAP) / (CARD_MIN + GAP))))
  const rows = Math.ceil(leads.length / cols)
  const colWidth = width > 0 ? Math.floor(width / cols) : CARD_MIN
  const height = Math.min(rows * ROW_H, Math.round(window.innerHeight * 0.72))

  return (
    <div ref={ref} className="w-full">
      {width > 0 && (
        <FixedSizeGrid
          columnCount={cols}
          columnWidth={colWidth}
          rowCount={rows}
          rowHeight={ROW_H}
          width={width}
          height={height}
        >
          {({ columnIndex, rowIndex, style }) => {
            const idx = rowIndex * cols + columnIndex
            const lead = leads[idx]
            if (!lead) return null
            return (
              <div style={{ ...style, padding: GAP / 2 }}>
                <LeadCard lead={lead} />
              </div>
            )
          }}
        </FixedSizeGrid>
      )}
    </div>
  )
}
