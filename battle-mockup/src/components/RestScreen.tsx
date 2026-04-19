import { useState } from 'react'
import { CARDS } from '../data/cards'
import { usePlayerStore } from '../stores/playerStore'
import { useDeckStore } from '../stores/deckStore'
import { useGameStore } from '../stores/gameStore'
import '../StageMap.css'

type RestChoice = 'none' | 'heal' | 'upgrade'

function getCardIcon(cardId: string): string {
  const map: Record<string, string> = {
    scaleup: '⚔️', funding: '💰', heal: '💚', ip_protect: '🛡️', pivot: '🎲',
    aggressive_growth: '⚔️', team_hire: '👥', pivot_small: '🔄', milestone: '🏁',
    focus_boost: '⚡', ipo_strike: '🚀', bankruptcy: '💸',
    passive_heal: '💚', passive_shield: '🛡️', passive_draw: '⚡',
  }
  return map[cardId] || '📦'
}

export default function RestScreen() {
  const player = usePlayerStore()
  const deck = useDeckStore()
  const game = useGameStore()
  const [choice, setChoice] = useState<RestChoice>('none')
  const [upgradedId, setUpgradedId] = useState<string | null>(null)

  const handleHeal = () => {
    player.heal(30)
    setChoice('heal')
  }

  const handleUpgrade = (cardId: string) => {
    useDeckStore.getState().upgradeCard(cardId)
    setUpgradedId(cardId)
    setChoice('upgrade')
  }

  const allDeckCards = [...new Set([...deck.drawPile, ...deck.hand, ...deck.discardPile])]
    .filter((id) => !id.includes('+'))

  if (choice === 'heal') {
    return (
      <div className="generic-screen">
        <div style={{ fontSize: '48px' }}>💚</div>
        <div className="generic-title">회복 완료</div>
        <div className="generic-desc">HP +30</div>
        <div className="generic-actions">
          <button className="generic-btn" onClick={() => game.goToMap()}>계속</button>
        </div>
      </div>
    )
  }

  if (choice === 'upgrade') {
    const card = CARDS[upgradedId!]
    return (
      <div className="generic-screen">
        <div style={{ fontSize: '48px' }}>⬆️</div>
        <div className="generic-title">카드 강화 완료</div>
        <div className="generic-desc">{card?.name} → {card?.name}+</div>
        <div className="generic-actions">
          <button className="generic-btn" onClick={() => game.goToMap()}>계속</button>
        </div>
      </div>
    )
  }

  return (
    <div className="generic-screen">
      <div style={{ fontSize: '48px' }}>💤</div>
      <div className="generic-title">휴식</div>
      <div className="generic-desc">잠깐 숨을 돌리세요. 하나만 선택할 수 있습니다.</div>

      <div style={{ display: 'flex', gap: '16px', margin: '16px 0' }}>
        <button className="rest-option" onClick={handleHeal}>
          <span className="rest-icon">💚</span>
          <span className="rest-name">회복</span>
          <span className="rest-effect">HP +30</span>
        </button>
      </div>

      <div style={{ margin: '16px 0' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>카드 강화</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {allDeckCards.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>강화 가능한 카드가 없습니다</div>
          )}
          {allDeckCards.map((id) => {
            const card = CARDS[id]
            if (!card) return null
            return (
              <button key={id} className="reward-card" style={{ width: '120px' }}
                onClick={() => handleUpgrade(id)}>
                <div style={{ fontSize: '24px' }}>{getCardIcon(id)}</div>
                <div style={{ fontWeight: 700, fontSize: '12px' }}>{card.name}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>
                  {card.effects.map((e) => e.value).join('/')} → {card.effects.map((e) => e.type === 'draw' ? e.value + 1 : Math.ceil(e.value * 1.5)).join('/')}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="generic-actions">
        <button className="generic-btn" onClick={() => game.goToMap()}>건너뛰기</button>
      </div>
    </div>
  )
}
