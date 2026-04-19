import { create } from 'zustand'
import { CARDS, createStarterDeck, getUpgradedCard } from '../data/cards'
import type { CardData } from '../data/cards'

interface DeckState {
  drawPile: string[]
  hand: string[]
  discardPile: string[]

  initDeck: () => void
  draw: (count: number) => void
  discardHand: () => void
  removeFromHand: (index: number) => string | null
  getCardData: (cardId: string) => CardData | undefined
  getHandData: () => CardData[]
  getAllCards: () => { cardId: string; location: 'draw' | 'hand' | 'discard' }[]
  upgradeCard: (cardId: string) => void
  removeCardFromDeck: (cardId: string) => boolean
  reset: () => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const useDeckStore = create<DeckState>((set, get) => ({
  drawPile: [],
  hand: [],
  discardPile: [],

  initDeck: () => {
    const deck = shuffle(createStarterDeck())
    set({ drawPile: deck, hand: [], discardPile: [] })
  },

  draw: (count) => {
    const { drawPile, discardPile, hand } = get()
    let pool = [...drawPile]
    let discards = [...discardPile]

    const drawn: string[] = []
    for (let i = 0; i < count; i++) {
      if (pool.length === 0 && discards.length === 0) break
      if (pool.length === 0) {
        pool = shuffle(discards)
        discards = []
      }
      if (pool.length === 0) break
      drawn.push(pool.shift()!)
    }

    const newHand = [...hand, ...drawn]
    // 손패 10장 제한: 초과 시 앞에서부터 버림
    let overflow: string[] = []
    let trimmed = newHand
    if (newHand.length > 10) {
      overflow = newHand.slice(0, newHand.length - 10)
      trimmed = newHand.slice(newHand.length - 10)
    }

    set({
      drawPile: pool,
      discardPile: [...discards, ...overflow],
      hand: trimmed,
    })
  },

  discardHand: () => {
    const { hand, discardPile } = get()
    set({ hand: [], discardPile: [...discardPile, ...hand] })
  },

  removeFromHand: (index) => {
    const { hand, discardPile } = get()
    if (index < 0 || index >= hand.length) return null
    const cardId = hand[index]
    set({
      hand: hand.filter((_, i) => i !== index),
      discardPile: [...discardPile, cardId],
    })
    return cardId
  },

  getCardData: (cardId) => CARDS[cardId],

  getHandData: () => get().hand.map((id) => CARDS[id]).filter(Boolean),

  // 덱 전체 카드 데이터 반환 (drawPile + hand + discardPile)
  getAllCards: (): { cardId: string; location: 'draw' | 'hand' | 'discard' }[] => {
    const { drawPile, hand, discardPile } = get()
    return [
      ...drawPile.map((id) => ({ cardId: id, location: 'draw' as const })),
      ...hand.map((id) => ({ cardId: id, location: 'hand' as const })),
      ...discardPile.map((id) => ({ cardId: id, location: 'discard' as const })),
    ]
  },

  upgradeCard: (cardId: string) => {
    const upgraded = getUpgradedCard(CARDS[cardId])
    // CARDS에 업그레이드 버전 등록
    CARDS[upgraded.id] = upgraded
    // 덱에서 해당 카드를 업그레이드된 ID로 교체 (첫 1개만)
    const { drawPile, hand, discardPile } = get()
    const replaceFirst = (arr: string[]): { newArr: string[]; replaced: boolean } => {
      const idx = arr.indexOf(cardId)
      if (idx === -1) return { newArr: arr, replaced: false }
      const newArr = [...arr]
      newArr[idx] = upgraded.id
      return { newArr, replaced: true }
    }

    const r1 = replaceFirst(hand)
    if (r1.replaced) { set({ hand: r1.newArr }); return }

    const r2 = replaceFirst(drawPile)
    if (r2.replaced) { set({ drawPile: r2.newArr }); return }

    const r3 = replaceFirst(discardPile)
    if (r3.replaced) { set({ discardPile: r3.newArr }); return }
  },

  removeCardFromDeck: (cardId: string) => {
    const { drawPile, hand, discardPile } = get()
    const removeFirst = (arr: string[]): { newArr: string[]; removed: boolean } => {
      const idx = arr.indexOf(cardId)
      if (idx === -1) return { newArr: arr, removed: false }
      return { newArr: [...arr.slice(0, idx), ...arr.slice(idx + 1)], removed: true }
    }
    const r1 = removeFirst(hand)
    if (r1.removed) { set({ hand: r1.newArr }); return true }
    const r2 = removeFirst(drawPile)
    if (r2.removed) { set({ drawPile: r2.newArr }); return true }
    const r3 = removeFirst(discardPile)
    if (r3.removed) { set({ discardPile: r3.newArr }); return true }
    return false
  },

  reset: () => set({ drawPile: [], hand: [], discardPile: [] }),
}))
