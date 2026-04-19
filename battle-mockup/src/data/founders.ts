export interface FounderData {
  id: string
  name: string
  desc: string
  icon: string
  tag: string
  hp: number
  maxFocus: number
  startFunds: number
  burnRate: number
  startDeck: string[]
  passive: string  // 패시브 설명
}

export const FOUNDERS: Record<string, FounderData> = {
  tech: {
    id: 'tech',
    name: '기술',
    desc: '코드로 세상을 바꾸는 엔지니어',
    icon: 'founder-tech',
    tag: '추천',
    hp: 80,
    maxFocus: 4,
    startFunds: 60,
    burnRate: 1,
    startDeck: [
      'scaleup', 'scaleup', 'scaleup',
      'funding', 'funding',
      'heal',
      'ip_protect', 'ip_protect',
      'focus_boost',
    ],
    passive: '매 턴 추가 드로우 +1', // 전투 중 매 턴 카드 1장 추가 드로우
  },
  ops: {
    id: 'ops',
    name: '운영',
    desc: '조직을 움직이는 리더',
    icon: 'founder-ops',
    tag: '',
    hp: 120,
    maxFocus: 3,
    startFunds: 80,
    burnRate: 1,
    startDeck: [
      'scaleup',
      'funding', 'funding',
      'heal', 'heal', 'heal',
      'ip_protect', 'ip_protect',
      'milestone',
    ],
    passive: 'HP +20, 매 턴 방어+3',
  },
  marketing: {
    id: 'marketing',
    name: '마케팅',
    desc: '시장을 사로잡는 스토리텔러',
    icon: 'founder-marketing',
    tag: '',
    hp: 90,
    maxFocus: 3,
    startFunds: 100,
    burnRate: 1,
    startDeck: [
      'scaleup', 'scaleup',
      'funding', 'funding', 'funding',
      'heal',
      'ip_protect',
      'aggressive_growth',
    ],
    passive: '시작 Funds +25',
  },
}
