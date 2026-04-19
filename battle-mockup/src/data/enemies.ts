export interface StatusEffect {
  name: string
  icon: string
  type: 'buff' | 'debuff'
  value: number
  turns: number
}

export interface Intent {
  type: 'attack' | 'defend' | 'buff' | 'debuff'
  value: number
  status?: string
  turns?: number
  icon: string
  label: string
}

export interface EnemyData {
  id: string
  name: string
  icon: string
  maxHp: number
  tier: 'normal' | 'elite' | 'boss'
  patterns: {
    phase1: Intent[]
    phase2: Intent[]
  }
}

export const ENEMIES: Record<string, EnemyData> = {
  // === 일반 적 ===
  copycat: {
    id: 'copycat',
    name: '카피캣 경쟁사',
    icon: 'enemy-copycat',
    maxHp: 40,
    tier: 'normal',
    patterns: {
      phase1: [
        { type: 'attack', value: 6, icon: '⚔️', label: '공격' },
        { type: 'defend', value: 5, icon: '🛡️', label: '모방' },
        { type: 'attack', value: 8, icon: '⚔️', label: '공격' },
      ],
      phase2: [
        { type: 'attack', value: 10, icon: '⚔️', label: '강공격' },
        { type: 'attack', value: 10, icon: '⚔️', label: '강공격' },
        { type: 'defend', value: 8, icon: '🛡️', label: '모방' },
      ],
    },
  },
  redtape: {
    id: 'redtape',
    name: '레드테이프 공무원',
    icon: 'enemy-redtape',
    maxHp: 50,
    tier: 'normal',
    patterns: {
      phase1: [
        { type: 'attack', value: 8, icon: '⚔️', label: '규제' },
        { type: 'debuff', value: 1, status: '약화', turns: 2, icon: '🔻', label: '지연' },
        { type: 'defend', value: 10, icon: '🛡️', label: '서류 산' },
      ],
      phase2: [
        { type: 'attack', value: 12, icon: '⚔️', label: '강규제' },
        { type: 'debuff', value: 2, status: '약화', turns: 2, icon: '🔻', label: '지연' },
      ],
    },
  },
  headhunter: {
    id: 'headhunter',
    name: '헤드헌터',
    icon: 'enemy-headhunter',
    maxHp: 45,
    tier: 'normal',
    patterns: {
      phase1: [
        { type: 'attack', value: 10, icon: '⚔️', label: '채용 제안' },
        { type: 'defend', value: 4, icon: '🛡️', label: '방어' },
        { type: 'attack', value: 7, icon: '⚔️', label: '공격' },
      ],
      phase2: [
        { type: 'attack', value: 14, icon: '⚔️', label: '강제 채용' },
        { type: 'attack', value: 14, icon: '⚔️', label: '강제 채용' },
      ],
    },
  },
  troll_investor: {
    id: 'troll_investor',
    name: '트롤 투자자',
    icon: 'enemy-troll',
    maxHp: 55,
    tier: 'normal',
    patterns: {
      phase1: [
        { type: 'attack', value: 9, icon: '⚔️', label: '공격' },
        { type: 'buff', value: 2, status: '근력', turns: 2, icon: '💪', label: '자만' },
        { type: 'attack', value: 7, icon: '⚔️', label: '공격' },
      ],
      phase2: [
        { type: 'attack', value: 13, icon: '⚔️', label: '격노' },
        { type: 'attack', value: 13, icon: '⚔️', label: '격노' },
      ],
    },
  },

  // === 엘리트 ===
  clone_startup: {
    id: 'clone_startup',
    name: '악성 클론 스타트업',
    icon: 'enemy-clone-startup',
    maxHp: 80,
    tier: 'elite',
    patterns: {
      phase1: [
        { type: 'attack', value: 12, icon: '⚔️', label: '카피 공격' },
        { type: 'buff', value: 3, status: '근력', turns: 2, icon: '💪', label: '자본 확보' },
        { type: 'defend', value: 8, icon: '🛡️', label: '특허 방어' },
        { type: 'attack', value: 15, icon: '⚔️', label: '대규모 공격' },
      ],
      phase2: [
        { type: 'attack', value: 18, icon: '⚔️', label: '총공세' },
        { type: 'buff', value: 4, status: '근력', turns: 2, icon: '💪', label: '추가 자금' },
        { type: 'attack', value: 18, icon: '⚔️', label: '총공세' },
      ],
    },
  },
  hacker: {
    id: 'hacker',
    name: '데이터 유출 해커',
    icon: 'enemy-hacker',
    maxHp: 70,
    tier: 'elite',
    patterns: {
      phase1: [
        { type: 'debuff', value: 2, status: '약화', turns: 2, icon: '🔻', label: '데이터 유출' },
        { type: 'attack', value: 14, icon: '⚔️', label: '해킹 공격' },
        { type: 'defend', value: 6, icon: '🛡️', label: '방어' },
        { type: 'attack', value: 14, icon: '⚔️', label: '랜섬웨어' },
      ],
      phase2: [
        { type: 'attack', value: 20, icon: '⚔️', label: '제로데이' },
        { type: 'debuff', value: 3, status: '약화', turns: 2, icon: '🔻', label: '시스템 마비' },
        { type: 'attack', value: 20, icon: '⚔️', label: '제로데이' },
      ],
    },
  },

  // === 보스 ===
  series_a: {
    id: 'series_a',
    name: '시리즈A 벤처캐피탈',
    icon: 'enemy-series-a',
    maxHp: 100,
    tier: 'boss',
    patterns: {
      phase1: [
        { type: 'attack', value: 12, icon: '⚔️', label: '공격' },
        { type: 'attack', value: 8, icon: '⚔️', label: '공격' },
        { type: 'defend', value: 6, icon: '🛡️', label: '방어' },
      ],
      phase2: [
        { type: 'attack', value: 18, icon: '⚔️', label: '강공격' },
        { type: 'buff', value: 3, status: '근력', turns: 2, icon: '💪', label: '강화' },
        { type: 'attack', value: 15, icon: '⚔️', label: '공격' },
      ],
    },
  },
  monopoly: {
    id: 'monopoly',
    name: '독점 대기업',
    icon: 'enemy-monopoly',
    maxHp: 130,
    tier: 'boss',
    patterns: {
      phase1: [
        { type: 'attack', value: 15, icon: '⚔️', label: '시장 장악' },
        { type: 'defend', value: 10, icon: '🛡️', label: '로비' },
        { type: 'attack', value: 12, icon: '⚔️', label: '인수 공격' },
        { type: 'buff', value: 2, status: '근력', turns: 2, icon: '💪', label: '자본 확충' },
      ],
      phase2: [
        { type: 'attack', value: 22, icon: '⚔️', label: '독점 폭격' },
        { type: 'defend', value: 15, icon: '🛡️', label: '법적 방어' },
        { type: 'attack', value: 22, icon: '⚔️', label: '독점 폭격' },
        { type: 'buff', value: 4, status: '근력', turns: 3, icon: '💪', label: '시장 지배' },
      ],
    },
  },
  unicorn_slayer: {
    id: 'unicorn_slayer',
    name: '유니콘 슬레이어',
    icon: 'boss-unicorn-slayer',
    maxHp: 160,
    tier: 'boss',
    patterns: {
      phase1: [
        { type: 'attack', value: 18, icon: '⚔️', label: '사냥 개시' },
        { type: 'debuff', value: 2, status: '약화', turns: 2, icon: '🔻', label: '공포' },
        { type: 'attack', value: 15, icon: '⚔️', label: '추적' },
        { type: 'defend', value: 12, icon: '🛡️', label: '그림자 방어' },
        { type: 'attack', value: 20, icon: '⚔️', label: '강타' },
      ],
      phase2: [
        { type: 'attack', value: 28, icon: '⚔️', label: '최종 사냥' },
        { type: 'buff', value: 5, status: '근력', turns: 3, icon: '💪', label: '진면목' },
        { type: 'attack', value: 25, icon: '⚔️', label: '유니콘 처단' },
        { type: 'debuff', value: 3, status: '약화', turns: 3, icon: '🔻', label: '절망' },
        { type: 'attack', value: 28, icon: '⚔️', label: '최종 사냥' },
      ],
    },
  },
}

// Act별 적 풀 — Act가 진행될수록 강한 적 등장
export const ENEMY_POOLS: Record<number, { normal: string[]; elite: string[] }> = {
  1: {
    normal: ['copycat', 'redtape', 'headhunter'],
    elite: ['clone_startup'],
  },
  2: {
    normal: ['copycat', 'redtape', 'headhunter', 'troll_investor'],
    elite: ['clone_startup', 'hacker'],
  },
  3: {
    normal: ['troll_investor', 'headhunter', 'redtape'],
    elite: ['hacker'],
  },
}
