import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddMuscleForm from '../AddMuscleForm'

describe('AddMuscleForm Component', () => {
  const mockMuscleCats = {
    Chest: ['Chest', 'Front Delt'],
    Back: ['Traps', 'Upper Back'],
    Shoulders: ['Front Delt', 'Mid Delt']
  }

  const mockGoals = {
    Chest: 15,
    'Front Delt': 10,
    Traps: 12
  }

  const defaultProps = {
    newMuscle: '',
    setNewMuscle: vi.fn(),
    newMuscleCat: 'Chest',
    setNewMuscleCat: vi.fn(),
    muscleCats: mockMuscleCats,
    goals: mockGoals,
    onAdd: vi.fn()
  }

  it('should render form description and input', () => {
    render(<AddMuscleForm {...defaultProps} />)
    expect(screen.getByText(/Add a new muscle to an existing group/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e.g. Inner Chest/i)).toBeInTheDocument()
  })

  it('should call setNewMuscle when input changes', async () => {
    const user = userEvent.setup()
    const handleSetNewMuscle = vi.fn()

    render(<AddMuscleForm {...defaultProps} setNewMuscle={handleSetNewMuscle} />)

    await user.type(screen.getByPlaceholderText(/e.g. Inner Chest/i), 'Inner Chest')
    expect(handleSetNewMuscle).toHaveBeenCalled()
  })

  it('should disable submit button when muscle name is empty', () => {
    render(<AddMuscleForm {...defaultProps} />)
    const submitButton = screen.getByRole('button', { name: /add to chest/i })
    expect(submitButton).toBeDisabled()
  })

  it('should call onAdd when submit button clicked with valid input', () => {
    const handleAdd = vi.fn()
    render(<AddMuscleForm {...defaultProps} newMuscle="Inner Chest" onAdd={handleAdd} />)

    const submitButton = screen.getByRole('button', { name: /add to chest/i })
    fireEvent.click(submitButton)

    expect(handleAdd).toHaveBeenCalled()
  })
})
