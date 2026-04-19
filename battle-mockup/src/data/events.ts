export interface EventOption {
  label: string
  description: string
  hpChange: number    // 양수=회복, 음수=피해
  fundsChange: number
  statusEffect?: { name: string; value: number; turns: number }
  addCard?: string      // 덱에 추가할 카드 ID
}

export interface EventData {
  id: string
  title: string
  description: string
  icon: string
  options: EventOption[]
}

export const EVENTS: Record<string, EventData> = {
  cofounder: {
    id: 'cofounder',
    title: '공동창업자의 고백',
    description: '공동창업자가 갑자기 퇴사를 통보했습니다. 어떻게 하시겠습니까?',
    icon: '🤝',
    options: [
      {
        label: '대화로 설득한다',
        description: '결과를 알 수 없습니다',
        hpChange: -10,
        fundsChange: 0,
      },
      {
        label: '받아들이고 혼자 간다',
        description: 'HP -10, Funds +20',
        hpChange: -10,
        fundsChange: 20,
        statusEffect: { name: '독립', value: 3, turns: 5 },
      },
    ],
  },
  investor_pitch: {
    id: 'investor_pitch',
    title: '엔젤 투자자의 제안',
    description: '엔젤 투자자가 조건부 투자를 제안했습니다. 지분을 요구하고 있습니다.',
    icon: '👼',
    options: [
      {
        label: '투자를 수락한다',
        description: 'Funds +40, 하지만 Burn Rate +1',
        hpChange: 0,
        fundsChange: 40,
        statusEffect: { name: '투자부담', value: 1, turns: 99 },
      },
      {
        label: '거절하고 자력으로 간다',
        description: 'HP -15, Focus +1 영구',
        hpChange: -15,
        fundsChange: 0,
      },
    ],
  },
  office_fire: {
    id: 'office_fire',
    title: '사무실 화재',
    description: '사무실에 화재가 발생했습니다! 서버는 백업되어 있지만 장비 손실이 불가피합니다.',
    icon: '🔥',
    options: [
      {
        label: '장비를 구한다',
        description: 'HP -20, 하지만 Funds +30 (보험금)',
        hpChange: -20,
        fundsChange: 30,
      },
      {
        label: '빠르게 대피한다',
        description: 'HP -5, 모든 것을 잃고 재시작',
        hpChange: -5,
        fundsChange: -20,
      },
    ],
  },
  viral_marketing: {
    id: 'viral_marketing',
    title: '바이럴 마케팅 기회',
    description: 'SNS에서 제품이 급속도로 퍼지고 있습니다! 이 흐름을 탈까요?',
    icon: '📱',
    options: [
      {
        label: '마케팅 예산을 투입한다',
        description: 'Funds -25, HP +20 (사용자 유입)',
        hpChange: 20,
        fundsChange: -25,
      },
      {
        label: '자연스럽게 둔다',
        description: 'Funds +10, 카드 1장 획득',
        hpChange: 0,
        fundsChange: 10,
        addCard: 'aggressive_growth',
      },
    ],
  },
  talent_scout: {
    id: 'talent_scout',
    title: '스카우트 제안',
    description: '경쟁사에서 핵심 개발자를 스카우트하려고 합니다. 대응이 필요합니다.',
    icon: '🎯',
    options: [
      {
        label: '연봉 인상으로 잡는다',
        description: 'Funds -30, 매 턴 데미지 -1',
        hpChange: 0,
        fundsChange: -30,
        statusEffect: { name: '핵심인재', value: -1, turns: 99 },
      },
      {
        label: '보내준다',
        description: 'HP -15, 새 카드로 대체',
        hpChange: -15,
        fundsChange: 0,
        addCard: 'team_hire',
      },
    ],
  },
  lawsuit: {
    id: 'lawsuit',
    title: '특허 소송',
    description: '대기업이 특허 침해 소송을 걸었습니다. 법정 싸움은 길고 불확실합니다.',
    icon: '⚖️',
    options: [
      {
        label: '법적으로 맞서 싸운다',
        description: 'Funds -35, 승소 시 HP +25',
        hpChange: 25,
        fundsChange: -35,
      },
      {
        label: '합의로 끝낸다',
        description: 'Funds -15, HP -10',
        hpChange: -10,
        fundsChange: -15,
      },
    ],
  },
  pivot_opportunity: {
    id: 'pivot_opportunity',
    title: '피벗의 기회',
    description: '새로운 시장 기회가 보입니다. 지금 사업 모델을 전면 수정할까요?',
    icon: '🔄',
    options: [
      {
        label: '전면 피벗',
        description: 'HP -20, 강력한 카드 획득',
        hpChange: -20,
        fundsChange: 0,
        addCard: 'ipo_strike',
      },
      {
        label: '기존 모델 고수',
        description: 'Funds +15, 안정적 진행',
        hpChange: 0,
        fundsChange: 15,
      },
    ],
  },
}

export const EVENT_IDS = Object.keys(EVENTS)

export function getRandomEvent(): EventData {
  const idx = Math.floor(Math.random() * EVENT_IDS.length)
  return EVENTS[EVENT_IDS[idx]]
}
