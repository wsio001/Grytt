import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddExerciseForm from '../AddExerciseForm'

describe('AddExerciseForm Component', () => {
  const mockAllMuscles = ['Chest', 'Back', 'Shoulders']

  const defaultProps = {
    newName: '',
    setNewName: vi.fn(),
    newTags: [],
    setNewTags: vi.fn(),
    allMuscles: mockAllMuscles,
    onPreview: vi.fn()
  }

  it('should render form title and input', () => {
    render(<AddExerciseForm {...defaultProps} />)
    expect(screen.getByText('Add New Exercise')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Exercise name')).toBeInTheDocument()
  })

  it('should call setNewName when input changes', async () => {
    const user = userEvent.setup()
    const handleSetNewName = vi.fn()

    render(<AddExerciseForm {...defaultProps} setNewName={handleSetNewName} />)

    await user.type(screen.getByPlaceholderText('Exercise name'), 'Bench Press')
    expect(handleSetNewName).toHaveBeenCalled()
  })

  it('should disable submit button when fields are empty', () => {
    render(<AddExerciseForm {...defaultProps} />)
    const submitButton = screen.getByRole('button', { name: /preview & add/i })
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when name and tags are filled', () => {
    render(<AddExerciseForm {...defaultProps} newName="Bench Press" newTags={['Chest']} />)
    const submitButton = screen.getByRole('button', { name: /preview & add/i })
    expect(submitButton).not.toBeDisabled()
  })

  it('should call onPreview when submit button clicked', () => {
    const handlePreview = vi.fn()
    render(<AddExerciseForm {...defaultProps} newName="Bench Press" newTags={['Chest']} onPreview={handlePreview} />)

    const submitButton = screen.getByRole('button', { name: /preview & add/i })
    fireEvent.click(submitButton)

    expect(handlePreview).toHaveBeenCalled()
  })
})
