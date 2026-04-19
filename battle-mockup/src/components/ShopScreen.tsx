import { useState } from 'react'
import { CARDS, getShopCards } from '../data/cards'
import { usePlayerStore } from '../stores/playerStore'
import { useDeckStore } from '../stores/deckStore'
import { useGameStore } from '../stores/gameStore'
import { getRandomRelics } from '../data/relics'
import { useRelicStore } from '../stores/relicStore'
import '../StageMap.css'

const UPGRADE_COST = 40
const REMOVE_COST = 50
const RELIC_COST = 100

function getCardCost(card: { rarity: string; cost: number }): number {
  switch (card.rarity) {
    case 'common': return 25
    case 'uncommon': return 40
    case 'rare': return 60
    case 'epic': return 90
    default: return 30
  }
}

function getCardIcon(cardId: string): string {
  const map: Record<string, string> = {
    scaleup: '⚔️', funding: '💰', heal: '💚', ip_protect: '🛡️', pivot: '🎲',
    aggressive_growth: '⚔️', team_hire: '👥', pivot_small: '🔄', milestone: '🏁',
    focus_boost: '⚡', ipo_strike: '🚀', bankruptcy: '💸',
    passive_heal: '💚', passive_shield: '🛡️', passive_draw: '⚡',
  }
  return map[cardId] || '📦'
}

type Tab = 'buy' | 'upgrade' | 'remove' | 'relic'

export default function ShopScreen() {
  const [tab, setTab] = useState<Tab>('buy')
  const [shopItems] = useState<string[]>(() => getShopCards(5))
  const [bought, setBought] = useState<Set<string>>(new Set())
  const [upgradedCards, setUpgradedCards] = useState<Set<string>>(new Set())
  const [removedCards, setRemovedCards] = useState<Set<string>>(new Set())
  const [boughtRelic, setBoughtRelic] = useState(false)
  const player = usePlayerStore()
  const deck = useDeckStore()
  const game = useGameStore()
  const existingRelics = useRelicStore((s) => s.relics)

  // 상점 Relic 1개 생성
  const [shopRelic] = useState(() => getRandomRelics(1, existingRelics.map((r) => r.id)))

  const handleBuy = (cardId: string) => {
    const card = CARDS[cardId]
    const cost = card ? getCardCost(card) : 30
    if (player.funds < cost || bought.has(cardId)) return
    usePlayerStore.setState({ funds: player.funds - cost })
    useDeckStore.setState({ discardPile: [...deck.discardPile, cardId] })
    setBought(new Set([...bought, cardId]))
  }

  const handleUpgrade = (cardId: string) => {
    if (player.funds < UPGRADE_COST || upgradedCards.has(cardId)) return
    usePlayerStore.setState({ funds: player.funds - UPGRADE_COST })
    useDeckStore.getState().upgradeCard(cardId)
    setUpgradedCards(new Set([...upgradedCards, cardId]))
  }

  const handleRemove = (cardId: string) => {
    if (player.funds < REMOVE_COST || removedCards.has(cardId)) return
    usePlayerStore.setState({ funds: player.funds - REMOVE_COST })
    useDeckStore.getState().removeCardFromDeck(cardId)
    setRemovedCards(new Set([...removedCards, cardId]))
  }

  const handleBuyRelic = () => {
    if (player.funds < RELIC_COST || boughtRelic || shopRelic.length === 0) return
    usePlayerStore.setState({ funds: player.funds - RELIC_COST })
    useRelicStore.getState().addRelic(shopRelic[0])
    setBoughtRelic(true)
  }

  // 덱에 있는 모든 카드 ID (중복 제거)
  const allDeckCards = [...deck.drawPile, ...deck.hand, ...deck.discardPile]
  const deckCardIds = [...new Set(allDeckCards)]

  const tabs: { id: Tab; label: string }[] = [
    { id: 'buy', label: '구매' },
    { id: 'upgrade', label: `강화 ${UPGRADE_COST}💰` },
    { id: 'remove', label: `제거 ${REMOVE_COST}💰` },
    { id: 'relic', label: `Relic ${RELIC_COST}💰` },
  ]

  return (
    <div className="generic-screen">
      <div className="generic-title">상점</div>
      <div style={{ fontSize: '15px', color: 'var(--accent-green)' }}>Funds: {player.funds}</div>

      <div style={{ display: 'flex', gap: '8px', margin: '12px 0', flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className="generic-btn"
            style={{ opacity: tab === t.id ? 1 : 0.5, fontSize: '12px' }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'buy' && (
        <div style={{ display: 'flex', gap: '16px' }}>
          {shopItems.map((id) => {
            const card = CARDS[id]
            if (!card) return null
            const cost = getCardCost(card)
            const isBought = bought.has(id)
            const canAfford = player.funds >= cost
            return (
              <button key={id} className="reward-card"
                style={{ opacity: isBought ? 0.3 : canAfford ? 1 : 0.5, width: '140px' }}
                onClick={() => handleBuy(id)} disabled={isBought || !canAfford}>
                <div style={{ fontSize: '28px' }}>{getCardIcon(id)}</div>
                <div style={{ fontWeight: 700 }}>{card.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{card.type}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '4px' }}>
                  {isBought ? 'SOLD' : `${cost}💰`}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {tab === 'upgrade' && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {deckCardIds.filter((id) => !upgradedCards.has(id)).length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>강화 가능한 카드가 없습니다</div>
          )}
          {deckCardIds.filter((id) => !upgradedCards.has(id) && !id.includes('+')).map((id) => {
            const card = CARDS[id]
            if (!card) return null
            return (
              <button key={id} className="reward-card"
                style={{ opacity: player.funds >= UPGRADE_COST ? 1 : 0.5, width: '140px' }}
                onClick={() => handleUpgrade(id)} disabled={player.funds < UPGRADE_COST}>
                <div style={{ fontSize: '28px' }}>{getCardIcon(id)}</div>
                <div style={{ fontWeight: 700 }}>{card.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {card.effects.map((e) => e.value).join('/')} → {card.effects.map((e) => e.type === 'draw' ? e.value + 1 : Math.ceil(e.value * 1.5)).join('/')}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '4px' }}>{UPGRADE_COST}💰</div>
              </button>
            )
          })}
        </div>
      )}

      {tab === 'remove' && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {deckCardIds.filter((id) => !removedCards.has(id)).length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>제거 가능한 카드가 없습니다</div>
          )}
          {deckCardIds.filter((id) => !removedCards.has(id)).map((id) => {
            const card = CARDS[id]
            if (!card) return null
            return (
              <button key={id} className="reward-card"
                style={{ opacity: player.funds >= REMOVE_COST ? 1 : 0.5, width: '140px' }}
                onClick={() => handleRemove(id)} disabled={player.funds < REMOVE_COST}>
                <div style={{ fontSize: '28px' }}>{getCardIcon(id)}</div>
                <div style={{ fontWeight: 700 }}>{card.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{card.type}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-red, #c4454a)', marginTop: '4px' }}>{REMOVE_COST}💰</div>
              </button>
            )
          })}
        </div>
      )}

      {tab === 'relic' && (
        <div>
          {shopRelic.length === 0 || boughtRelic ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {boughtRelic ? '구매 완료' : '판매할 Relic이 없습니다'}
            </div>
          ) : (
            <button className="reward-card"
              style={{ opacity: player.funds >= RELIC_COST ? 1 : 0.5, width: '180px' }}
              onClick={handleBuyRelic} disabled={player.funds < RELIC_COST}>
              <div style={{ fontSize: '32px' }}>{shopRelic[0].icon}</div>
              <div style={{ fontWeight: 700 }}>{shopRelic[0].name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{shopRelic[0].description}</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '4px' }}>{RELIC_COST}💰</div>
            </button>
          )}
        </div>
      )}

      <div className="generic-actions">
        <button className="generic-btn" onClick={() => game.goToMap()}>나가기</button>
      </div>
    </div>
  )
}
