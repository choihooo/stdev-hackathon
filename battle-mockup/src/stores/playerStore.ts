import { create } from 'zustand'
import type { StatusEffect } from '../data/enemies'

interface PlayerState {
  hp: number
  maxHp: number
  funds: number
  focus: number
  maxFocus: number
  burnRate: number
  shield: number
  statuses: StatusEffect[]

  takeDamage: (amount: number) => void
  heal: (amount: number) => void
  addShield: (amount: number) => void
  spendFocus: (amount: number) => boolean
  refillFocus: () => void
  addStatus: (effect: StatusEffect) => void
  tickStatuses: () => void
  resetShield: () => void
  applyBurn: () => void
  reset: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  hp: 100,
  maxHp: 100,
  funds: 75,
  focus: 3,
  maxFocus: 3,
  burnRate: 1,
  shield: 0,
  statuses: [],

  takeDamage: (amount) => {
    const { shield } = get()
    const absorbed = Math.min(shield, amount)
    const remaining = amount - absorbed
    set((s) => {
      const newHp = Math.max(0, s.hp - remaining)
      return { hp: newHp, shield: Math.max(0, s.shield - absorbed) }
    })
  },

  heal: (amount) => set((s) => ({
    hp: Math.min(s.maxHp, s.hp + amount),
  })),

  addShield: (amount) => set((s) => ({
    shield: s.shield + amount,
  })),

  spendFocus: (amount) => {
    const { focus } = get()
    if (focus < amount) return false
    set({ focus: focus - amount })
    return true
  },

  refillFocus: () => set((s) => ({ focus: s.maxFocus })),

  addStatus: (effect) => set((s) => {
    // 같은 이름 상태이상은 턴 수만 갱신 (스택하지 않음)
    const existing = s.statuses.findIndex((e) => e.name === effect.name)
    if (existing !== -1) {
      const updated = [...s.statuses]
      updated[existing] = { ...updated[existing], turns: Math.max(updated[existing].turns, effect.turns), value: updated[existing].value + effect.value }
      return { statuses: updated }
    }
    return { statuses: [...s.statuses, effect] }
  }),

  tickStatuses: () => set((s) => ({
    statuses: s.statuses
      .map((e) => ({ ...e, turns: e.turns - 1 }))
      .filter((e) => e.turns > 0),
  })),

  resetShield: () => set({ shield: 0 }),

  applyBurn: () => {
    const { burnRate } = get()
    if (burnRate > 0) {
      set((s) => ({ hp: Math.max(0, s.hp - burnRate) }))
    }
  },

  reset: () => set({
    hp: 100, maxHp: 100, funds: 75,
    focus: 3, maxFocus: 3, burnRate: 1,
    shield: 0, statuses: [],
  }),
}))
