import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Supabase client before importing functions
const mockSignInWithPassword = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword
    },
    from: mockFrom
  }))
}))

// Import after mocking
const { sbSignIn, sbLoadData, sbSaveData } = await import('./supabase')

describe('Supabase - Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw error if credentials are invalid', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid login credentials' }
    })

    await expect(sbSignIn('wrong@email.com', 'wrongpass')).rejects.toThrow('Invalid login credentials')
  })

  it('should return session on successful login', async () => {
    const mockSession = {
      access_token: 'mock-token',
      user: { id: 'user-123', email: 'test@example.com' }
    }

    mockSignInWithPassword.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    const session = await sbSignIn('test@example.com', 'password123')
    expect(session).toEqual(mockSession)
    expect(session.user.id).toBe('user-123')
  })
})

describe('Supabase - Data Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return null if no data exists for user', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows found' }
    })

    const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

    mockFrom.mockReturnValue({ select: mockSelect })

    const result = await sbLoadData('user-123')
    expect(result).toBeNull()
  })

  it('should successfully upsert data', async () => {
    const mockPayload = { exercises: [], logs: [] }

    const mockSelectResult = vi.fn().mockResolvedValue({
      data: [{ user_id: 'user-123', data: mockPayload }],
      error: null
    })

    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelectResult })

    mockFrom.mockReturnValue({ upsert: mockUpsert })

    const result = await sbSaveData('user-123', mockPayload)
    expect(result).toBeTruthy()
    expect(mockUpsert).toHaveBeenCalled()
  })
})
