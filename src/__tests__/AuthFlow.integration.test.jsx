import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import * as supabase from '../lib/supabase'

// Mock Supabase
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

describe('Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should show login screen when not authenticated', async () => {
    supabase.sbLoadData.mockResolvedValue(null)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    })
  })

  it('should login and show app after successful authentication', async () => {
    const user = userEvent.setup()

    const mockSession = {
      access_token: 'token-123',
      user: { id: 'user-123', email: 'test@example.com' }
    }

    const mockData = {
      exercises: [],
      goals: {},
      logs: [],
      plan: {},
      dayNames: {},
      muscleCats: {}
    }

    supabase.sbSignIn.mockResolvedValue(mockSession)
    supabase.sbLoadData.mockResolvedValue(mockData)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      // Should show navigation tabs after login
      expect(screen.getByText('Today')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should restore session from localStorage on mount', async () => {
    const mockSession = {
      access_token: 'token-123',
      user: { id: 'user-123', email: 'test@example.com' }
    }

    const mockData = {
      exercises: [],
      goals: {},
      logs: [],
      plan: {},
      dayNames: {},
      muscleCats: {}
    }

    localStorage.setItem('grytt_session', JSON.stringify(mockSession))

    supabase.sbLoadData.mockResolvedValue(mockData)

    render(<App />)

    await waitFor(() => {
      // Should skip login and show app
      expect(screen.queryByPlaceholderText('Email')).not.toBeInTheDocument()
      expect(screen.getByText('Today')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should logout and return to login screen', async () => {
    const user = userEvent.setup()

    const mockSession = {
      access_token: 'token-123',
      user: { id: 'user-123', email: 'test@example.com' }
    }

    const mockData = {
      exercises: [],
      goals: {},
      logs: [],
      plan: {},
      dayNames: {},
      muscleCats: {}
    }

    localStorage.setItem('grytt_session', JSON.stringify(mockSession))
    supabase.sbLoadData.mockResolvedValue(mockData)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Find and click logout button
    const logoutButton = screen.getByLabelText('Logout')
    await user.click(logoutButton)

    // Should return to login screen
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    })
  })
})
