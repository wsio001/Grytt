import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LibraryView from '../LibraryView/LibraryView'

// Mock fetch for AI instructions
global.fetch = vi.fn()

describe('LibraryView - Complete Workflow', () => {
  const mockExercises = [
    { id: 'ex-1', name: 'Bench Press', tags: ['Chest'], instructions: '' },
    { id: 'ex-2', name: 'Squat', tags: ['Quad'], instructions: '' },
    { id: 'ex-3', name: 'Deadlift', tags: ['Back'], instructions: '' }
  ]

  const mockGoals = {
    Chest: 15,
    Quad: 12,
    Back: 10,
    Tricep: 8
  }

  const mockMuscleCats = {
    Chest: ['Chest', 'Tricep'],
    Legs: ['Quad', 'Glute'],
    Back: ['Back', 'Traps']
  }

  let setExercisesMock
  let setPlanMock

  beforeEach(() => {
    setExercisesMock = vi.fn()
    setPlanMock = vi.fn()
    vi.clearAllMocks()

    // Mock successful fetch response
    fetch.mockResolvedValue({
      json: async () => ({
        content: [{ text: 'Generated instructions for exercise' }]
      })
    })
  })

  it('should display all exercises in current category', () => {
    render(
      <LibraryView
        exercises={mockExercises}
        setExercises={setExercisesMock}
        goals={mockGoals}
        muscleCats={mockMuscleCats}
        setPlan={setPlanMock}
      />
    )

    // Should show Bench Press since Chest category is selected by default
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
  })

  it('should switch categories and show filtered exercises', () => {
    render(
      <LibraryView
        exercises={mockExercises}
        setExercises={setExercisesMock}
        goals={mockGoals}
        muscleCats={mockMuscleCats}
        setPlan={setPlanMock}
      />
    )

    // Click on Legs category
    fireEvent.click(screen.getByText('Legs'))

    // Should show Squat
    expect(screen.getByText('Squat')).toBeInTheDocument()

    // Should not show Bench Press (different category)
    expect(screen.queryByText('Bench Press')).not.toBeInTheDocument()
  })

  it('should toggle add exercise form when header button clicked', () => {
    render(
      <LibraryView
        exercises={mockExercises}
        setExercises={setExercisesMock}
        goals={mockGoals}
        muscleCats={mockMuscleCats}
        setPlan={setPlanMock}
      />
    )

    // Find and click the add button
    const buttons = screen.getAllByRole('button')
    const addButton = buttons[0] // Header button
    fireEvent.click(addButton)

    // Should show add exercise form
    expect(screen.getByText('Add New Exercise')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Exercise name')).toBeInTheDocument()
  })

  it('should show empty state when category has no exercises', () => {
    const emptyExercises = [
      { id: 'ex-1', name: 'Bench Press', tags: ['Chest'], instructions: '' }
    ]

    render(
      <LibraryView
        exercises={emptyExercises}
        setExercises={setExercisesMock}
        goals={mockGoals}
        muscleCats={mockMuscleCats}
        setPlan={setPlanMock}
      />
    )

    // Switch to Legs category (which has no exercises)
    fireEvent.click(screen.getByText('Legs'))

    // Should show empty state
    expect(screen.getByText(/no exercises in legs/i)).toBeInTheDocument()
  })
})
