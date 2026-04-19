export interface Effect {
  type: 'damage' | 'block' | 'heal' | 'buff' | 'debuff' | 'draw' | 'burn_self' | 'focus_refill'
  value: number
  target: 'enemy' | 'self'
  status?: string
  turns?: number
}

export interface CardData {
  id: string
  name: string
  cost: number
  type: 'attack' | 'heal' | 'utility' | 'passive' | 'risk'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  icon: string
  effects: Effect[]
  upgraded?: boolean
}

export const CARDS: Record<string, CardData> = {
  // === Attack ===
  scaleup: {
    id: 'scaleup', name: '스케일업', cost: 2, type: 'attack', rarity: 'common', icon: 'scaleup',
    effects: [{ type: 'damage', value: 15, target: 'enemy' }],
  },
  funding: {
    id: 'funding', name: '펀딩 라운드', cost: 1, type: 'attack', rarity: 'common', icon: 'funding',
    effects: [{ type: 'damage', value: 8, target: 'enemy' }],
  },
  // === Heal ===
  heal: {
    id: 'heal', name: '런웨이 연장', cost: 1, type: 'heal', rarity: 'common', icon: 'heal',
    effects: [{ type: 'heal', value: 8, target: 'self' }],
  },
  // === Utility ===
  ip_protect: {
    id: 'ip_protect', name: 'IP 보호', cost: 1, type: 'utility', rarity: 'common', icon: 'ip_protect',
    effects: [{ type: 'block', value: 6, target: 'self' }],
  },
  // === Risk ===
  pivot: {
    id: 'pivot', name: '전면 피벗', cost: 0, type: 'risk', rarity: 'rare', icon: 'pivot',
    effects: [
      { type: 'damage', value: 25, target: 'enemy' },
      { type: 'burn_self', value: 10, target: 'self' },
    ],
  },
  // === 새 카드들 ===
  aggressive_growth: {
    id: 'aggressive_growth', name: '공격적 확장', cost: 2, type: 'attack', rarity: 'uncommon', icon: 'scaleup',
    effects: [
      { type: 'damage', value: 10, target: 'enemy' },
      { type: 'block', value: 5, target: 'self' },
    ],
  },
  team_hire: {
    id: 'team_hire', name: '팀 채용', cost: 1, type: 'utility', rarity: 'uncommon', icon: 'funding',
    effects: [
      { type: 'block', value: 8, target: 'self' },
      { type: 'draw', value: 1, target: 'self' },
    ],
  },
  pivot_small: {
    id: 'pivot_small', name: '마이크로 피벗', cost: 1, type: 'risk', rarity: 'uncommon', icon: 'pivot',
    effects: [
      { type: 'damage', value: 18, target: 'enemy' },
      { type: 'burn_self', value: 5, target: 'self' },
    ],
  },
  milestone: {
    id: 'milestone', name: '마일스톤', cost: 0, type: 'heal', rarity: 'uncommon', icon: 'heal',
    effects: [{ type: 'heal', value: 5, target: 'self' }],
  },
  focus_boost: {
    id: 'focus_boost', name: '집중 강화', cost: 1, type: 'utility', rarity: 'rare', icon: 'ip_protect',
    effects: [
      { type: 'draw', value: 2, target: 'self' },
      { type: 'block', value: 4, target: 'self' },
    ],
  },
  // === 에픽 ===
  ipo_strike: {
    id: 'ipo_strike', name: 'IPO 스트라이크', cost: 3, type: 'attack', rarity: 'epic', icon: 'scaleup',
    effects: [
      { type: 'damage', value: 35, target: 'enemy' },
      { type: 'heal', value: 5, target: 'self' },
    ],
  },
  bankruptcy: {
    id: 'bankruptcy', name: '파산 위기 도박', cost: 0, type: 'risk', rarity: 'epic', icon: 'pivot',
    effects: [
      { type: 'damage', value: 40, target: 'enemy' },
      { type: 'burn_self', value: 20, target: 'self' },
    ],
  },
  // === Passive ===
  passive_heal: {
    id: 'passive_heal', name: '자동 복구', cost: 0, type: 'passive', rarity: 'uncommon', icon: 'heal',
    effects: [{ type: 'heal', value: 4, target: 'self' }],
  },
  passive_shield: {
    id: 'passive_shield', name: '자동 방어', cost: 0, type: 'passive', rarity: 'uncommon', icon: 'ip_protect',
    effects: [{ type: 'block', value: 3, target: 'self' }],
  },
  passive_draw: {
    id: 'passive_draw', name: '자동 분석', cost: 0, type: 'passive', rarity: 'rare', icon: 'focus_boost',
    effects: [{ type: 'draw', value: 1, target: 'self' }],
  },
  // === Focus Recovery ===
  focus_refill: {
    id: 'focus_refill', name: '에너지 드링크', cost: 0, type: 'utility', rarity: 'uncommon', icon: 'funding',
    effects: [{ type: 'focus_refill', value: 2, target: 'self' }],
  },
}

export function createStarterDeck(): string[] {
  return [
    'scaleup', 'scaleup',
    'funding', 'funding',
    'heal', 'heal',
    'ip_protect', 'ip_protect',
    'pivot',
  ]
}

// 보상/상점에 등장할 카드 풀
export function getRewardPool(): string[] {
  return Object.keys(CARDS).filter((id) => CARDS[id].rarity !== 'legendary')
}

// 희귀도 가중치
const RARITY_WEIGHTS: Record<string, number> = {
  common: 65,
  uncommon: 25,
  rare: 9,
  epic: 1,
}

// 가중치 랜덤으로 카드 1장 뽑기
export function getRandomCardByRarity(exclude: string[] = []): CardData | null {
  const pool = Object.keys(CARDS).filter((id) =>
    CARDS[id].rarity !== 'legendary' && !exclude.includes(id)
  )
  if (pool.length === 0) return null

  // 희귀도 먼저 결정
  const roll = Math.random() * 100
  let targetRarity: string
  if (roll < RARITY_WEIGHTS.epic) targetRarity = 'epic'
  else if (roll < RARITY_WEIGHTS.epic + RARITY_WEIGHTS.rare) targetRarity = 'rare'
  else if (roll < RARITY_WEIGHTS.epic + RARITY_WEIGHTS.rare + RARITY_WEIGHTS.uncommon) targetRarity = 'uncommon'
  else targetRarity = 'common'

  // 해당 희귀도 카드 중 랜덤, 없으면 전체 풀에서
  const rarityPool = pool.filter((id) => CARDS[id].rarity === targetRarity)
  const finalPool = rarityPool.length > 0 ? rarityPool : pool
  const picked = finalPool[Math.floor(Math.random() * finalPool.length)]
  return CARDS[picked] || null
}

// 상점 카드 랜덤 생성 (희귀도 가중치)
export function getShopCards(count: number): string[] {
  const result: string[] = []
  for (let i = 0; i < count; i++) {
    const card = getRandomCardByRarity(result)
    if (card) result.push(card.id)
  }
  return result
}

// 카드 업그레이드: 효과값 50% 증가
export function getUpgradedCard(card: CardData): CardData {
  return {
    ...card,
    id: card.id,
    name: card.name + '+',
    upgraded: true,
    effects: card.effects.map((e) => ({
      ...e,
      value: e.type === 'draw' ? e.value + 1 : Math.ceil(e.value * 1.5),
    })),
  }
}
