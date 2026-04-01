import { describe, it, expect } from 'vitest'
import { todayDay, todayFullName, todayStr, emptyPlan, DAYS } from './constants'

describe('Constants - Date Utilities', () => {
  it('should return valid day abbreviation', () => {
    const day = todayDay()
    expect(typeof day).toBe('string')
    expect(DAYS).toContain(day)
  })

  it('should return full day name', () => {
    const dayName = todayFullName()
    const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    expect(validDays).toContain(dayName)
  })

  it('should return date string in YYYY-MM-DD format', () => {
    const dateStr = todayStr()
    expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('should create empty plan with all days', () => {
    const plan = emptyPlan()
    DAYS.forEach(day => {
      expect(plan).toHaveProperty(day)
      expect(plan[day]).toEqual([])
    })
  })

  it('should have 7 days in DAYS constant', () => {
    expect(DAYS).toHaveLength(7)
  })
})
