import { describe, expect, it } from 'vitest'
import { clampScaleValue, clampTokenValues, contrastRatio, parseScaleInput, validateTokens } from '../domain/brandRules'
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

  it('accepts only complete numeric input and rejects empty or partial text', () => {
    expect(parseScaleInput('')).toBeNull()
    expect(parseScaleInput('   ')).toBeNull()
    expect(parseScaleInput('-')).toBeNull()
    expect(parseScaleInput('abc')).toBeNull()
    expect(parseScaleInput('1.2.3')).toBeNull()
    expect(parseScaleInput('18')).toBe(18)
    expect(parseScaleInput(' -4 ')).toBe(-4)
    expect(parseScaleInput('12.5')).toBe(12.5)
  })

  it('clamps a single scale value within its field limits', () => {
    expect(clampScaleValue('typeScale', 500)).toBe(72)
    expect(clampScaleValue('typeScale', 4)).toBe(10)
    expect(clampScaleValue('spacingScale', 0)).toBe(2)
    expect(clampScaleValue('radiusScale', 16.6)).toBe(17)
  })

  it('rejects invalid colors and unsupported scale lengths', () => {
    expect(validateTokens({ ...INITIAL_TOKENS, primary: 'red' })).toContain('HEX')
    expect(validateTokens({ ...INITIAL_TOKENS, typeScale: [12] })).toContain('数量')
  })
})
