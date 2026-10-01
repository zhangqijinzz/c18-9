import { describe, expect, it } from 'vitest'
import { clampTokenValues, contrastRatio, parseScaleValue, validateTokens } from '../domain/brandRules'
import { INITIAL_TOKENS } from '../models/brandMirrorModels'

describe('brand token rules', () => {
  it('calculates a readable contrast ratio', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 1)
    expect(contrastRatio('#F15A47', '#24324A')).toBeGreaterThan(3)
  })

  it('clamps extreme values to the supported design scale', () => {
    const clamped = clampTokenValues({ ...INITIAL_TOKENS, typeScale: [1, 80, 14, 20, 28, 40], radiusScale: [-4, 12, 18, 50], spacingScale: [0, 8, 12, 20, 99] })
    expect(clamped.typeScale).toEqual([10, 72, 14, 20, 28, 40])
    expect(clamped.radiusScale).toEqual([0, 12, 18, 40])
    expect(clamped.spacingScale).toEqual([2, 8, 12, 20, 64])
  })

  it('rejects invalid colors and unsupported scale lengths', () => {
    expect(validateTokens({ ...INITIAL_TOKENS, primary: 'red' })).toContain('HEX')
    expect(validateTokens({ ...INITIAL_TOKENS, typeScale: [12] })).toContain('数量')
  })

  it('accepts complete numeric input and rounds it', () => {
    expect(parseScaleValue('typeScale', '16')).toEqual({ ok: true, value: 16, clamped: false })
    expect(parseScaleValue('typeScale', ' 12.6 ')).toEqual({ ok: true, value: 13, clamped: false })
    expect(parseScaleValue('radiusScale', '-4')).toEqual({ ok: true, value: 0, clamped: true })
  })

  it('rejects empty or incomplete input instead of treating it as zero', () => {
    expect(parseScaleValue('typeScale', '')).toEqual({ ok: false })
    expect(parseScaleValue('typeScale', '   ')).toEqual({ ok: false })
    expect(parseScaleValue('typeScale', '-')).toEqual({ ok: false })
    expect(parseScaleValue('radiusScale', '1.')).toEqual({ ok: true, value: 1, clamped: false })
    expect(parseScaleValue('typeScale', 'abc')).toEqual({ ok: false })
    expect(parseScaleValue('typeScale', '12px')).toEqual({ ok: false })
  })

  it('reports the exact clamped value when input leaves the allowed range', () => {
    expect(parseScaleValue('typeScale', '4')).toEqual({ ok: true, value: 10, clamped: true })
    expect(parseScaleValue('typeScale', '500')).toEqual({ ok: true, value: 72, clamped: true })
    expect(parseScaleValue('spacingScale', '1')).toEqual({ ok: true, value: 2, clamped: true })
    expect(parseScaleValue('spacingScale', '99')).toEqual({ ok: true, value: 64, clamped: true })
  })
})
