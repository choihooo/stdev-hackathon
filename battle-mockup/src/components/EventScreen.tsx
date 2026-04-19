import { useState } from 'react'
import { getRandomEvent, type EventData } from '../data/events'
import { usePlayerStore } from '../stores/playerStore'
import { useDeckStore } from '../stores/deckStore'
import { useGameStore } from '../stores/gameStore'
import '../StageMap.css'

export default function EventScreen() {
  const [resolved, setResolved] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [event] = useState<EventData>(() => getRandomEvent())
  const player = usePlayerStore()
  const deck = useDeckStore()
  const game = useGameStore()

  const handleChoice = (idx: number) => {
    if (resolved) return
    const option = event.options[idx]
    setSelectedIdx(idx)
    setResolved(true)

    if (option.hpChange) {
      if (option.hpChange > 0) player.heal(option.hpChange)
      else player.takeDamage(Math.abs(option.hpChange))
    }
    if (option.fundsChange) {
      usePlayerStore.setState({ funds: player.funds + option.fundsChange })
    }
    if (option.statusEffect) {
      // Burn Rate 변경인 경우 특수 처리
      if (option.statusEffect.name === '투자부담') {
        usePlayerStore.setState({ burnRate: player.burnRate + option.statusEffect.value })
      }
      usePlayerStore.getState().addStatus({
        name: option.statusEffect.name,
        icon: option.statusEffect.name === '핵심인재' ? '👥' : '✨',
        type: option.statusEffect.value > 0 ? 'buff' : 'debuff',
        value: Math.abs(option.statusEffect.value),
        turns: option.statusEffect.turns,
      })
    }
    if (option.addCard) {
      useDeckStore.setState({ discardPile: [...deck.discardPile, option.addCard] })
    }
  }

  return (
    <div className="generic-screen">
      <div style={{ fontSize: '48px' }}>{event.icon}</div>
      <div className="generic-title">{event.title}</div>
      <div className="generic-desc">{event.description}</div>

      <div className="event-options">
        {event.options.map((opt, i) => (
          <button
            key={i}
            className="event-option"
            onClick={() => handleChoice(i)}
            disabled={resolved}
            style={{
              opacity: resolved && selectedIdx !== i ? 0.3 : 1,
              borderColor: resolved && selectedIdx === i ? 'var(--accent-gold)' : undefined,
            }}
          >
            <span className="option-label">{opt.label}</span>
            <span className="option-desc">{opt.description}</span>
          </button>
        ))}
      </div>

      {resolved && (
        <div className="generic-actions">
          <button className="generic-btn" onClick={() => game.goToMap()}>계속</button>
        </div>
      )}
    </div>
  )
}
