import { useEffect, useState } from 'react'

// 수치 팝업
interface FloatingTextProps {
  value: string
  type: 'damage' | 'heal' | 'block' | 'burn'
  onDone: () => void
}

export function FloatingText({ value, type, onDone }: FloatingTextProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onDone()
    }, 800)
    return () => clearTimeout(timer)
  }, [onDone])

  if (!visible) return null

  const colorMap = {
    damage: '#c4454a',
    heal: '#3d9e6e',
    block: '#4a9ead',
    burn: '#c48a3f',
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '28px',
        fontWeight: 900,
        fontFamily: 'var(--font-number)',
        color: colorMap[type],
        zIndex: 50,
        pointerEvents: 'none',
        animation: 'floatUp 0.8s ease-out forwards',
      }}
    >
      {value}
    </div>
  )
}

// 화면 셰이크
export function useScreenShake() {
  const [shaking, setShaking] = useState(false)

  const shake = () => {
    setShaking(true)
    setTimeout(() => setShaking(false), 200)
  }

  const shakeStyle = shaking
    ? { animation: 'screenShake 0.2s ease-out' }
    : {}

  return { shake, shakeStyle }
}

// 화면 페이드 전환
export function useFadeTransition(duration = 300) {
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setOpacity(1), 50)
    return () => clearTimeout(timer)
  }, [])

  return {
    style: {
      opacity,
      transition: `opacity ${duration}ms ease`,
    },
  }
}
