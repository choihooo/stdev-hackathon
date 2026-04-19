import { create } from 'zustand'
import { ENEMIES } from '../data/enemies'
import type { StatusEffect, Intent } from '../data/enemies'

interface EnemyState {
  id: string
  name: string
  icon: string
  maxHp: number
  hp: number
  phase: 1 | 2
  phaseTransition: boolean
  buffs: StatusEffect[]
  intent: Intent | null
  patternIndex: number

  loadEnemy: (enemyId: string) => void
  takeDamage: (amount: number) => boolean // returns true if died
  addShield: (amount: number) => void
  addBuff: (effect: StatusEffect) => void
  tickBuffs: () => void
  nextIntent: () => void
  clearPhaseTransition: () => void
  reset: () => void
}

export const useEnemyStore = create<EnemyState>((set, get) => ({
  id: '',
  name: '',
  icon: '',
  maxHp: 0,
  hp: 0,
  phase: 1,
  phaseTransition: false,
  buffs: [],
  intent: null,
  patternIndex: 0,

  loadEnemy: (enemyId) => {
    const data = ENEMIES[enemyId]
    if (!data) return
    set({
      id: data.id,
      name: data.name,
      icon: data.icon,
      maxHp: data.maxHp,
      hp: data.maxHp,
      phase: 1,
      phaseTransition: false,
      buffs: [],
      intent: data.patterns.phase1[0],
      patternIndex: 0,
    })
  },

  takeDamage: (amount) => {
    set((s) => {
      // 적 방어 버프 흡수
      let remaining = amount
      const newBuffs = [...s.buffs]
      const shieldIdx = newBuffs.findIndex((b) => b.name === '방어')
      if (shieldIdx !== -1) {
        const absorbed = Math.min(newBuffs[shieldIdx].value, remaining)
        remaining -= absorbed
        newBuffs[shieldIdx] = { ...newBuffs[shieldIdx], value: newBuffs[shieldIdx].value - absorbed }
        if (newBuffs[shieldIdx].value <= 0) newBuffs.splice(shieldIdx, 1)
      }
      const newHp = Math.max(0, s.hp - remaining)
      const wasPhase1 = s.phase === 1
      const newPhase = newHp <= s.maxHp / 2 ? 2 : s.phase
      return {
        hp: newHp,
        phase: newPhase as 1 | 2,
        phaseTransition: wasPhase1 && newPhase === 2,
        buffs: newBuffs,
      }
    })
    return get().hp <= 0
  },

  addShield: (amount) => {
    // 적 방어는 버프로 처리
    set((s) => ({
      buffs: [...s.buffs, { name: '방어', icon: '🛡️', type: 'buff', value: amount, turns: 1 }],
    }))
  },

  addBuff: (effect) => set((s) => ({
    buffs: [...s.buffs, effect],
  })),

  tickBuffs: () => set((s) => ({
    buffs: s.buffs
      .map((b) => ({ ...b, turns: b.turns - 1 }))
      .filter((b) => b.turns > 0),
  })),

  nextIntent: () => {
    const { phase, patternIndex } = get()
    const data = ENEMIES[get().id]
    if (!data) return
    const patterns = phase === 1 ? data.patterns.phase1 : data.patterns.phase2
    const nextIndex = (patternIndex + 1) % patterns.length
    set({ patternIndex: nextIndex, intent: patterns[nextIndex] })
  },

  clearPhaseTransition: () => set({ phaseTransition: false }),

  reset: () => set({
    id: '', name: '', icon: '',
    maxHp: 0, hp: 0, phase: 1, phaseTransition: false,
    buffs: [], intent: null, patternIndex: 0,
  }),
}))
