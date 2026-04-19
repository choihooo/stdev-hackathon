import { useState } from 'react'
import { getRandomCardByRarity, type CardData } from '../data/cards'
import { getRandomRelics, type RelicData } from '../data/relics'
import { useDeckStore } from '../stores/deckStore'
import { useGameStore } from '../stores/gameStore'
import { useRelicStore } from '../stores/relicStore'
import '../StageMap.css'

function getRandomCards(count: number): CardData[] {
  const result: CardData[] = []
  const exclude: string[] = []
  for (let i = 0; i < count; i++) {
    const card = getRandomCardByRarity(exclude)
    if (card) {
      result.push(card)
      exclude.push(card.id)
    }
  }
  return result
}

function getCardIcon(cardId: string): string {
  const map: Record<string, string> = {
    scaleup: '⚔️', funding: '💰', heal: '💚', ip_protect: '🛡️', pivot: '🎲',
    aggressive_growth: '⚔️', team_hire: '👥', pivot_small: '🔄', milestone: '🏁',
    focus_boost: '⚡', ipo_strike: '🚀', bankruptcy: '💸',
  }
  return map[cardId] || '📦'
}

type RewardItem = { type: 'card'; data: CardData } | { type: 'relic'; data: RelicData }

export default function RewardScreen() {
  const existingRelics = useRelicStore((s) => s.relics)
  const [rewards] = useState<RewardItem[]>(() => {
    const cards = getRandomCards(2).map((c) => ({ type: 'card' as const, data: c }))
    const relics = getRandomRelics(1, existingRelics.map((r) => r.id)).map((r) => ({ type: 'relic' as const, data: r }))
    return [...cards, ...relics].sort(() => Math.random() - 0.5)
  })
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const deck = useDeckStore()
  const game = useGameStore()

  const handleSelect = () => {
    if (selectedIdx === null) return
    const item = rewards[selectedIdx]
    if (item.type === 'card') {
      const currentDiscard = deck.discardPile
      useDeckStore.setState({ discardPile: [...currentDiscard, item.data.id] })
    } else {
      useRelicStore.getState().addRelic(item.data)
    }

    const node = game.getCurrentNode()
    if (node?.type === 'boss') {
      game.nextAct()
    } else {
      game.goToMap()
    }
  }

  const handleSkip = () => {
    const node = game.getCurrentNode()
    if (node?.type === 'boss') {
      game.nextAct()
    } else {
      game.goToMap()
    }
  }

  return (
    <div className="reward-screen">
      <h2 className="reward-title">보상 선택</h2>
      <p className="reward-subtitle">카드 또는 Relic을 1개 선택하세요</p>

      <div className="reward-cards">
        {rewards.map((item, i) => {
          const isCard = item.type === 'card'
          const card = isCard ? (item as { type: 'card'; data: CardData }).data : null
          const relic = !isCard ? (item as { type: 'relic'; data: RelicData }).data : null

          return (
            <button
              key={i}
              className={`reward-card ${selectedIdx === i ? 'reward-selected' : ''}`}
              onClick={() => setSelectedIdx(i)}
            >
              {isCard && card ? (
                <>
                  <div className="reward-card-icon">{getCardIcon(card.id)}</div>
                  <div className="reward-card-name">{card.name}</div>
                  <div className="reward-card-type">{card.type}</div>
                  <div className="reward-card-cost">비용 {card.cost}</div>
                </>
              ) : relic ? (
                <>
                  <div className="reward-card-icon">{relic.icon}</div>
                  <div className="reward-card-name">{relic.name}</div>
                  <div className="reward-card-type">Relic</div>
                  <div className="reward-card-cost" style={{ color: 'var(--accent-gold)' }}>{relic.description}</div>
                </>
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="reward-actions">
        <button className="reward-btn-primary" onClick={handleSelect} disabled={selectedIdx === null}>
          선택
        </button>
        <button className="reward-btn-skip" onClick={handleSkip}>
          건너뛰기
        </button>
      </div>

      {/* 보유 Relic 표시 */}
      {existingRelics.length > 0 && (
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          {existingRelics.map((r) => (
            <span key={r.id} title={r.description} style={{ fontSize: '20px' }}>{r.icon}</span>
          ))}
        </div>
      )}
    </div>
  )
}
