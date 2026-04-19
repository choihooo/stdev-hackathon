import { useEffect, useState, useRef } from 'react'
import { useGameStore } from './stores/gameStore'
import { useCombatStore } from './stores/combatStore'
import { useDeckStore } from './stores/deckStore'
import { deleteSave } from './stores/saveStore'
import { FOUNDERS } from './data/founders'
import MainMenu from './components/MainMenu'
import BattleScreen from './components/BattleScreen'
import RewardScreen from './components/RewardScreen'
import StageMap from './components/StageMap'
import ShopScreen from './components/ShopScreen'
import EventScreen from './components/EventScreen'
import RestScreen from './components/RestScreen'
import ResultScreen from './components/ResultScreen'
import './App.css'

function ScreenTransition({ screen, children }: { screen: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayText, setOverlayText] = useState('')
  const prevScreen = useRef(screen)

  useEffect(() => {
    if (prevScreen.current !== screen) {
      // 전환 오버레이 텍스트 결정
      let text = ''
      if (screen === 'battle') text = '⚔️'
      else if (screen === 'map') text = ''
      else if (screen === 'result') text = ''

      if (text) {
        setOverlayText(text)
        setShowOverlay(true)
      }

      setVisible(false)
      const timer = setTimeout(() => {
        if (text) {
          setTimeout(() => setShowOverlay(false), 400)
        }
        setVisible(true)
        prevScreen.current = screen
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setVisible(true)
    }
  }, [screen])

  return (
    <>
      {showOverlay && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeOut 0.4s ease-out 0.2s forwards',
        }}>
          <div style={{ fontSize: '48px', fontWeight: 900, color: '#e8e8f0' }}>
            {overlayText}
          </div>
        </div>
      )}
      <div
        className="screen-transition"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 300ms ease-out, transform 300ms ease-out',
        }}
      >
        {children}
      </div>
    </>
  )
}

function GameRouter() {
  const game = useGameStore()
  const combat = useCombatStore()

  useEffect(() => {
    if (combat.phase === 'victory') {
      const timer = setTimeout(() => game.goToReward(), 1500)
      return () => clearTimeout(timer)
    }
    if (combat.phase === 'defeat') {
      deleteSave() // 패배 시 세이브 삭제
      const timer = setTimeout(() => game.goToResult(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [combat.phase])

  const renderScreen = () => {
    switch (game.screen) {
      case 'menu':
        return <MainMenu onStart={(data) => {
          game.setFounder(data.founder)
          game.setDifficulty(data.difficulty as 'easy' | 'normal' | 'hard')
          // 창업자 시작 덱 미리 세팅 (맵 화면에서 덱 장수 표시용)
          const founder = FOUNDERS[data.founder]
          if (founder) {
            useDeckStore.setState({
              drawPile: [...founder.startDeck].sort(() => Math.random() - 0.5),
              hand: [],
              discardPile: [],
            })
          }
          game.goToMap()
        }} />
      case 'map':
        return <StageMap />
      case 'battle':
        return <BattleScreen />
      case 'reward':
        return <RewardScreen />
      case 'shop':
        return <ShopScreen />
      case 'event':
        return <EventScreen />
      case 'rest':
        return <RestScreen />
      case 'result':
        return <ResultScreen />
      default:
        return <MainMenu onStart={() => game.goToMap()} />
    }
  }

  return (
    <ScreenTransition screen={game.screen}>
      {renderScreen()}
    </ScreenTransition>
  )
}

function App() {
  return <GameRouter />
}

export default App
