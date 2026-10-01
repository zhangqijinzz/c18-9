import { useState } from 'react'
import { SCALE_LIMITS, type ScaleField } from '../domain/brandRules'
import type { BrandMirrorSnapshot, BrandTheme } from '../models/brandMirrorModels'

interface TokenControlsProps {
  snapshot: BrandMirrorSnapshot
  onThemeChange: (theme: BrandTheme) => void
  onColorChange: (field: 'primary' | 'secondary', value: string) => void
  onScaleChange: (field: ScaleField, index: number, raw: string) => void
  onReset: () => void
}

const themes: { id: BrandTheme; label: string; note: string }[] = [
  { id: 'studio', label: 'Studio warm', note: '热烈 · 友好' },
  { id: 'editorial', label: 'Editorial green', note: '克制 · 自然' },
  { id: 'night', label: 'Night signal', note: '锐利 · 数字' },
]

export function TokenControls({ snapshot, onThemeChange, onColorChange, onScaleChange, onReset }: TokenControlsProps) {
  return (
    <aside className="control-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">01 / TOKENS</span>
          <h2>视觉令牌</h2>
        </div>
        <button className="text-button" type="button" onClick={onReset}>恢复默认</button>
      </div>

      <section className="control-section">
        <div className="section-label"><span>基础主题</span><span className="muted">快速起点</span></div>
        <div className="theme-list">
          {themes.map((theme) => (
            <button className={`theme-option ${snapshot.theme === theme.id ? 'selected' : ''}`} key={theme.id} onClick={() => onThemeChange(theme.id)} type="button">
              <span className={`theme-dot ${theme.id}`} />
              <span><strong>{theme.label}</strong><small>{theme.note}</small></span>
              {snapshot.theme === theme.id && <span className="check-mark">✓</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="control-section">
        <div className="section-label"><span>品牌色</span><span className="muted">HEX / 6 位</span></div>
        <div className="color-fields">
          <ColorField label="主色" value={snapshot.tokens.primary} onChange={(value) => onColorChange('primary', value)} />
          <ColorField label="辅助色" value={snapshot.tokens.secondary} onChange={(value) => onColorChange('secondary', value)} />
        </div>
        <div className={`contrast-note ${snapshot.contrastWarning ? 'warning' : ''}`}>
          <span className="contrast-icon">◐</span>
          <span>对比度 <strong>{snapshot.contrastRatio.toFixed(1)}:1</strong> · {snapshot.contrastWarning ? '建议提高对比度' : '适合界面使用'}</span>
        </div>
      </section>

      <ScaleControl field="radiusScale" values={snapshot.tokens.radiusScale} onCommit={onScaleChange} />
      <ScaleControl field="spacingScale" values={snapshot.tokens.spacingScale} onCommit={onScaleChange} />
      <ScaleControl field="typeScale" values={snapshot.tokens.typeScale} onCommit={onScaleChange} />

      <div className="panel-footer"><span className="live-dot" />所有调整实时同步到预览</div>
    </aside>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="color-field"><span>{label}</span><div className="color-input"><input aria-label={label} type="color" value={value} onChange={(event) => onChange(event.target.value)} /><input aria-label={`${label} HEX`} value={value} onChange={(event) => onChange(event.target.value)} /></div></label>
}

function ScaleControl({ field, values, onCommit }: { field: ScaleField; values: number[]; onCommit: (field: ScaleField, index: number, raw: string) => void }) {
  const limits = SCALE_LIMITS[field]
  return (
    <section className="control-section scale-section">
      <div className="section-label"><span>{limits.label}</span><span className="muted">{limits.min}–{limits.max} px</span></div>
      <div className="scale-inputs">
        {values.map((value, index) => (
          <label key={`${field}-${index}`}>
            <span>{index + 1}</span>
            <ScaleInput ariaLabel={`${limits.label}${index + 1}`} value={value} onCommit={(raw) => onCommit(field, index, raw)} />
          </label>
        ))}
      </div>
    </section>
  )
}

function ScaleInput({ value, ariaLabel, onCommit }: { value: number; ariaLabel: string; onCommit: (raw: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    if (draft === null) return
    onCommit(draft)
    setDraft(null)
  }

  return (
    <input
      aria-label={ariaLabel}
      type="text"
      inputMode="decimal"
      value={draft ?? String(value)}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          commit()
          event.currentTarget.blur()
        }
        if (event.key === 'Escape') setDraft(null)
      }}
    />
  )
}
