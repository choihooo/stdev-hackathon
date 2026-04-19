// Web Audio API로 간단한 효과음 생성 (파일 의존성 없이)
function createTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3): () => void {
  return () => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.value = frequency
      gain.gain.value = volume
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch {
      // 오디오 미지원 환경
    }
  }
}

// 효과음 정의
export const SFX = {
  cardDraw: createTone(800, 0.1, 'sine', 0.15),
  cardPlay: createTone(600, 0.15, 'triangle', 0.2),
  attackHit: createTone(200, 0.2, 'sawtooth', 0.25),
  heal: createTone(523, 0.3, 'sine', 0.2),
  shield: createTone(400, 0.2, 'square', 0.15),
  turnEnd: createTone(300, 0.15, 'triangle', 0.15),
  victory: createTone(880, 0.5, 'sine', 0.25),
  defeat: createTone(150, 0.6, 'sawtooth', 0.2),
  click: createTone(1000, 0.05, 'sine', 0.1),
}

let soundEnabled = true

export function toggleSound(on?: boolean) {
  soundEnabled = on ?? !soundEnabled
}

export function playSound(sfx: () => void) {
  if (soundEnabled) sfx()
}
