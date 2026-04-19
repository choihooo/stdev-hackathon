import { useGameStore } from './gameStore'
import { usePlayerStore } from './playerStore'
import { useDeckStore } from './deckStore'

const SAVE_KEY = 'unicorn_slayer_save'

interface SaveData {
  game: {
    act: number
    currentNodeId: string
    visitedNodes: string[]
  }
  player: {
    hp: number
    maxHp: number
    funds: number
    burnRate: number
    maxFocus: number
    shield: number
    statuses: { name: string; icon: string; type: 'buff' | 'debuff'; value: number; turns: number }[]
  }
  deck: {
    drawPile: string[]
    hand: string[]
    discardPile: string[]
  }
}

export function saveGame(): void {
  const game = useGameStore.getState()
  const player = usePlayerStore.getState()
  const deck = useDeckStore.getState()

  const data: SaveData = {
    game: {
      act: game.act,
      currentNodeId: game.currentNodeId,
      visitedNodes: game.visitedNodes,
    },
    player: {
      hp: player.hp,
      maxHp: player.maxHp,
      funds: player.funds,
      burnRate: player.burnRate,
      maxFocus: player.maxFocus,
      shield: player.shield,
      statuses: player.statuses,
    },
    deck: {
      drawPile: deck.drawPile,
      hand: deck.hand,
      discardPile: deck.discardPile,
    },
  }

  localStorage.setItem(SAVE_KEY, JSON.stringify(data))
}

export function loadGame(): boolean {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return false

  try {
    const data: SaveData = JSON.parse(raw)

    // 게임 상태 복원
    const { generateMap, assignRandomEnemies } = require('../data/stages')
    const { ENEMY_POOLS } = require('../data/enemies')
    const stageMap = assignRandomEnemies(generateMap(data.game.act), ENEMY_POOLS)

    useGameStore.setState({
      act: data.game.act,
      stageMap,
      currentNodeId: data.game.currentNodeId,
      visitedNodes: data.game.visitedNodes,
      screen: 'map',
    })

    usePlayerStore.setState({
      hp: data.player.hp,
      maxHp: data.player.maxHp,
      funds: data.player.funds,
      burnRate: data.player.burnRate,
      maxFocus: data.player.maxFocus,
      shield: data.player.shield,
      statuses: data.player.statuses,
      focus: data.player.maxFocus,
    })

    useDeckStore.setState({
      drawPile: data.deck.drawPile,
      hand: data.deck.hand,
      discardPile: data.deck.discardPile,
    })

    return true
  } catch {
    return false
  }
}

export function hasSave(): boolean {
  return !!localStorage.getItem(SAVE_KEY)
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY)
}
