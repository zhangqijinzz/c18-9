import type { BrandTheme, BrandTokens } from '../models/brandMirrorModels'
import { INITIAL_TOKENS, THEME_PRESETS } from '../models/brandMirrorModels'

const HEX_COLOR = /^#[0-9A-F]{6}$/i
const NUMERIC_TEXT = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/

export type ScaleField = 'radiusScale' | 'spacingScale' | 'typeScale'

export const SCALE_LIMITS: Record<ScaleField, { label: string; min: number; max: number }> = {
  radiusScale: { label: '圆角尺度', min: 0, max: 40 },
  spacingScale: { label: '间距体系', min: 2, max: 64 },
  typeScale: { label: '字体比例', min: 10, max: 72 },
}

export type ScaleParseResult = { ok: true; value: number; clamped: boolean } | { ok: false }

export function parseScaleValue(field: ScaleField, raw: string): ScaleParseResult {
  const text = raw.trim()
  if (!NUMERIC_TEXT.test(text)) return { ok: false }
  const parsed = Math.round(Number(text))
  const { min, max } = SCALE_LIMITS[field]
  const value = Math.min(max, Math.max(min, parsed))
  return { ok: true, value, clamped: value !== parsed }
}

export function cloneTokens(tokens: BrandTokens): BrandTokens {
  return { ...tokens, radiusScale: [...tokens.radiusScale], spacingScale: [...tokens.spacingScale], typeScale: [...tokens.typeScale] }
}

export function isHexColor(value: string): boolean {
  return HEX_COLOR.test(value)
}

export function normalizeColor(value: string): string {
  const candidate = value.trim().toUpperCase()
  return isHexColor(candidate) ? candidate : INITIAL_TOKENS.primary
}

export function clampTokenValues(tokens: BrandTokens): BrandTokens {
  return {
    ...cloneTokens(tokens),
    radiusScale: tokens.radiusScale.map((value) => clampScaleValue('radiusScale', value)),
    spacingScale: tokens.spacingScale.map((value) => clampScaleValue('spacingScale', value)),
    typeScale: tokens.typeScale.map((value) => clampScaleValue('typeScale', value)),
  }
}

function clampScaleValue(field: ScaleField, value: number): number {
  const { min, max } = SCALE_LIMITS[field]
  return Math.min(max, Math.max(min, Math.round(value)))
}

export function validateTokens(tokens: BrandTokens): string | null {
  if (!isHexColor(tokens.primary) || !isHexColor(tokens.secondary)) return '请输入 6 位 HEX 颜色'
  if (tokens.radiusScale.length !== 4 || tokens.spacingScale.length !== 5 || tokens.typeScale.length !== 6) return '令牌层级数量不完整'
  if (tokens.typeScale.some((value) => value < SCALE_LIMITS.typeScale.min || value > SCALE_LIMITS.typeScale.max)) return `字号范围应在 ${SCALE_LIMITS.typeScale.min}–${SCALE_LIMITS.typeScale.max}px`
  return null
}

function channel(value: number): number {
  const scaled = value / 255
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
}

function luminance(color: string): number {
  const red = Number.parseInt(color.slice(1, 3), 16)
  const green = Number.parseInt(color.slice(3, 5), 16)
  const blue = Number.parseInt(color.slice(5, 7), 16)
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
}

export function contrastRatio(first: string, second: string): number {
  const one = luminance(first)
  const two = luminance(second)
  return (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05)
}

export function themeTokens(theme: BrandTheme): BrandTokens {
  return cloneTokens(THEME_PRESETS[theme].tokens)
}
