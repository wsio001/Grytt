import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import WorkoutProgressCard from '../WorkoutProgressCard'

describe('WorkoutProgressCard Component', () => {
  const mockExMap = new Map([
    ['ex-1', { id: 'ex-1', name: 'Bench Press', tags: ['Chest', 'Tricep'] }]
  ])

  const mockRow = [
    { id: 'pe-1', exerciseId: 'ex-1', sets: 3 }
  ]

  const mockInputs = {
    'pe-1': [
      { reps: '10', weight: '135' },
      { reps: '10', weight: '135' },
      { reps: '8', weight: '135' }
    ]
  }

  const defaultProps = {
    row: mockRow,
    inputs: mockInputs,
    exMap: mockExMap,
    lastLogByEx: new Map(),
    todayDate: '2024-04-01',
    onUpdate: vi.fn()
  }

  it('should render exercise name and sets count', () => {
    render(<WorkoutProgressCard {...defaultProps} />)
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.getByText('3 sets')).toBeInTheDocument()
  })

  it('should render all set inputs', () => {
    render(<WorkoutProgressCard {...defaultProps} />)
    expect(screen.getByText('S1')).toBeInTheDocument()
    expect(screen.getByText('S2')).toBeInTheDocument()
    expect(screen.getByText('S3')).toBeInTheDocument()
  })

  it('should call onUpdate when reps input changes', () => {
    const handleUpdate = vi.fn()
    render(<WorkoutProgressCard {...defaultProps} onUpdate={handleUpdate} />)

    const repsInputs = screen.getAllByDisplayValue('10')
    fireEvent.change(repsInputs[0], { target: { value: '12' } })

    expect(handleUpdate).toHaveBeenCalledWith('pe-1', 0, 'reps', '12')
  })

  it('should call onUpdate when weight input changes', () => {
    const handleUpdate = vi.fn()
    render(<WorkoutProgressCard {...defaultProps} onUpdate={handleUpdate} />)

    const weightInputs = screen.getAllByDisplayValue('135')
    fireEvent.change(weightInputs[0], { target: { value: '140' } })

    expect(handleUpdate).toHaveBeenCalledWith('pe-1', 0, 'weight', '140')
  })

  it('should display previous workout data when available', () => {
    const lastLogByEx = new Map([
      ['ex-1', {
        date: '2024-03-31',
        sets: [
          { reps: 10, weight: 135 },
          { reps: 10, weight: 135 },
          { reps: 8, weight: 135 }
        ]
      }]
    ])

    render(<WorkoutProgressCard {...defaultProps} lastLogByEx={lastLogByEx} />)
    expect(screen.getByText(/Last:/)).toBeInTheDocument()
  })

  it('should match snapshot', () => {
    const { container } = render(<WorkoutProgressCard {...defaultProps} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
