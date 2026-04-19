import { create } from 'zustand'
import { usePlayerStore } from './playerStore'
import { useEnemyStore } from './enemyStore'
import { saveGame } from './saveStore'
import { useDeckStore } from './deckStore'
import { useGameStore } from './gameStore'
import { playSound, SFX } from './soundStore'
import { FOUNDERS } from '../data/founders'
import { useRelicStore } from './relicStore'
import { useToastStore } from '../components/Toast'
import { useStatusLogStore } from '../components/StatusLog'
import type { CardHistoryEntry } from '../components/CardHistory'

export type CombatPhase = 'player_turn' | 'enemy_turn' | 'turn_transition' | 'victory' | 'defeat'

export interface LogEntry {
  text: string
  detail: string
  type: 'damage' | 'damage-taken' | 'heal' | 'buff' | 'system' | 'turn'
}

interface CombatState {
  turn: number
  phase: CombatPhase
  log: LogEntry[]
  cardHistory: CardHistoryEntry[]

  startBattle: (enemyId: string) => void
  playCard: (handIndex: number) => boolean
  endTurn: () => void
  addLog: (entry: LogEntry) => void
  reset: () => void
}

export const useCombatStore = create<CombatState>((set, get) => ({
  turn: 1,
  phase: 'player_turn',
  log: [],
  cardHistory: [],

  startBattle: (enemyId) => {
    usePlayerStore.getState().reset()
    useEnemyStore.getState().reset()
    useDeckStore.getState().reset()

    // 창업자 스탯 적용
    const founderId = useGameStore.getState().founderId
    const founder = founderId ? FOUNDERS[founderId] : null
    if (founder) {
      // 운영 창업자: HP 보너스 (+20)
      let hp = founder.hp
      let maxHp = founder.hp
      if (founderId === 'ops') {
        hp += 20
        maxHp += 20
      }
      usePlayerStore.setState({
        hp,
        maxHp,
        funds: founder.startFunds,
        maxFocus: founder.maxFocus,
        burnRate: founder.burnRate,
      })
    }

    useEnemyStore.getState().loadEnemy(enemyId)
    useStatusLogStore.getState().clear()

    // 난이도 적용
    const diff = useGameStore.getState().difficulty
    if (diff === 'easy') {
      usePlayerStore.setState({ hp: Math.round(usePlayerStore.getState().maxHp * 1.3), maxHp: Math.round(usePlayerStore.getState().maxHp * 1.3) })
    } else if (diff === 'hard') {
      usePlayerStore.setState({ burnRate: usePlayerStore.getState().burnRate + 1, maxFocus: Math.max(2, usePlayerStore.getState().maxFocus - 1) })
      useEnemyStore.setState({ hp: Math.round(useEnemyStore.getState().maxHp * 1.25), maxHp: Math.round(useEnemyStore.getState().maxHp * 1.25) })
    }

    // 창업자 전용 시작 덱
    if (founder) {
      useDeckStore.setState({
        drawPile: [...founder.startDeck].sort(() => Math.random() - 0.5),
        hand: [],
        discardPile: [],
      })
    } else {
      useDeckStore.getState().initDeck()
    }

    useDeckStore.getState().draw(5)
    usePlayerStore.getState().refillFocus()
    playSound(SFX.cardDraw)

    const enemy = useEnemyStore.getState()
    set({
      turn: 1,
      phase: 'player_turn',
      log: [
        { text: '전투 시작!', detail: enemy.name, type: 'system' },
      ],
      cardHistory: [],
    })
  },

  playCard: (handIndex) => {
    const { phase } = get()
    if (phase !== 'player_turn') return false

    const deck = useDeckStore.getState()
    const handData = deck.getHandData()
    if (handIndex >= handData.length) return false

    const card = handData[handIndex]
    const player = usePlayerStore.getState()

    // Focus 체크
    if (!player.spendFocus(card.cost)) {
      useToastStore.getState().showToast('Focus가 부족합니다', 'warning')
      return false
    }
    playSound(SFX.cardPlay)

    // 효과 적용
    const combat = get()
    for (const effect of card.effects) {
      switch (effect.type) {
        case 'damage': {
          const strength = useRelicStore.getState().getStrength()
          // 약화 디버프: 공격력 감소
          const weakness = usePlayerStore.getState().statuses
            .filter((s) => s.name === '약화' && s.type === 'debuff')
            .reduce((sum, s) => sum + s.value, 0)
          const finalDmg = Math.max(0, effect.value + strength - weakness)
          const died = useEnemyStore.getState().takeDamage(finalDmg)
          playSound(SFX.attackHit)
          combat.addLog({ text: card.name, detail: `-${finalDmg}`, type: 'damage' })
          if (died) {
            set({ phase: 'victory' })
            playSound(SFX.victory)
            combat.addLog({ text: '승리!', detail: '적 처치', type: 'system' })
            return true
          }
          break
        }
        case 'heal': {
          usePlayerStore.getState().heal(effect.value)
          playSound(SFX.heal)
          combat.addLog({ text: card.name, detail: `+${effect.value}`, type: 'heal' })
          break
        }
        case 'block': {
          usePlayerStore.getState().addShield(effect.value)
          playSound(SFX.shield)
          combat.addLog({ text: card.name, detail: `방어+${effect.value}`, type: 'buff' })
          break
        }
        case 'buff': {
          usePlayerStore.getState().addStatus({
            name: effect.status || '강화',
            icon: '💪',
            type: 'buff',
            value: effect.value,
            turns: effect.turns || 2,
          })
          combat.addLog({ text: card.name, detail: `${effect.status}+${effect.value}`, type: 'buff' })
          break
        }
        case 'burn_self': {
          usePlayerStore.getState().takeDamage(effect.value)
          combat.addLog({ text: '자가 피해', detail: `-${effect.value}`, type: 'damage-taken' })
          if (usePlayerStore.getState().hp <= 0) {
            set({ phase: 'defeat' })
            combat.addLog({ text: '파산!', detail: '자금 고갈', type: 'system' })
            return true
          }
          break
        }
        case 'draw': {
          useDeckStore.getState().draw(effect.value)
          break
        }
        case 'focus_refill': {
          const p = usePlayerStore.getState()
          usePlayerStore.setState({ focus: Math.min(p.maxFocus, p.focus + effect.value) })
          combat.addLog({ text: card.name, detail: `Focus +${effect.value}`, type: 'buff' })
          break
        }
      }
    }

    // 카드 제거
    deck.removeFromHand(handIndex)

    // 카드 히스토리 기록
    const effectDescriptions = card.effects.map((e) => {
      if (e.type === 'damage') return `공격 ${e.value}`
      if (e.type === 'heal') return `회복 +${e.value}`
      if (e.type === 'block') return `방어 +${e.value}`
      if (e.type === 'draw') return `드로우 +${e.value}`
      if (e.type === 'burn_self') return `자가피해 ${e.value}`
      if (e.type === 'focus_refill') return `Focus +${e.value}`
      if (e.type === 'buff') return `${e.status}+${e.value}`
      return `${e.type} ${e.value}`
    })
    set((s) => ({
      cardHistory: [...s.cardHistory, {
        turn: s.turn,
        cardName: card.name,
        effects: effectDescriptions,
        cost: card.cost,
        type: card.type,
      }],
    }))

    // 사용 가능한 카드가 없으면 자동 턴 종료
    // focus_refill, draw 효과로 상황이 바뀔 수 있으므로 잠시 대기 후 재확인
    setTimeout(() => {
      if (get().phase !== 'player_turn') return
      const hand = useDeckStore.getState().getHandData()
      const focus = usePlayerStore.getState().focus
      const canPlay = hand.some((c) => c.cost <= focus)
      if (!canPlay && hand.length > 0) {
        useToastStore.getState().showToast('사용 가능한 카드가 없습니다', 'info')
        setTimeout(() => {
          if (get().phase === 'player_turn') {
            get().endTurn()
          }
        }, 600)
      }
    }, 300)

    return true
  },

  endTurn: () => {
    const { phase } = get()
    if (phase !== 'player_turn') return

    set({ phase: 'turn_transition' })
    const combat = get()
    playSound(SFX.turnEnd)

    // 핸드 버림
    useDeckStore.getState().discardHand()

    // 플레이어 버프/디버프 턴 차감
    usePlayerStore.getState().tickStatuses()

    // Burn Rate 데미지
    const player = usePlayerStore.getState()
    if (player.burnRate > 0) {
      player.applyBurn()
      combat.addLog({ text: 'Burn Rate', detail: `-${player.burnRate}`, type: 'damage-taken' })
      useToastStore.getState().showToast(`Burn Rate: -${player.burnRate}`, 'danger')
      if (usePlayerStore.getState().hp <= 0) {
        set({ phase: 'defeat' })
        combat.addLog({ text: '파산!', detail: '자금 고갈', type: 'system' })
        return
      }
    }

    // 적 턴
    set({ phase: 'enemy_turn' })
    const enemy = useEnemyStore.getState()
    if (enemy.intent) {
      const intent = enemy.intent
      switch (intent.type) {
        case 'attack': {
          const reduction = useRelicStore.getState().getDamageReduction()
          // 적 근력 버프: 공격력 증가
          const enemyStrength = useEnemyStore.getState().buffs
            .filter((b) => b.name === '근력' && b.type === 'buff')
            .reduce((sum, b) => sum + b.value, 0)
          const finalDmg = Math.max(0, intent.value + enemyStrength - reduction)
          usePlayerStore.getState().takeDamage(finalDmg)
          combat.addLog({ text: '적 공격', detail: `-${finalDmg}`, type: 'damage-taken' })
          break
        }
        case 'defend': {
          enemy.addBuff({ name: '방어', icon: '🛡️', type: 'buff', value: intent.value, turns: 1 })
          combat.addLog({ text: '적 방어', detail: `방어+${intent.value}`, type: 'buff' })
          break
        }
        case 'buff': {
          enemy.addBuff({
            name: intent.status || '강화',
            icon: intent.icon,
            type: 'buff',
            value: intent.value,
            turns: intent.turns || 2,
          })
          combat.addLog({ text: '적 강화', detail: `${intent.status}+${intent.value}`, type: 'buff' })
          break
        }
        case 'debuff': {
          usePlayerStore.getState().addStatus({
            name: intent.status || '약화',
            icon: intent.icon || '🔻',
            type: 'debuff',
            value: intent.value,
            turns: intent.turns || 2,
          })
          combat.addLog({ text: '적 디버프', detail: `${intent.status || '약화'}+${intent.value}`, type: 'buff' })
          break
        }
      }

      // 플레이어 사망 체크
      const hpAfterEnemy = usePlayerStore.getState().hp
      if (hpAfterEnemy <= 0) {
        set({ phase: 'defeat' })
        playSound(SFX.defeat)
        combat.addLog({ text: '파산!', detail: '자금 고갈', type: 'system' })
        return
      }
      // 파산 임박 경고
      const maxHp = usePlayerStore.getState().maxHp
      if (hpAfterEnemy > 0 && hpAfterEnemy / maxHp <= 0.25) {
        useToastStore.getState().showToast('위험! 자금이 바닥입니다', 'danger')
      }
    }

    // 적 버프 턴 차감
    useEnemyStore.getState().tickBuffs()

    // 다음 턴
    const nextTurn = get().turn + 1
    usePlayerStore.getState().resetShield()
    usePlayerStore.getState().refillFocus()
    useEnemyStore.getState().nextIntent()

    // Relic 효과
    const relicStore = useRelicStore.getState()
    const healPerTurn = relicStore.getHealPerTurn()
    if (healPerTurn > 0) {
      usePlayerStore.getState().heal(healPerTurn)
      combat.addLog({ text: '커피 머신', detail: `+${healPerTurn}`, type: 'heal' })
    }

    const extraDraw = relicStore.getExtraDraw()
    // 창업자 패시브: 기술 — 추가 드로우 +1
    const founderId = useGameStore.getState().founderId
    const founderBonusDraw = founderId === 'tech' ? 1 : 0
    useDeckStore.getState().draw(2 + extraDraw + founderBonusDraw)

    // 창업자 패시브: 운영 — 매 턴 방어 +3
    if (founderId === 'ops') {
      usePlayerStore.getState().addShield(3)
      combat.addLog({ text: '운영 패시브', detail: '방어+3', type: 'buff' })
    }

    // 패시브 카드 자동 발동 (Focus 무료, 같은 ID 중복 발동 방지)
    useToastStore.getState().showToast('패시브 카드가 자동 발동됩니다', 'info')
    const deckState = useDeckStore.getState()
    const handCards = deckState.getHandData()
    const passiveIndices: number[] = []
    const seenPassiveIds = new Set<string>()
    handCards.forEach((card, i) => {
      if (card.type === 'passive') {
        if (!seenPassiveIds.has(card.id)) {
          seenPassiveIds.add(card.id)
          passiveIndices.push(i)
        }
      }
    })
    // 역순으로 제거 (인덱스 꼬임 방지)
    for (let i = passiveIndices.length - 1; i >= 0; i--) {
      const idx = passiveIndices[i]
      const card = handCards[idx]
      const combatRef = get()
      for (const effect of card.effects) {
        switch (effect.type) {
          case 'heal':
            usePlayerStore.getState().heal(effect.value)
            combatRef.addLog({ text: `[자동] ${card.name}`, detail: `+${effect.value}`, type: 'heal' })
            break
          case 'block':
            usePlayerStore.getState().addShield(effect.value)
            combatRef.addLog({ text: `[자동] ${card.name}`, detail: `방어+${effect.value}`, type: 'buff' })
            break
          case 'draw':
            useDeckStore.getState().draw(effect.value)
            combatRef.addLog({ text: `[자동] ${card.name}`, detail: `드로우+${effect.value}`, type: 'system' })
            break
          case 'buff':
            usePlayerStore.getState().addStatus({
              name: effect.status || '강화',
              icon: '💪',
              type: 'buff',
              value: effect.value,
              turns: effect.turns || 2,
            })
            combatRef.addLog({ text: `[자동] ${card.name}`, detail: `${effect.status}+${effect.value}`, type: 'buff' })
            break
        }
      }
      deckState.removeFromHand(idx)
    }

    combat.addLog({ text: `턴 ${nextTurn}`, detail: `Focus ${usePlayerStore.getState().maxFocus}/${usePlayerStore.getState().maxFocus}`, type: 'turn' })

    set({ turn: nextTurn, phase: 'player_turn' })

    // 자동 저장
    saveGame()
  },

  addLog: (entry) => set((s) => ({ log: [...s.log.slice(-49), entry] })),

  reset: () => set({ turn: 1, phase: 'player_turn', log: [], cardHistory: [] }),
}))
