import { useState } from 'react'
import '../MainMenu.css'
import logoUnicorn from '../assets/logo-unicorn.png'
import founderTech from '../assets/founder-tech.png'
import founderOps from '../assets/founder-ops.png'
import founderMarketing from '../assets/founder-marketing.png'
import { hasSave, loadGame, deleteSave } from '../stores/saveStore'
import { FOUNDERS } from '../data/founders'

const founders = [
  { id: 'tech', name: '기술', desc: '코드로 세상을 바꾸는 엔지니어', icon: founderTech, tag: '추천' },
  { id: 'ops', name: '운영', desc: '조직을 움직이는 리더', icon: founderOps, tag: '' },
  { id: 'marketing', name: '마케팅', desc: '시장을 사로잡는 스토리텔러', icon: founderMarketing, tag: '' },
]

const difficulties = [
  { id: 'easy', label: '이지', desc: 'HP +30%, 적 일반' },
  { id: 'normal', label: '노말', desc: '기본 밸런스' },
  { id: 'hard', label: '하드', desc: '적 HP +25%, Burn+1, Focus-1' },
]

export default function MainMenu({ onStart }: { onStart: (data: { founder: string; difficulty: string }) => void }) {
  const [selectedFounder, setSelectedFounder] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState('normal')
  const [showContinue, setShowContinue] = useState(false)
  const canContinue = hasSave()

  const handleContinue = () => {
    const success = loadGame()
    if (!success) {
      deleteSave()
      setShowContinue(true)
    }
  }

  const founderData = selectedFounder ? FOUNDERS[selectedFounder] : null

  return (
    <div className="menu-screen">
      <div className="menu-bg-overlay" />

      <div className="menu-content">
        <div className="menu-logo">
          <div className="logo-icon"><img src={logoUnicorn} alt="Unicorn Slayer" className="logo-img" /></div>
          <h1 className="logo-title">UNICORN SLAYER</h1>
          <p className="logo-subtitle">유니콘 슬레이어</p>
        </div>

        <div className="menu-actions">
          <button
            className="menu-btn menu-btn-primary"
            onClick={() => {
              if (selectedFounder) onStart({ founder: selectedFounder, difficulty: selectedDifficulty })
            }}
            disabled={!selectedFounder}
          >
            새 기업 만들기
          </button>
          <button
            className="menu-btn menu-btn-secondary"
            onClick={() => handleContinue()}
            style={{ opacity: canContinue ? 1 : 0.5 }}
          >
            이어하기{!canContinue ? ' (없음)' : ''}
          </button>
        </div>

        <div className="menu-section">
          <div className="section-divider">
            <span className="section-label">창업자 선택</span>
          </div>
          <div className="founder-cards">
            {founders.map((f) => {
              const data = FOUNDERS[f.id]
              return (
                <button
                  key={f.id}
                  className={`founder-card ${selectedFounder === f.id ? 'founder-selected' : ''}`}
                  onClick={() => setSelectedFounder(f.id)}
                >
                  {f.tag && <span className="founder-tag">{f.tag}</span>}
                  <span className="founder-icon"><img src={f.icon} alt={f.name} className="founder-icon-img" /></span>
                  <span className="founder-name">{f.name}</span>
                  <span className="founder-desc">{f.desc}</span>
                  {selectedFounder === f.id && data && (
                    <div className="founder-stats">
                      <span>HP {data.hp}</span>
                      <span>Focus {data.maxFocus}</span>
                      <span>Funds {data.startFunds}</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          {founderData && (
            <div className="founder-passive">특성: {founderData.passive}</div>
          )}
        </div>

        <div className="menu-section">
          <div className="section-divider">
            <span className="section-label">난이도</span>
          </div>
          <div className="difficulty-group">
            {difficulties.map((d) => (
              <button
                key={d.id}
                className={`diff-btn ${selectedDifficulty === d.id ? 'diff-active' : ''}`}
                onClick={() => setSelectedDifficulty(d.id)}
              >
                <span style={{ fontWeight: 700 }}>{d.label}</span>
                <span style={{ fontSize: '10px', color: '#888', display: 'block', marginTop: '2px' }}>{d.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showContinue && (
        <div className="modal-overlay" onClick={() => setShowContinue(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">이어하기</div>
            <div className="modal-empty">{canContinue ? '불러오는 중...' : '저장된 기록이 없습니다'}</div>
            <button className="modal-close" onClick={() => setShowContinue(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  )
}
