import { create } from 'zustand'
import type { RelicData } from '../data/relics'

interface RelicState {
  relics: RelicData[]
  addRelic: (relic: RelicData) => void
  hasRelic: (id: string) => boolean
  getHealPerTurn: () => number
  getExtraDraw: () => number
  getDamageReduction: () => number
  getGoldBonus: () => number
  getStrength: () => number
  reset: () => void
}

export const useRelicStore = create<RelicState>((set, get) => ({
  relics: [],

  addRelic: (relic) => set((s) => ({ relics: [...s.relics, relic] })),

  hasRelic: (id) => get().relics.some((r) => r.id === id),

  getHealPerTurn: () => get().relics.filter((r) => r.effectType === 'heal_per_turn').reduce((sum, r) => sum + r.effectValue, 0),

  getExtraDraw: () => get().relics.filter((r) => r.effectType === 'extra_draw').reduce((sum, r) => sum + r.effectValue, 0),

  getDamageReduction: () => get().relics.filter((r) => r.effectType === 'damage_reduction').reduce((sum, r) => sum + r.effectValue, 0),

  getGoldBonus: () => get().relics.filter((r) => r.effectType === 'gold_bonus').reduce((sum, r) => sum + r.effectValue, 0),

  getStrength: () => get().relics.filter((r) => r.effectType === 'strength').reduce((sum, r) => sum + r.effectValue, 0),

  reset: () => set({ relics: [] }),
}))
