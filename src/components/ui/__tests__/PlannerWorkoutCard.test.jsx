import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PlannerWorkoutCard from '../PlannerWorkoutCard'

describe('PlannerWorkoutCard Component', () => {
  const mockExMap = new Map([
    ['ex-1', { id: 'ex-1', name: 'Bench Press', tags: ['Chest'] }],
    ['ex-2', { id: 'ex-2', name: 'Incline Press', tags: ['Chest'] }]
  ])

  const mockRow = [
    { id: 'pe-1', exerciseId: 'ex-1', sets: 3 }
  ]

  const defaultProps = {
    row: mockRow,
    rowIndex: 0,
    activeDay: 'Mon',
    exMap: mockExMap,
    dragState: { isMobile: false, isDragging: false, isDraggingMobile: false, drag: {} },
    workoutHandlers: { updSets: vi.fn(), remPe: vi.fn() },
    dragHandlers: {
      dispatchDrag: vi.fn(),
      resetDrag: vi.fn(),
      handleDrop: vi.fn(),
      handleTouchStart: vi.fn(),
      handleTouchEnd: vi.fn(),
      handleTouchMove: vi.fn()
    }
  }

  it('should render exercise name', () => {
    render(<PlannerWorkoutCard {...defaultProps} />)
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
  })

  it('should render sets count', () => {
    render(<PlannerWorkoutCard {...defaultProps} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should render superset when row has multiple exercises', () => {
    const supersetRow = [
      { id: 'pe-1', exerciseId: 'ex-1', sets: 3 },
      { id: 'pe-2', exerciseId: 'ex-2', sets: 3 }
    ]

    render(<PlannerWorkoutCard {...defaultProps} row={supersetRow} />)
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.getByText('Incline Press')).toBeInTheDocument()
  })

  it('should match snapshot', () => {
    const { container } = render(<PlannerWorkoutCard {...defaultProps} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
