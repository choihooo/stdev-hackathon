import { CARDS } from '../data/cards'
import { useDeckStore } from '../stores/deckStore'

function getCardIcon(cardId: string): string {
  const map: Record<string, string> = {
    scaleup: '⚔️', funding: '💰', heal: '💚', ip_protect: '🛡️', pivot: '🎲',
    aggressive_growth: '⚔️', team_hire: '👥', pivot_small: '🔄', milestone: '🏁',
    focus_boost: '⚡', ipo_strike: '🚀', bankruptcy: '💸',
    passive_heal: '💚', passive_shield: '🛡️', passive_draw: '⚡',
  }
  return map[cardId] || '📦'
}

export default function DeckViewer({ onClose }: { onClose: () => void }) {
  const deck = useDeckStore()

  const allCards = [
    ...deck.drawPile.map((id) => ({ id, loc: `드로우(${deck.drawPile.length})` })),
    ...deck.hand.map((id) => ({ id, loc: '핸드' })),
    ...deck.discardPile.map((id) => ({ id, loc: `버림(${deck.discardPile.length})` })),
  ]

  // 카드별 그룹화
  const grouped: Record<string, { count: number; loc: string; card: typeof CARDS[string] }> = {}
  allCards.forEach(({ id, loc }) => {
    if (!CARDS[id]) return // 무효 카드 스킵
    if (!grouped[id]) {
      grouped[id] = { count: 0, loc, card: CARDS[id] }
    }
    grouped[id].count++
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '80vh', overflow: 'auto' }}>
        <div className="modal-title">덱 보기 ({allCards.length}장)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Object.entries(grouped).map(([id, { count, card }]) => {
            if (!card) return null
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: '20px' }}>{getCardIcon(id)}</span>
                <span style={{ fontWeight: 600, fontSize: '13px', flex: 1 }}>{card.name}</span>
                <span style={{ fontSize: '11px', color: '#888' }}>{card.type}</span>
                <span style={{ fontSize: '11px', color: '#888' }}>{card.effects.map((e) => e.value).join('/')}</span>
                <span style={{ fontWeight: 700, color: '#c9a84c', fontSize: '13px' }}>x{count}</span>
              </div>
            )
          })}
        </div>
        <button className="modal-close" onClick={onClose}>닫기</button>
      </div>
    </div>
  )
}
