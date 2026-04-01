import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDebouncedSave, loadCachedData, clearCache } from './useDebouncedSave'

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  sbSaveData: vi.fn(() => Promise.resolve())
}))

describe('useDebouncedSave Hook', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should save to localStorage immediately', () => {
    const payload = { exercises: [], logs: [] }
    const session = { user: { id: 'user-123' } }

    renderHook(() => useDebouncedSave(payload, session))

    const cached = localStorage.getItem('grytt_data_cache')
    expect(cached).toBeTruthy()

    const parsed = JSON.parse(cached)
    expect(parsed.userId).toBe('user-123')
    expect(parsed.data).toEqual(payload)
  })

  it('should debounce cloud save by 1.2 seconds', async () => {
    const { sbSaveData } = await import('../lib/supabase')
    const payload = { exercises: [], logs: [] }
    const session = { user: { id: 'user-123' } }

    renderHook(() => useDebouncedSave(payload, session))

    // Should not call immediately
    expect(sbSaveData).not.toHaveBeenCalled()

    // Should call after 1.2s
    await waitFor(() => {
      expect(sbSaveData).toHaveBeenCalledWith('user-123', payload)
    }, { timeout: 1500 })
  })

  it('should not save if session is null', () => {
    const payload = { exercises: [] }
    renderHook(() => useDebouncedSave(payload, null))

    const cached = localStorage.getItem('grytt_data_cache')
    expect(cached).toBeNull()
  })

  it('should not save if payload is null', () => {
    const session = { user: { id: 'user-123' } }
    renderHook(() => useDebouncedSave(null, session))

    const cached = localStorage.getItem('grytt_data_cache')
    expect(cached).toBeNull()
  })
})

describe('loadCachedData', () => {
  it('should load cached data for correct user', () => {
    const mockData = {
      userId: 'user-123',
      data: { exercises: [], logs: [] },
      timestamp: Date.now()
    }
    localStorage.setItem('grytt_data_cache', JSON.stringify(mockData))

    const result = loadCachedData('user-123')
    expect(result).toEqual(mockData.data)
  })

  it('should return null for different user', () => {
    const mockData = {
      userId: 'user-123',
      data: { exercises: [] },
      timestamp: Date.now()
    }
    localStorage.setItem('grytt_data_cache', JSON.stringify(mockData))

    const result = loadCachedData('user-456')
    expect(result).toBeNull()
  })
})

describe('clearCache', () => {
  it('should clear localStorage cache', () => {
    localStorage.setItem('grytt_data_cache', 'some data')
    clearCache()
    expect(localStorage.getItem('grytt_data_cache')).toBeNull()
  })
})
