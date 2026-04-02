import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import App from '../App'
import * as supabase from '../lib/supabase'
import * as debouncedSave from '../hooks/useDebouncedSave'

// Mock Supabase and debounced save
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    }
  },
  sbSignIn: vi.fn(),
  sbLoadData: vi.fn(),
  sbSaveData: vi.fn()
}))

vi.mock('../hooks/useDebouncedSave', async () => {
  const actual = await vi.importActual('../hooks/useDebouncedSave')
  return {
    ...actual,
    useDebouncedSave: vi.fn(),
    loadCachedData: vi.fn(),
    clearCache: vi.fn(),
    hasUnsavedChanges: vi.fn(() => false)
  }
})

describe('Data Sync Flow', () => {
  const mockSession = {
    access_token: 'token-123',
    user: { id: 'user-123', email: 'test@example.com' }
  }

  const mockData = {
    exercises: [{ id: 'ex-1', name: 'Bench Press', tags: ['Chest'], instructions: '' }],
    goals: { Chest: 15 },
    logs: [],
    plan: { Sun: [], Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [] },
    dayNames: {},
    muscleCats: { Chest: ['Chest'] }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('grytt_session', JSON.stringify(mockSession))
  })

  it('should load data from Supabase on login', async () => {
    supabase.sbLoadData.mockResolvedValue(mockData)

    render(<App />)

    await waitFor(() => {
      expect(supabase.sbLoadData).toHaveBeenCalledWith('user-123')
    }, { timeout: 3000 })
  })

  it('should use cached data if Supabase fails', async () => {
    supabase.sbLoadData.mockRejectedValue(new Error('Network error'))
    debouncedSave.loadCachedData.mockReturnValue(mockData)

    render(<App />)

    await waitFor(() => {
      expect(debouncedSave.loadCachedData).toHaveBeenCalledWith('user-123')
    }, { timeout: 3000 })
  })

  it('should trigger auto-save when data changes', async () => {
    supabase.sbLoadData.mockResolvedValue(mockData)
    const useDebouncedSaveMock = vi.fn()
    debouncedSave.useDebouncedSave.mockImplementation(useDebouncedSaveMock)

    render(<App />)

    await waitFor(() => {
      // useDebouncedSave should be called with the payload
      expect(useDebouncedSaveMock).toHaveBeenCalled()
    }, { timeout: 3000 })
  })
})
