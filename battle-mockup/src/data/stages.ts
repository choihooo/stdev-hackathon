export type NodeType = 'battle' | 'elite' | 'shop' | 'event' | 'rest' | 'boss'

export interface MapNode {
  id: string
  type: NodeType
  row: number
  col: number
  label: string
  enemyId?: string
  eventId?: string
  connections: string[]
}

export interface StageMap {
  act: number
  name: string
  nodes: MapNode[]
}

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateMap(act: number): StageMap {
  switch (act) {
    case 1: return generateAct1()
    case 2: return generateAct2()
    case 3: return generateAct3()
    default: return generateAct1()
  }
}

function generateAct1(): StageMap {
  return {
    act: 1, name: 'Act 1 · Seed',
    nodes: [
      { id: 'start', type: 'battle', row: 0, col: 2, label: '시작', connections: ['n1', 'n2'] },
      { id: 'n1', type: 'battle', row: 1, col: 1, label: '전투', connections: ['n3', 'n4'] },
      { id: 'n2', type: 'event', row: 1, col: 3, label: '이벤트', connections: ['n4', 'n5'] },
      { id: 'n3', type: 'shop', row: 2, col: 0, label: '상점', connections: ['n6', 'n7'] },
      { id: 'n4', type: 'battle', row: 2, col: 2, label: '전투', connections: ['n7', 'n8'] },
      { id: 'n5', type: 'rest', row: 2, col: 4, label: '휴식', connections: ['n8'] },
      { id: 'n6', type: 'battle', row: 3, col: 1, label: '전투', connections: ['boss'] },
      { id: 'n7', type: 'event', row: 3, col: 2, label: '이벤트', connections: ['boss'] },
      { id: 'n8', type: 'battle', row: 3, col: 3, label: '전투', connections: ['boss'] },
      { id: 'boss', type: 'boss', row: 4, col: 2, label: '보스', enemyId: 'series_a', connections: [] },
    ],
  }
}

function generateAct2(): StageMap {
  return {
    act: 2, name: 'Act 2 · Series B',
    nodes: [
      { id: 'start', type: 'battle', row: 0, col: 2, label: '시작', connections: ['n1', 'n2'] },
      { id: 'n1', type: 'battle', row: 1, col: 0, label: '전투', connections: ['n3', 'n4'] },
      { id: 'n2', type: 'elite', row: 1, col: 3, label: '엘리트', connections: ['n4', 'n5'] },
      { id: 'n3', type: 'event', row: 2, col: 1, label: '이벤트', connections: ['n6', 'n7'] },
      { id: 'n4', type: 'battle', row: 2, col: 2, label: '전투', connections: ['n7'] },
      { id: 'n5', type: 'shop', row: 2, col: 4, label: '상점', connections: ['n7', 'n8'] },
      { id: 'n6', type: 'rest', row: 3, col: 0, label: '휴식', connections: ['boss'] },
      { id: 'n7', type: 'elite', row: 3, col: 2, label: '엘리트', connections: ['boss'] },
      { id: 'n8', type: 'battle', row: 3, col: 4, label: '전투', connections: ['boss'] },
      { id: 'boss', type: 'boss', row: 4, col: 2, label: '보스', enemyId: 'monopoly', connections: [] },
    ],
  }
}

function generateAct3(): StageMap {
  return {
    act: 3, name: 'Act 3 · IPO',
    nodes: [
      { id: 'start', type: 'elite', row: 0, col: 2, label: '엘리트', connections: ['n1', 'n2'] },
      { id: 'n1', type: 'battle', row: 1, col: 1, label: '전투', connections: ['n3', 'n4'] },
      { id: 'n2', type: 'battle', row: 1, col: 3, label: '전투', connections: ['n4', 'n5'] },
      { id: 'n3', type: 'shop', row: 2, col: 0, label: '상점', connections: ['n6'] },
      { id: 'n4', type: 'elite', row: 2, col: 2, label: '엘리트', connections: ['n6', 'n7'] },
      { id: 'n5', type: 'rest', row: 2, col: 4, label: '휴식', connections: ['n7'] },
      { id: 'n6', type: 'event', row: 3, col: 1, label: '이벤트', connections: ['boss'] },
      { id: 'n7', type: 'battle', row: 3, col: 3, label: '전투', connections: ['boss'] },
      { id: 'boss', type: 'boss', row: 4, col: 2, label: '최종 보스', enemyId: 'unicorn_slayer', connections: [] },
    ],
  }
}

// 노드에 랜덤 적 ID 할당 (전투/엘리트 노드)
export function assignRandomEnemies(map: StageMap, enemyPools: Record<number, { normal: string[]; elite: string[] }>): StageMap {
  const pool = enemyPools[map.act] || enemyPools[1]
  return {
    ...map,
    nodes: map.nodes.map((node) => {
      if (node.enemyId) return node // 보스는 이미 지정됨
      if (node.type === 'battle') return { ...node, enemyId: pick(pool.normal) }
      if (node.type === 'elite') return { ...node, enemyId: pick(pool.elite) }
      return node
    }),
  }
}
