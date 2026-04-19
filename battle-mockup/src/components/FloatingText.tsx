import { useState, useCallback, useRef, useEffect } from 'react'

interface FloatItem {
  id: number
  text: string
  color: string
  x: number
  y: number
}

let nextId = 0

export function useFloatingText() {
  const [items, setItems] = useState<FloatItem[]>([])
  const timers = useRef<number[]>([])

  useEffect(() => {
    return () => { timers.current.forEach(clearTimeout) }
  }, [])

  const addFloat = useCallback((text: string, color: string, x: number, y: number) => {
    const id = nextId++
    setItems((prev) => [...prev, { id, text, color, x, y }])
    const t = window.setTimeout(() => {
      setItems((prev) => prev.filter((f) => f.id !== id))
    }, 800)
    timers.current.push(t)
  }, [])

  return { items, addFloat }
}

export function FloatingTextOverlay({ items }: { items: FloatItem[] }) {
  return (
    <>
      {items.map((f) => (
        <div
          key={f.id}
          className="floating-text"
          style={{
            position: 'fixed',
            left: f.x,
            top: f.y,
            color: f.color,
            fontSize: '22px',
            fontWeight: 800,
            fontFamily: 'var(--font-number)',
            fontVariantNumeric: 'tabular-nums',
            pointerEvents: 'none',
            zIndex: 10000,
            textShadow: '0 0 6px rgba(0,0,0,0.8)',
            animation: 'floatUp 0.8s ease-out forwards',
          }}
        >
          {f.text}
        </div>
      ))}
    </>
  )
}
