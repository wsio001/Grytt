import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ExerciseCard from '../ExerciseCard'

describe('ExerciseCard Component', () => {
  const mockExercise = {
    id: 'ex-1',
    name: 'Bench Press',
    tags: ['Chest', 'Tricep']
  }

  const defaultProps = {
    exercise: mockExercise,
    isEditing: false,
    editName: '',
    setEditName: vi.fn(),
    editTags: [],
    allMuscles: ['Chest', 'Tricep', 'Back'],
    toggleTag: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onOpenDetail: vi.fn()
  }

  it('should render exercise name and tags in view mode', () => {
    render(<ExerciseCard {...defaultProps} />)
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.getByText('Chest')).toBeInTheDocument()
    expect(screen.getByText('Tricep')).toBeInTheDocument()
  })

  it('should call onEdit when edit button clicked', () => {
    const handleEdit = vi.fn()
    render(<ExerciseCard {...defaultProps} onEdit={handleEdit} />)

    const editButtons = screen.getAllByRole('button')
    const editButton = editButtons.find(btn => btn.querySelector('svg'))
    if (editButton) fireEvent.click(editButton)

    expect(handleEdit).toHaveBeenCalled()
  })

  it('should call onDelete when delete button clicked', () => {
    const handleDelete = vi.fn()
    render(<ExerciseCard {...defaultProps} onDelete={handleDelete} />)

    const deleteButtons = screen.getAllByRole('button')
    const deleteButton = deleteButtons[deleteButtons.length - 1]
    fireEvent.click(deleteButton)

    expect(handleDelete).toHaveBeenCalled()
  })

  it('should show edit mode when isEditing is true', () => {
    render(<ExerciseCard {...defaultProps} isEditing={true} editName="Bench Press" />)
    expect(screen.getByDisplayValue('Bench Press')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should match snapshot in view mode', () => {
    const { container } = render(<ExerciseCard {...defaultProps} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
