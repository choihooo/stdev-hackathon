export interface RelicData {
  id: string
  name: string
  description: string
  icon: string
  // 이펙트 타입
  effectType: 'heal_per_turn' | 'extra_draw' | 'damage_reduction' | 'gold_bonus' | 'strength'
  effectValue: number
}

export const RELICS: Record<string, RelicData> = {
  coffee_machine: {
    id: 'coffee_machine',
    name: '커피 머신',
    description: '매 턴 HP 3 회복',
    icon: '☕',
    effectType: 'heal_per_turn',
    effectValue: 3,
  },
  standing_desk: {
    id: 'standing_desk',
    name: '스탠딩 데스크',
    description: '매 턴 추가 드로우 +1',
    icon: '🪑',
    effectType: 'extra_draw',
    effectValue: 1,
  },
  nda: {
    id: 'nda',
    name: 'NDA 계약서',
    description: '받는 데미지 -2',
    icon: '📜',
    effectType: 'damage_reduction',
    effectValue: 2,
  },
  series_a_badge: {
    id: 'series_a_badge',
    name: '시리즈A 배지',
    description: '전투 승리 시 Funds +15',
    icon: '🏆',
    effectType: 'gold_bonus',
    effectValue: 15,
  },
  mentor: {
    id: 'mentor',
    name: '멘토의 조언',
    description: '공격 카드 데미지 +3',
    icon: '🎓',
    effectType: 'strength',
    effectValue: 3,
  },
}

export const RELIC_IDS = Object.keys(RELICS)

export function getRandomRelics(count: number, exclude: string[]): RelicData[] {
  const available = RELIC_IDS.filter((id) => !exclude.includes(id))
  const shuffled = available.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((id) => RELICS[id])
}
