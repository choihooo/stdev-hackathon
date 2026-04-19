import { create } from 'zustand'

export type ToastType = 'info' | 'warning' | 'success' | 'danger'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastState {
  toasts: ToastItem[]
  showToast: (message: string, type?: ToastType) => void
  removeToast: (id: number) => void
}

let toastId = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  showToast: (message, type = 'info') => {
    const id = toastId++
    set((s) => ({
      toasts: [...s.toasts.slice(-2), { id, message, type }],
    }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 2000)
  },

  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))

const TYPE_COLORS: Record<ToastType, string> = {
  info: 'rgba(74, 158, 173, 0.15)',
  warning: 'rgba(196, 138, 63, 0.15)',
  success: 'rgba(61, 158, 110, 0.15)',
  danger: 'rgba(196, 69, 74, 0.15)',
}

const TYPE_BORDERS: Record<ToastType, string> = {
  info: 'rgba(74, 158, 173, 0.4)',
  warning: 'rgba(196, 138, 63, 0.4)',
  success: 'rgba(61, 158, 110, 0.4)',
  danger: 'rgba(196, 69, 74, 0.4)',
}

const TYPE_ICONS: Record<ToastType, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  success: '✅',
  danger: '🔴',
}

export function ToastOverlay() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div style={{
      position: 'fixed',
      top: 70,
      right: 16,
      zIndex: 10001,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          style={{
            background: TYPE_COLORS[t.type],
            border: `1px solid ${TYPE_BORDERS[t.type]}`,
            borderRadius: 10,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minWidth: 220,
            maxWidth: 320,
            cursor: 'pointer',
            pointerEvents: 'auto',
            animation: 'toastSlideIn 0.3s ease-out',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ fontSize: 16 }}>{TYPE_ICONS[t.type]}</span>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#e0e0e0',
            lineHeight: 1.4,
          }}>
            {t.message}
          </span>
        </div>
      ))}
    </div>
  )
}
