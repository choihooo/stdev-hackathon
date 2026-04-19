import { useEffect, useState, useCallback, useRef } from 'react'
import { useCombatStore } from '../stores/combatStore'
import { usePlayerStore } from '../stores/playerStore'
import { useEnemyStore } from '../stores/enemyStore'
import { useDeckStore } from '../stores/deckStore'
import { useGameStore } from '../stores/gameStore'
import { useFloatingText, FloatingTextOverlay } from './FloatingText'
import { ToastOverlay } from './Toast'
import { CardHistory } from './CardHistory'
import { StatusLog, useStatusLogStore } from './StatusLog'
import DeckViewer from './DeckViewer'
import '../App.css'

import cardScaleup from '../assets/card-scaleup.png'
import cardFunding from '../assets/card-funding.png'
import cardHeal from '../assets/card-heal.png'
import cardIpProtect from '../assets/card-ip-protect.png'
import cardPivot from '../assets/card-pivot.png'
import iconFunds from '../assets/icon-funds.png'
import iconFocus from '../assets/icon-focus.png'
import iconBurn from '../assets/icon-burn.png'
import iconShield from '../assets/icon-shield.png'
import iconStrength from '../assets/icon-strength.png'
import iconAgility from '../assets/icon-agility.png'
import iconInsight from '../assets/icon-insight.png'
import enemySeriesA from '../assets/enemy-series-a.png'

// Map card id to icon import key
function getCardIcon(cardId: string): string {
  const map: Record<string, string> = {
    scaleup: cardScaleup,
    funding: cardFunding,
    heal: cardHeal,
    ip_protect: cardIpProtect,
    pivot: cardPivot,
  }
  return map[cardId] || cardScaleup
}

// Map enemy icon string to import
function getEnemyIcon(icon: string): string {
  const map: Record<string, string> = {
    'enemy-series-a': enemySeriesA,
  }
  return map[icon] || enemySeriesA
}

// Status icon map
function getStatusIcon(name: string): string {
  const map: Record<string, string> = {
    '근력': iconStrength,
    '민첩': iconAgility,
    '통찰': iconInsight,
  }
  return map[name] || iconStrength
}

export default function BattleScreen() {
  const combat = useCombatStore()
  const player = usePlayerStore()
  const enemy = useEnemyStore()
  const deck = useDeckStore()
  const game = useGameStore()

  // 드래그 앤 드롭 상태
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [dragOverEnemy, setDragOverEnemy] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const cardRef = useRef<(HTMLDivElement | null)[]>([])

  // 수치 팝업
  const { items: floats, addFloat } = useFloatingText()
  const enemyPanelRef = useRef<HTMLDivElement>(null)

  const showDamageFloat = useCallback((value: number) => {
    const panel = enemyPanelRef.current
    if (panel) {
      const rect = panel.getBoundingClientRect()
      addFloat(`-${value}`, '#c4454a', rect.left + rect.width / 2 - 15, rect.top + 20)
    }
  }, [addFloat])

  const showHealFloat = useCallback((value: number) => {
    addFloat(`+${value}`, '#3d9e6e', window.innerWidth / 2 - 15, window.innerHeight - 250)
  }, [addFloat])

  const showShieldFloat = useCallback((value: number) => {
    addFloat(`🛡+${value}`, '#4a9ead', window.innerWidth / 2 - 20, window.innerHeight - 250)
  }, [addFloat])

  // 핸드 카드 고유 키 생성 (동일 ID 카드 구분)
  const handKeys = useRef<string[]>([])
  const currentHand = deck.hand
  if (handKeys.current.length !== currentHand.length) {
    // 핸드 길이가 변경되면 키 재생성
    handKeys.current = currentHand.map((id, i) => `${id}-${Date.now()}-${i}`)
  }

  // Phase 전환 연출
  const [showPhaseTransition, setShowPhaseTransition] = useState(false)

  // 튜토리얼
  const [tutorialStep, setTutorialStep] = useState(game.tutorialDone ? -1 : 0)
  const tutorialMessages = [
    { title: '전투 가이드', text: '카드를 클릭하거나 적에게 드래그하여 사용합니다.' },
    { title: 'Focus', text: '카드마다 Focus 비용이 필요합니다. 턴마다 Focus가 회복됩니다.' },
    { title: '적 의도', text: '적의 다음 행동이 카드 위에 표시됩니다. 공격 전에 방어하세요!' },
    { title: '준비 완료!', text: '승리하여 보상을 획득하세요. 화이팅!' },
  ]

  // 덱 뷰어
  const [showDeck, setShowDeck] = useState(false)

  // 카드 히스토리
  const [showCardHistory, setShowCardHistory] = useState(false)

  // 턴 전환 애니메이션
  const [turnTransition, setTurnTransition] = useState<'player' | 'enemy' | null>(null)
  const prevPhase = useRef(combat.phase)

  // 상태 로그
  const statusLogEntries = useStatusLogStore((s) => s.entries)

  // 카드 툴팁
  const [tooltipIdx, setTooltipIdx] = useState<number | null>(null)

  // 카드 사용 애니메이션
  const [playingIdx, setPlayingIdx] = useState<number | null>(null)

  // 승리/패배 연출
  const [showVictoryEffect, setShowVictoryEffect] = useState(false)
  const [showDefeatEffect, setShowDefeatEffect] = useState(false)

  useEffect(() => {
    if (combat.phase === 'victory') {
      setShowVictoryEffect(true)
    } else if (combat.phase === 'defeat') {
      setShowDefeatEffect(true)
    }
  }, [combat.phase])

  useEffect(() => {
    if (enemy.phaseTransition) {
      setShowPhaseTransition(true)
      const timer = setTimeout(() => {
        setShowPhaseTransition(false)
        useEnemyStore.getState().clearPhaseTransition()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [enemy.phaseTransition])

  // 턴 전환 애니메이션
  useEffect(() => {
    if (prevPhase.current !== combat.phase) {
      if (combat.phase === 'enemy_turn') {
        setTurnTransition('enemy')
        const t = setTimeout(() => setTurnTransition(null), 600)
        prevPhase.current = combat.phase
        return () => clearTimeout(t)
      } else if (combat.phase === 'player_turn' && prevPhase.current === 'enemy_turn') {
        setTurnTransition('player')
        const t = setTimeout(() => setTurnTransition(null), 600)
        prevPhase.current = combat.phase
        return () => clearTimeout(t)
      }
      prevPhase.current = combat.phase
    }
  }, [combat.phase])

  // 적 턴 / 버프 / 힐 수치 팝업 (로그 기반)
  const prevLogLen = useRef(combat.log.length)
  useEffect(() => {
    const newEntries = combat.log.slice(prevLogLen.current)
    prevLogLen.current = combat.log.length
    for (const entry of newEntries) {
      if (entry.type === 'damage-taken') {
        addFloat(`${entry.detail}`, '#c4454a', window.innerWidth / 2 - 15, window.innerHeight / 2)
      } else if (entry.type === 'damage') {
        // 플레이어 공격 — 이미 다른 곳에서 처리
      } else if (entry.type === 'heal') {
        if (entry.text.startsWith('[자동]') || entry.text === '커피 머신') {
          addFloat(`${entry.detail}`, '#3d9e6e', window.innerWidth / 2 - 15, window.innerHeight - 250)
        }
      } else if (entry.type === 'buff' && (entry.text === '운영 패시브' || entry.text.startsWith('[자동]') || entry.text.startsWith('적 '))) {
        addFloat(`${entry.detail}`, '#4a9ead', window.innerWidth / 2 - 20, window.innerHeight / 2 + 30)
      }
    }
  }, [combat.log.length])

  // 전투 시작
  useEffect(() => {
    const node = game.getCurrentNode()
    const enemyId = node?.enemyId || 'series_a'
    combat.startBattle(enemyId)
  }, [])

  const handData = deck.getHandData()

  // 키보드 단축키 (handData 이후에 선언)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (tutorialStep >= 0 && tutorialStep < tutorialMessages.length) return
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1
        if (idx < handData.length && combat.phase === 'player_turn' && player.focus >= handData[idx].cost) {
          const card = handData[idx]
          const success = combat.playCard(idx)
          if (success && card) {
            card.effects.forEach((ef) => {
              if (ef.type === 'damage') showDamageFloat(ef.value)
              if (ef.type === 'heal') showHealFloat(ef.value)
              if (ef.type === 'block') showShieldFloat(ef.value)
            })
          }
        }
      }
      if (e.key === 'e' || e.key === 'E') {
        if (combat.phase === 'player_turn') combat.endTurn()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [combat.phase, handData, player.focus, tutorialStep])

  const handleDragStart = useCallback((e: React.MouseEvent, index: number) => {
    const card = handData[index]
    if (!card || player.focus < card.cost || combat.phase !== 'player_turn') return
    e.preventDefault()
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    setDragPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setDragging(index)
  }, [handData, player.focus, combat.phase])

  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (dragging === null) return
    setDragPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y })

    // 적 영역 체크
    const enemyPanel = document.querySelector('.enemy-panel')
    if (enemyPanel) {
      const rect = enemyPanel.getBoundingClientRect()
      const over = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
      setDragOverEnemy(over)
    }
  }, [dragging])

  const handleDragEnd = useCallback(() => {
    if (dragging !== null && dragOverEnemy) {
      combat.playCard(dragging)
    }
    setDragging(null)
    setDragOverEnemy(false)
  }, [dragging, dragOverEnemy, combat])

  const hpPercent = player.hp / player.maxHp

  return (
    <div className="battle-screen"
      style={hpPercent <= 0.25 ? { animation: 'screenShake 0.5s ease-in-out' } : {}}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {hpPercent <= 0.25 && <div className="danger-vignette" style={{ position: 'fixed', inset: 0, zIndex: 100 }} />}
      {/* Resource Bar */}
      <div className="resource-bar">
        <div className="resource-item resource-funds">
          <img src={iconFunds} alt="Funds" className="resource-icon-img" />
          <span className="resource-value">{player.funds}</span>
          <span className="resource-label">Funds</span>
        </div>
        <div className="resource-item resource-focus">
          <img src={iconFocus} alt="Focus" className="resource-icon-img" />
          <span className="resource-value">{player.focus}/{player.maxFocus}</span>
          <span className="resource-label">Focus</span>
        </div>
        <div className="resource-item resource-burn">
          <img src={iconBurn} alt="Burn" className="resource-icon-img" />
          <span className="resource-value">{player.burnRate}</span>
          <span className="resource-label">Burn</span>
        </div>
        <div className="resource-item resource-stage">
          <span className="stage-badge">Stage 1 · Seed</span>
        </div>
        <div className="resource-item resource-deck" style={{ cursor: 'pointer' }} onClick={() => setShowDeck(true)}>
          덱 <span>{deck.drawPile.length + deck.hand.length + deck.discardPile.length}</span>
          {deck.drawPile.length <= 3 && deck.drawPile.length > 0 && (
            <span style={{ color: '#f39c12', fontSize: '11px', marginLeft: '4px' }}>⚠ 적음</span>
          )}
          {deck.drawPile.length === 0 && deck.discardPile.length > 0 && (
            <span style={{ color: '#e74c3c', fontSize: '11px', marginLeft: '4px' }}>재셔플</span>
          )}
        </div>
      </div>

      {/* Danger Gauge */}
      <div className="danger-gauge">
        <span className="danger-gauge-label">위험</span>
        <div className="danger-gauge-bar">
          <div className="danger-gauge-fill" style={{ width: `${Math.round((1 - player.hp / player.maxHp) * 100)}%` }} />
        </div>
        <span className="danger-gauge-value">{Math.round((1 - player.hp / player.maxHp) * 100)}%</span>
      </div>

      {/* Main Area */}
      <div className="main-area">
        {/* Combat Log */}
        <div className="combat-log">
          <div className="combat-log-title">LOG</div>
          {combat.log.map((entry, i) => (
            <div key={i} className={`log-entry log-${entry.type}`}>
              <span className="log-action">{entry.text}</span>
              <span className="log-detail">{entry.detail}</span>
            </div>
          ))}
          <div className="combat-log-title" style={{ marginTop: 12 }}>STATUS</div>
          <StatusLog entries={statusLogEntries} />
        </div>

        {/* Enemy Panel */}
        <div ref={enemyPanelRef} className={`enemy-panel${dragOverEnemy ? ' enemy-drop-target' : ''}`}>
          <div className="enemy-aura-ring" />
          <div className="enemy-aura" />
          <div className="enemy-aura-inner" />
          <div className="enemy-container">
            <img src={getEnemyIcon(enemy.icon)} alt={enemy.name} className="enemy-img" />
            <div className="enemy-glow" />
          </div>
          <div className="enemy-name">{enemy.name}</div>
          <div className="enemy-hp-container">
            <div className="enemy-hp-bar">
              <div className="enemy-hp-damage" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
              <div className="enemy-hp-fill" style={{
                width: `${(enemy.hp / enemy.maxHp) * 100}%`,
                background: enemy.phase === 2
                  ? "linear-gradient(90deg, #c4454a, #7a5cad)"
                  : undefined,
              }} />
            </div>
            <div className="enemy-hp-text">
              <span className="hp-current">{enemy.hp}</span>
              <span className="hp-divider">/</span>
              <span className="hp-max">{enemy.maxHp}</span>
            </div>
          </div>
          {enemy.intent && (
            <div className="enemy-intent">
              <span className="intent-icon">{enemy.intent.icon}</span>
              <span className="intent-label">{enemy.intent.label}</span>
              <span className="intent-value">{enemy.intent.value}</span>
            </div>
          )}
          <div className="enemy-buffs">
            {enemy.buffs.map((buff, i) => (
              <div key={i} className={`buff-icon buff-${buff.type === 'buff' ? 'str' : 'vuln'}`}>
                {buff.icon}
                <span className="buff-turns">{buff.turns}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Panel */}
        <div className="status-panel">
          <div className="status-shield">
            <img src={iconShield} alt="Shield" className="status-icon-img" />
            <span className="shield-value">{player.shield}</span>
          </div>
          <div className="status-effects">
            {player.statuses.map((status, i) => (
              <div key={i} className="status-effect">
                <img src={getStatusIcon(status.name)} alt={status.name} className="effect-icon-img" />
                <span className="effect-info">{status.name} <em>{status.turns}</em></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hand Area */}
      <div className="hand-area">
        <span className="turn-indicator">턴 {combat.turn}</span>
        {/* 카드 히스토리 버튼 */}
        <button
          className="card-history-btn"
          onClick={() => setShowCardHistory(true)}
          title="최근 사용 카드"
        >
          📋 <span className="card-history-count">{combat.cardHistory.length}</span>
        </button>
        <div className="hand-cards">
          {handData.map((card, i) => {
            const total = handData.length
            const mid = (total - 1) / 2
            const offset = i - mid
            const rotation = offset * 5
            const translateY = Math.abs(offset) * 8
            const translateX = offset * -6
            const canPlay = combat.phase === 'player_turn' && player.focus >= card.cost
            const isDragging = dragging === i
            const isPlaying = playingIdx === i
            return (
              <div
                key={handKeys.current[i]}
                ref={(el) => { cardRef.current[i] = el }}
                className={`card card-${card.type} ${card.rarity === 'rare' ? 'card-rare' : ''} ${!canPlay ? 'card-disabled' : ''} ${isDragging ? 'card-dragging' : ''} ${isPlaying ? 'card-playing' : ''}`}
                style={{
                  transform: isPlaying ? 'scale(1.2)' : `rotate(${rotation}deg) translateY(${translateY}px) translateX(${translateX}px)`,
                  transition: 'transform 0.3s ease, opacity 0.15s ease',
                  opacity: isDragging ? 0.3 : isPlaying ? 0 : 1,
                  animation: `cardDrawIn 0.3s ease-out ${i * 0.08}s both`,
                }}
                onClick={() => {
                  if (!isDragging && canPlay && playingIdx === null) {
                    setPlayingIdx(i)
                    const c = handData[i]
                    setTimeout(() => {
                      const success = combat.playCard(i)
                      if (success && c) {
                        c.effects.forEach((e) => {
                          if (e.type === 'damage') showDamageFloat(e.value)
                          if (e.type === 'heal') showHealFloat(e.value)
                          if (e.type === 'block') showShieldFloat(e.value)
                        })
                      }
                      setPlayingIdx(null)
                    }, 200)
                  }
                }}
                onMouseDown={(e) => handleDragStart(e, i)}
                onMouseEnter={() => setTooltipIdx(i)}
                onMouseLeave={() => setTooltipIdx(null)}
              >
                <div className="card-cost">{card.cost}</div>
                {card.rarity !== 'common' && (
                  <div className="card-rarity">
                    <span className="rarity-text">{card.rarity}</span>
                  </div>
                )}
                <div className="card-icon">
                  <img src={getCardIcon(card.id)} alt={card.name} className="card-icon-img" />
                </div>
                <div className="card-name">{card.name}</div>
                <div className="card-value">
                  {card.effects.map((e) => {
                    if (e.type === 'damage') return e.value
                    if (e.type === 'heal') return `+${e.value}`
                    if (e.type === 'block') return `+${e.value}`
                    if (e.type === 'burn_self') return e.value
                    if (e.type === 'focus_refill') return `F+${e.value}`
                    return e.value
                  }).join('/')}
                </div>
                <div className="card-type-label">
                  {card.type === 'attack' ? 'Attack' : card.type === 'heal' ? 'Heal' : card.type === 'utility' ? 'Utility' : 'Risk'}
                </div>
                {card.rarity === 'rare' && <div className="card-rare-glow" />}
                {tooltipIdx === i && (
                  <div className="card-tooltip">
                    <div className="card-tooltip-name">{card.name}</div>
                    <div className="card-tooltip-desc">
                      {card.effects.map((e) => {
                        if (e.type === 'damage') return `공격 ${e.value} `
                        if (e.type === 'heal') return `회복 +${e.value} `
                        if (e.type === 'block') return `방어 +${e.value} `
                        if (e.type === 'burn_self') return `자가피해 ${e.value} `
                        if (e.type === 'draw') return `드로우 +${e.value} `
                        if (e.type === 'focus_refill') return `Focus +${e.value} `
                        if (e.type === 'buff') return `${e.status}+${e.value} (${e.turns}턴) `
                        return `${e.type} ${e.value} `
                      })}
                    </div>
                    <div className="card-tooltip-effect">비용: {card.cost} Focus | {card.rarity}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {combat.phase === 'player_turn' && (
          <button className="end-turn-btn" onClick={() => combat.endTurn()}>
            <span>턴 종료</span>
            <span className="end-turn-arrow">▶</span>
          </button>
        )}
        {(combat.phase === 'victory' || combat.phase === 'defeat') && (
          <div className="combat-result">
            <div className={`result-text ${combat.phase}`}>{combat.phase === 'victory' ? '승리!' : '파산...'}</div>
          </div>
        )}

        {/* 승리/패배 연출 */}
        {showVictoryEffect && (
          <div className="victory-overlay">
            <div className="victory-particles">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="victory-particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-5%`,
                    animationDelay: `${Math.random() * 1}s`,
                    animationDuration: `${1.5 + Math.random()}s`,
                    width: `${4 + Math.random() * 4}px`,
                    height: `${4 + Math.random() * 4}px`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        {showDefeatEffect && (
          <div className="defeat-overlay" />
        )}
        {/* 드래그 중인 카드 플로팅 */}
        {dragging !== null && handData[dragging] && (
          <div
            className="card card-drag-ghost"
            style={{
              position: 'fixed',
              left: dragPos.x,
              top: dragPos.y,
              zIndex: 9999,
              pointerEvents: 'none',
              transform: 'scale(1.1) rotate(-2deg)',
            }}
          >
            <div className="card-cost">{handData[dragging].cost}</div>
            <div className="card-icon">
              <img src={getCardIcon(handData[dragging].id)} alt={handData[dragging].name} className="card-icon-img" />
            </div>
            <div className="card-name">{handData[dragging].name}</div>
          </div>
        )}
      </div>

      {/* 튜토리얼 */}
      {tutorialStep >= 0 && tutorialStep < tutorialMessages.length && (
        <div className="tutorial-overlay">
          <div className="tutorial-box">
            <div className="tutorial-title">{tutorialMessages[tutorialStep].title}</div>
            <div className="tutorial-text">{tutorialMessages[tutorialStep].text}</div>
            <div className="tutorial-dots">
              {tutorialMessages.map((_, i) => (
                <span key={i} className={`tutorial-dot${i === tutorialStep ? ' active' : ''}`} />
              ))}
            </div>
            <button className="tutorial-btn" onClick={() => {
              if (tutorialStep < tutorialMessages.length - 1) {
                setTutorialStep(tutorialStep + 1)
              } else {
                setTutorialStep(-1)
                game.completeTutorial()
              }
            }}>
              {tutorialStep < tutorialMessages.length - 1 ? '다음' : '시작!'}
            </button>
          </div>
        </div>
      )}

      {/* 수치 팝업 */}
      <FloatingTextOverlay items={floats} />

      {/* Toast 알림 */}
      <ToastOverlay />

      {/* 카드 히스토리 팝업 */}
      {showCardHistory && (
        <CardHistory
          history={combat.cardHistory}
          onClose={() => setShowCardHistory(false)}
        />
      )}

      {/* 턴 전환 애니메이션 */}
      {turnTransition && (
        <div className={`turn-transition-overlay turn-transition-${turnTransition}`}>
          <div className="turn-transition-text">
            {turnTransition === 'enemy' ? '적의 턴' : `턴 ${combat.turn}`}
          </div>
        </div>
      )}

      {/* 덱 뷰어 */}
      {showDeck && <DeckViewer onClose={() => setShowDeck(false)} />}

      {/* Phase 전환 연출 */}
      {showPhaseTransition && (
        <div className="phase-transition-overlay">
          <div className="phase-transition-text">
            <div className="phase-label">PHASE 2</div>
            <div className="phase-name">{enemy.name}이(가) 강화됩니다!</div>
          </div>
        </div>
      )}
    </div>
  )
}
