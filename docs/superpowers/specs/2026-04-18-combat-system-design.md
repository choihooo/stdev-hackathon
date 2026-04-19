# Combat System Design — Zustand 4-Store Architecture

## Overview

전투 시스템을 Zustand 4개 스토어로 구현. 상태관리, 카드 시스템, 전투 로직을 포함.

## Store Structure

```
src/stores/
  playerStore.ts   — 플레이어 상태
  enemyStore.ts    — 적 상태
  deckStore.ts     — 덱/핸드 관리
  combatStore.ts   — 전투 흐름 제어
src/data/
  cards.ts         — 카드 데이터
  enemies.ts       — 적 데이터
```

## Data Types

```ts
// Card
interface Card {
  id: string
  name: string
  cost: number
  type: 'attack' | 'heal' | 'utility' | 'passive' | 'risk'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  icon: string
  effects: Effect[]
  upgraded?: boolean
}

interface Effect {
  type: 'damage' | 'block' | 'heal' | 'buff' | 'debuff' | 'draw' | 'burn_self'
  value: number
  target: 'enemy' | 'self'
  status?: string
  turns?: number
}

// Enemy
interface Enemy {
  id: string
  name: string
  icon: string
  maxHp: number
  hp: number
  phase: 1 | 2
  buffs: StatusEffect[]
  intent: Intent
  patternIndex: number
  patterns: { phase1: Intent[]; phase2: Intent[] }
}

interface Intent {
  type: 'attack' | 'defend' | 'buff' | 'debuff'
  value: number
  status?: string
  turns?: number
}

interface StatusEffect {
  name: string
  icon: string
  type: 'buff' | 'debuff'
  value: number
  turns: number
}

// Combat
type CombatPhase = 'player_turn' | 'enemy_turn' | 'turn_transition' | 'victory' | 'defeat'
```

## Stores

### playerStore
- hp, maxHp (기본 100)
- funds (기본 75)
- focus, maxFocus (기본 3)
- burnRate (기본 1)
- shield (턴 시작 시 0으로 리셋)
- statuses: StatusEffect[]

### enemyStore
- current: Enemy | null
- setEnemy(id): 적 데이터 로드
- takeDamage(n): HP 차감, Phase 전환 체크
- addBuff / removeBuff

### deckStore
- drawPile: Card[]
- hand: Card[]
- discardPile: Card[]
- draw(n): 드로우 (drawPile 비면 discardPile 셔플 후 보충)
- discard(index): 핸드 → 버림판
- useCard(index): 핸드에서 제거 (버림판으로)
- shuffle(): Fisher-Yates

### combatStore
- turn: number
- phase: CombatPhase
- log: LogEntry[]
- startBattle(enemyId): 초기화 + 첫 드로우(5장)
- playCard(handIndex): Focus 체크 → 효과 적용 → 카드 사용
- endTurn(): 핸드 버림 → 적 턴 → 버프정산 → 턴전환 → 드로우(2장)
- checkGameEnd(): HP <= 0 체크

## Turn Flow

```
startBattle(enemyId)
  → 적 로드, 턴=1, phase=player_turn
  → 드로우 5장
  → 적 첫 의도 설정

playCard(handIndex)
  → Focus 충분한지 확인
  → Focus 차감
  → effects 실행 (데미지/힐/방어/버프/디버프/드로우)
  → 카드 핸드에서 제거 → 버림판
  → 적 HP 0 체크 → victory
  → 로그 추가

endTurn()
  → phase=turn_transition
  → 핸드 전체 → 버림판
  → 플레이어 버프/디버프 턴 차감, 만료 제거
  → Burn Rate 데미지 적용
  → phase=enemy_turn
  → 적 의도 실행 (공격/방어/버프)
  → 적 버프/디버프 턴 차감
  → 플레이어 HP 0 체크 → defeat
  → 적 다음 의도 설정
  → turn++, Focus 리필
  → 드로우 2장
  → phase=player_turn
```

## Card Data (MVP 5장)

| 이름 | cost | type | effects |
|------|------|------|---------|
| 스케일업 | 2 | attack | damage 15 |
| 펀딩 라운드 | 1 | attack | damage 8 |
| 런웨이 연장 | 1 | heal | heal 8 |
| IP 보호 | 1 | utility | block 6 |
| 전면 피벗 | 0 | risk | damage 25, burn_self 10 |

## Enemy Data (MVP)

| 이름 | HP | 패턴 |
|------|-----|------|
| 시리즈A 벤처캐피탈 | 100 | phase1: 공격12, 공격8, 방어6 / phase2: 공격18, 버프(근력), 공격15 |
