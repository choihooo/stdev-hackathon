import { useEffect, useRef } from 'react'

export interface CardHistoryEntry {
  turn: number
  cardName: string
  effects: string[]
  cost: number
  type: string
}

interface CardHistoryProps {
  history: CardHistoryEntry[]
  onClose: () => void
}

export function CardHistory({ history, onClose }: CardHistoryProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('mousedown', handleClick)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('mousedown', handleClick)
    }
  }, [onClose])

  const recent = history.slice(-10).reverse()

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 10002,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div ref={ref} style={{
        background: 'var(--bg-secondary, #11131a)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: '24px 28px',
        minWidth: 300,
        maxWidth: 380,
        maxHeight: '70vh',
        overflowY: 'auto',
        animation: 'phaseZoomIn 0.2s ease-out',
      }}>
        <div style={{
          fontSize: 18,
          fontWeight: 800,
          color: 'var(--accent-gold, #c9a84c)',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>카드 사용 기록</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {recent.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: 20 }}>
            아직 사용한 카드가 없습니다
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.map((entry, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: '10px 14px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#e0e0e0' }}>{entry.cardName}</span>
                  <span style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}>
                    턴 {entry.turn}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {entry.effects.map((ef, j) => (
                    <span key={j} style={{
                      fontSize: 12,
                      color: 'var(--accent-cyan, #4a9ead)',
                      background: 'rgba(74, 158, 173, 0.08)',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}>
                      {ef}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
