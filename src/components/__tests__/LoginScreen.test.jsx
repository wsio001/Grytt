import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginScreen from '../LoginScreen'
import * as supabase from '../../lib/supabase'

// Mock the Supabase module
vi.mock('../../lib/supabase', () => ({
  sbSignIn: vi.fn()
}))

describe('LoginScreen Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render email and password inputs', () => {
    render(<LoginScreen onLogin={vi.fn()} />)
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })

  it('should disable submit button when fields are empty', () => {
    render(<LoginScreen onLogin={vi.fn()} />)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when fields are filled', async () => {
    const user = userEvent.setup()
    render(<LoginScreen onLogin={vi.fn()} />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    expect(submitButton).toBeDisabled()

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')

    expect(submitButton).not.toBeDisabled()
  })

  it('should call onLogin with session on successful login', async () => {
    const user = userEvent.setup()
    const mockOnLogin = vi.fn()
    const mockSession = {
      access_token: 'token',
      user: { id: '123', email: 'test@example.com' }
    }

    supabase.sbSignIn.mockResolvedValue(mockSession)

    render(<LoginScreen onLogin={mockOnLogin} />)

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(mockSession)
    })
  })

  it('should display error message on failed login', async () => {
    const user = userEvent.setup()

    supabase.sbSignIn.mockRejectedValue(new Error('Invalid credentials'))

    render(<LoginScreen onLogin={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('Email'), 'wrong@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('should show loading state during login', async () => {
    const user = userEvent.setup()

    supabase.sbSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

    render(<LoginScreen onLogin={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
  })
})
