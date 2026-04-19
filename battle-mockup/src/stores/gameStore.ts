import { create } from 'zustand'
import { generateMap, assignRandomEnemies } from '../data/stages'
import { ENEMY_POOLS } from '../data/enemies'
import type { MapNode, StageMap } from '../data/stages'

export type Screen = 'menu' | 'map' | 'battle' | 'reward' | 'shop' | 'event' | 'rest' | 'result'

interface GameState {
  screen: Screen
  act: number
  stageMap: StageMap
  currentNodeId: string
  visitedNodes: string[]
  isVictory: boolean
  founderId: string | null
  difficulty: 'easy' | 'normal' | 'hard'
  tutorialDone: boolean

  setFounder: (id: string) => void
  setDifficulty: (d: 'easy' | 'normal' | 'hard') => void
  completeTutorial: () => void
  goToMap: () => void
  goToBattle: (nodeId: string) => void
  goToReward: () => void
  goToShop: () => void
  goToEvent: (eventId: string) => void
  goToRest: () => void
  goToResult: (victory: boolean) => void
  selectNextNode: (nodeId: string) => void
  getCurrentNode: () => MapNode | undefined
  getAvailableNodes: () => MapNode[]
  nextAct: () => void
  reset: () => void
}

function createMap(act: number): StageMap {
  return assignRandomEnemies(generateMap(act), ENEMY_POOLS)
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'menu',
  act: 1,
  stageMap: createMap(1),
  currentNodeId: 'start',
  visitedNodes: [],
  isVictory: false,
  founderId: null,
  difficulty: 'normal',
  tutorialDone: false,

  setFounder: (id) => set({ founderId: id }),

  setDifficulty: (d) => set({ difficulty: d }),

  completeTutorial: () => set({ tutorialDone: true }),

  goToMap: () => set({ screen: 'map' }),

  goToBattle: (nodeId) => {
    set({ currentNodeId: nodeId, screen: 'battle' })
  },

  goToReward: () => set({ screen: 'reward' }),

  goToShop: () => set({ screen: 'shop' }),

  goToEvent: (_eventId) => set({ screen: 'event' }),

  goToRest: () => set({ screen: 'rest' }),

  goToResult: (victory) => set({ screen: 'result', isVictory: victory }),

  selectNextNode: (nodeId) => {
    const { visitedNodes } = get()
    set({ currentNodeId: nodeId, visitedNodes: [...visitedNodes, nodeId] })
  },

  getCurrentNode: () => {
    const { stageMap, currentNodeId } = get()
    return stageMap.nodes.find((n) => n.id === currentNodeId)
  },

  getAvailableNodes: () => {
    const { stageMap, currentNodeId, visitedNodes } = get()
    const current = stageMap.nodes.find((n) => n.id === currentNodeId)
    if (!current) return []
    return stageMap.nodes.filter(
      (n) => current.connections.includes(n.id) && !visitedNodes.includes(n.id)
    )
  },

  nextAct: () => {
    const { act } = get()
    const nextActNum = act + 1
    if (nextActNum > 3) {
      // 전체 클리어
      set({ screen: 'result', isVictory: true })
      return
    }
    set({
      act: nextActNum,
      stageMap: createMap(nextActNum),
      currentNodeId: 'start',
      visitedNodes: [],
      screen: 'map',
    })
  },

  reset: () => set({
    screen: 'menu',
    act: 1,
    stageMap: createMap(1),
    currentNodeId: 'start',
    visitedNodes: [],
    isVictory: false,
    founderId: null,
    difficulty: 'normal' as const,
    tutorialDone: true, // 리셋 시 튜토리얼 완료 상태 유지 (다시 안 뜨게)
  }),
}))
