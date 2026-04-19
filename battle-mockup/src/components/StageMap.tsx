import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { useDeckStore } from '../stores/deckStore'
import type { NodeType } from '../data/stages'
import '../StageMap.css'

const NODE_COLORS: Record<NodeType, string> = {
  battle: '#c4454a',
  elite: '#c4454a',
  shop: '#4a9ead',
  event: '#c48a3f',
  rest: '#3d9e6e',
  boss: '#c9a84c',
}

const NODE_ICONS: Record<NodeType, string> = {
  battle: '⚔️',
  elite: '💀',
  shop: '🏪',
  event: '❓',
  rest: '💤',
  boss: '👑',
}

export default function StageMap() {
  const game = useGameStore()
  const player = usePlayerStore()
  const deck = useDeckStore()
  const { stageMap, currentNodeId, visitedNodes } = game
  const available = game.getAvailableNodes()

  const handleNodeClick = (nodeId: string, type: NodeType) => {
    if (!available.some((n) => n.id === nodeId)) return
    game.selectNextNode(nodeId)

    switch (type) {
      case 'battle':
      case 'elite':
      case 'boss':
        game.goToBattle(nodeId)
        break
      case 'shop':
        game.goToShop()
        break
      case 'event':
        game.goToEvent('')
        break
      case 'rest':
        game.goToRest()
        break
    }
  }

  // 행별로 그룹화 (역순 — 위가 보스)
  const rows = stageMap.nodes.reduce<Record<number, typeof stageMap.nodes>>((acc, node) => {
    if (!acc[node.row]) acc[node.row] = []
    acc[node.row].push(node)
    return acc
  }, {})

  const maxRow = Math.max(...Object.keys(rows).map(Number))

  return (
    <div className="stage-map-screen">
      <div className="stage-map-header">
        <span className="stage-map-title">{stageMap.name}</span>
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span>💚 {player.hp}/{player.maxHp}</span>
          <span>💰 {player.funds}</span>
          <span>🃏 {deck.drawPile.length + deck.hand.length + deck.discardPile.length}장</span>
        </div>
      </div>

      <div className="stage-map-canvas">
        {Array.from({ length: maxRow + 1 }, (_, i) => maxRow - i).map((row) => {
          const nodes = rows[row] || []
          return (
            <div key={row} className="map-row">
              {nodes.map((node) => {
                const isCurrent = node.id === currentNodeId
                const isVisited = visitedNodes.includes(node.id)
                const isAvailable = available.some((n) => n.id === node.id)
                const color = NODE_COLORS[node.type]
                return (
                  <button
                    key={node.id}
                    className={`map-node ${isCurrent ? 'node-current' : ''} ${isVisited ? 'node-visited' : ''} ${isAvailable ? 'node-available' : 'node-locked'}`}
                    style={{ '--node-color': color } as React.CSSProperties}
                    onClick={() => handleNodeClick(node.id, node.type)}
                    disabled={!isAvailable && !isCurrent}
                  >
                    <span className="node-icon">{NODE_ICONS[node.type]}</span>
                    <span className="node-label">{node.label}</span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
