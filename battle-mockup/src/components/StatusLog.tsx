import { useEffect, useRef } from 'react'

export interface StatusLogEntry {
  id: number
  text: string
  type: 'gain' | 'expire' | 'damage' | 'tick'
  icon?: string
}

let statusLogId = 0

interface StatusLogProps {
  entries: StatusLogEntry[]
}

export function StatusLog({ entries }: StatusLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries.length])

  if (entries.length === 0) return null

  const recent = entries.slice(-15)

  return (
    <div ref={scrollRef} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      maxHeight: 200,
      overflowY: 'auto',
      padding: '4px 0',
    }}>
      {recent.map((e) => (
        <div key={e.id} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          color: e.type === 'gain' ? 'var(--accent-green, #3d9e6e)' :
                 e.type === 'expire' ? 'var(--text-muted, #555)' :
                 e.type === 'damage' ? 'var(--accent-red, #c4454a)' :
                 'var(--accent-cyan, #4a9ead)',
          animation: 'logSlideIn 0.2s ease-out',
        }}>
          <span>{e.icon || (e.type === 'gain' ? '▲' : e.type === 'expire' ? '▽' : '●')}</span>
          <span style={{ whiteSpace: 'nowrap' }}>{e.text}</span>
        </div>
      ))}
    </div>
  )
}

// StatusLog store for managing status change events
import { create } from 'zustand'

interface StatusLogState {
  entries: StatusLogEntry[]
  addEntry: (text: string, type: StatusLogEntry['type'], icon?: string) => void
  clear: () => void
}

export const useStatusLogStore = create<StatusLogState>((set) => ({
  entries: [],
  addEntry: (text, type, icon) => {
    const id = statusLogId++
    set((s) => ({
      entries: [...s.entries.slice(-29), { id, text, type, icon }],
    }))
  },
  clear: () => set({ entries: [] }),
}))
