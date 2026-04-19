import { useGameStore } from './gameStore'
import { usePlayerStore } from './playerStore'
import { useDeckStore } from './deckStore'
import { useRelicStore } from './relicStore'
import { CARDS } from '../data/cards'
import type { RelicData } from '../data/relics'
import { generateMap, assignRandomEnemies } from '../data/stages'
import { ENEMY_POOLS } from '../data/enemies'

const SAVE_KEY = 'unicorn_slayer_save'

interface SaveData {
  game: {
    act: number
    currentNodeId: string
    visitedNodes: string[]
    founderId: string | null
    difficulty: 'easy' | 'normal' | 'hard'
    tutorialDone: boolean
  }
  player: {
    hp: number
    maxHp: number
    funds: number
    burnRate: number
    maxFocus: number
    focus: number
    shield: number
    statuses: { name: string; icon: string; type: 'buff' | 'debuff'; value: number; turns: number }[]
  }
  deck: {
    drawPile: string[]
    hand: string[]
    discardPile: string[]
  }
  relics: RelicData[]
}

export function saveGame(): void {
  const game = useGameStore.getState()
  const player = usePlayerStore.getState()
  const deck = useDeckStore.getState()
  const relics = useRelicStore.getState()

  const data: SaveData = {
    game: {
      act: game.act,
      currentNodeId: game.currentNodeId,
      visitedNodes: game.visitedNodes,
      founderId: game.founderId,
      difficulty: game.difficulty,
      tutorialDone: game.tutorialDone,
    },
    player: {
      hp: player.hp,
      maxHp: player.maxHp,
      funds: player.funds,
      burnRate: player.burnRate,
      maxFocus: player.maxFocus,
      focus: player.focus,
      shield: player.shield,
      statuses: player.statuses,
    },
    deck: {
      drawPile: deck.drawPile,
      hand: deck.hand,
      discardPile: deck.discardPile,
    },
    relics: relics.relics,
  }

  localStorage.setItem(SAVE_KEY, JSON.stringify(data))
}

export function loadGame(): boolean {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return false

  try {
    const data: SaveData = JSON.parse(raw)
    const stageMap = assignRandomEnemies(generateMap(data.game.act), ENEMY_POOLS)

    // 세이브 데이터 검증
    const validCards = (arr: string[]) => arr.filter((id) => CARDS[id])
    const safeClamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val))

    useGameStore.setState({
      act: safeClamp(data.game.act, 1, 3),
      stageMap,
      currentNodeId: data.game.currentNodeId || 'start',
      visitedNodes: data.game.visitedNodes || [],
      founderId: data.game.founderId,
      difficulty: ['easy', 'normal', 'hard'].includes(data.game.difficulty) ? data.game.difficulty : 'normal',
      tutorialDone: !!data.game.tutorialDone,
      screen: 'map',
    })

    const maxHp = Math.max(1, data.player.maxHp || 100)
    usePlayerStore.setState({
      hp: safeClamp(data.player.hp, 0, maxHp),
      maxHp,
      funds: Math.max(0, data.player.funds || 0),
      burnRate: Math.max(0, data.player.burnRate || 1),
      maxFocus: Math.max(1, data.player.maxFocus || 3),
      focus: safeClamp(data.player.focus, 0, data.player.maxFocus || 3),
      shield: Math.max(0, data.player.shield || 0),
      statuses: (data.player.statuses || []).filter((s) => s && s.name),
    })

    useDeckStore.setState({
      drawPile: validCards(data.deck.drawPile || []),
      hand: validCards(data.deck.hand || []),
      discardPile: validCards(data.deck.discardPile || []),
    })

    useRelicStore.setState({ relics: data.relics })

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
