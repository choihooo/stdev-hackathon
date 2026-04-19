import { useGameStore } from '../stores/gameStore'
import { useCombatStore } from '../stores/combatStore'
import { usePlayerStore } from '../stores/playerStore'
import { useDeckStore } from '../stores/deckStore'
import { useRelicStore } from '../stores/relicStore'
import { useState } from 'react'
import '../StageMap.css'

export default function ResultScreen() {
  const game = useGameStore()
  const combat = useCombatStore()
  const player = usePlayerStore()
  const deck = useDeckStore()
  const relics = useRelicStore()

  const handleRestart = () => {
    combat.reset()
    player.reset()
    deck.reset()
    relics.reset()
    game.reset()
  }

  const totalCards = deck.drawPile.length + deck.hand.length + deck.discardPile.length
  const victory = game.isVictory

  // 승리 파티클
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${1.5 + Math.random() * 1.5}s`,
      size: `${4 + Math.random() * 6}px`,
    }))
  )

  return (
    <div className="generic-screen" style={{
      background: victory
        ? 'linear-gradient(180deg, #08090d 0%, #1a2a1a 100%)'
        : 'linear-gradient(180deg, #08090d 0%, #2a1a1a 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 승리 골드 파티클 */}
      {victory && particles.map((p) => (
        <div key={p.id} style={{
          position: 'absolute',
          left: p.left,
          top: '-5%',
          width: p.size,
          height: p.size,
          background: 'var(--accent-gold)',
          borderRadius: '50%',
          animation: `particleFall ${p.duration} ease-in ${p.delay} forwards`,
          pointerEvents: 'none',
        }} />
      ))}
      {/* 패배 빨강 비네트 */}
      {!victory && (
        <div style={{
          position: 'absolute', inset: 0,
          boxShadow: 'inset 0 0 120px rgba(196, 69, 74, 0.25)',
          pointerEvents: 'none',
          animation: 'fadeIn 1.5s ease-out',
        }} />
      )}
      <div className="result-icon" style={{ fontSize: '64px', zIndex: 1 }}>{victory ? '🎉' : '💀'}</div>
      <div className="generic-title" style={{
        color: victory ? 'var(--accent-gold)' : 'var(--accent-red)',
        fontSize: '28px',
      }}>
        {victory ? 'IPO 성공!' : '파산...'}
      </div>

      <div className="result-summary" style={{ margin: '20px 0', textAlign: 'left', maxWidth: '300px' }}>
        <div style={{ fontWeight: 700, marginBottom: '8px', color: victory ? '#c9a84c' : '#c4454a' }}>런 요약</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>총 턴</span>
            <span>{combat.turn}턴</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>남은 HP</span>
            <span style={{ color: player.hp > player.maxHp * 0.3 ? '#3d9e6e' : '#c4454a' }}>
              {player.hp}/{player.maxHp}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>남은 Funds</span>
            <span style={{ color: '#c9a84c' }}>{player.funds}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>최종 덱</span>
            <span>{totalCards}장</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>획득 Relic</span>
            <span>{relics.relics.length}개 {relics.relics.map((r) => r.icon).join(' ')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>도달</span>
            <span>Act {game.act}</span>
          </div>
        </div>
      </div>

      {victory && (
        <div style={{ margin: '12px 0', padding: '12px', borderRadius: '8px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', maxWidth: '300px' }}>
          <div style={{ fontSize: '13px', color: '#c9a84c', fontWeight: 600 }}>승리 조언</div>
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
            {combat.turn <= 10 ? '빠른 클리어! 완벽한 전략이었습니다.' :
             combat.turn <= 20 ? '안정적인 진행이었습니다. 다음엔 더 빠르게 도전해보세요.' :
             '치열한 싸움이었습니다. 덱 최적화를 고려해보세요.'}
          </div>
        </div>
      )}

      {!victory && (
        <div style={{ margin: '12px 0', padding: '12px', borderRadius: '8px', background: 'rgba(196,69,74,0.1)', border: '1px solid rgba(196,69,74,0.3)', maxWidth: '300px' }}>
          <div style={{ fontSize: '13px', color: '#c4454a', fontWeight: 600 }}>다음엔?</div>
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
            {player.hp <= 0 && combat.turn <= 5 ? '초반에 너무 많은 데미지를 받았습니다. 방어 카드를 더 추가해보세요.' :
             '덱을 더 효율적으로 구성하거나, 다른 창업자로 시도해보세요.'}
          </div>
        </div>
      )}

      <div className="generic-actions" style={{ display: 'flex', gap: '12px' }}>
        <button className="generic-btn generic-btn-primary" onClick={handleRestart}>다시하기</button>
      </div>
    </div>
  )
}
