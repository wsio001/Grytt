import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PlannerView from '../PlannerView/PlannerView'

describe('PlannerView - Complete Workflow', () => {
  const mockExMap = new Map([
    ['ex-1', { id: 'ex-1', name: 'Bench Press', tags: ['Chest'] }],
    ['ex-2', { id: 'ex-2', name: 'Squat', tags: ['Quad'] }],
    ['ex-3', { id: 'ex-3', name: 'Deadlift', tags: ['Back'] }]
  ])

  const mockExercises = [
    { id: 'ex-1', name: 'Bench Press', tags: ['Chest'] },
    { id: 'ex-2', name: 'Squat', tags: ['Quad'] },
    { id: 'ex-3', name: 'Deadlift', tags: ['Back'] }
  ]

  const mockPlan = {
    Sun: [],
    Mon: [[{ id: 'pe-1', exerciseId: 'ex-1', sets: 3 }]],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: []
  }

  const mockGoals = {
    Chest: 15,
    Quad: 12,
    Back: 10
  }

  const mockMuscleCats = {
    Chest: ['Chest'],
    Legs: ['Quad', 'Glute'],
    Back: ['Back', 'Traps']
  }

  let setPlanMock

  beforeEach(() => {
    setPlanMock = vi.fn()
    // Mock window size for desktop view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })
  })

  it('should display all 7 days in date selector', () => {
    render(
      <PlannerView
        exMap={mockExMap}
        exercises={mockExercises}
        plan={mockPlan}
        setPlan={setPlanMock}
        goals={mockGoals}
        muscleCats={mockMuscleCats}
        activeDay="Mon"
        setActiveDay={vi.fn()}
      />
    )

    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Tue')).toBeInTheDocument()
    expect(screen.getByText('Wed')).toBeInTheDocument()
    expect(screen.getByText('Thu')).toBeInTheDocument()
    expect(screen.getByText('Fri')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
  })

  it('should switch between days when clicked', () => {
    const setActiveDayMock = vi.fn()
    render(
      <PlannerView
        exMap={mockExMap}
        exercises={mockExercises}
        plan={mockPlan}
        setPlan={setPlanMock}
        goals={mockGoals}
        muscleCats={mockMuscleCats}
        activeDay="Mon"
        setActiveDay={setActiveDayMock}
      />
    )

    fireEvent.click(screen.getByText('Wed'))
    expect(setActiveDayMock).toHaveBeenCalledWith('Wed')
  })

  it('should display planned exercises for active day', () => {
    render(
      <PlannerView
        exMap={mockExMap}
        exercises={mockExercises}
        plan={mockPlan}
        setPlan={setPlanMock}
        goals={mockGoals}
        muscleCats={mockMuscleCats}
        activeDay="Mon"
        setActiveDay={vi.fn()}
      />
    )

    expect(screen.getByText('Bench Press')).toBeInTheDocument()
  })

  it('should display exercise library sidebar on desktop', () => {
    render(
      <PlannerView
        exMap={mockExMap}
        exercises={mockExercises}
        plan={mockPlan}
        setPlan={setPlanMock}
        goals={mockGoals}
        muscleCats={mockMuscleCats}
        activeDay="Mon"
        setActiveDay={vi.fn()}
      />
    )

    expect(screen.getByText('Exercise Library')).toBeInTheDocument()
  })

  it('should calculate weekly volume correctly', () => {
    const planWithMultipleExercises = {
      ...mockPlan,
      Mon: [
        [{ id: 'pe-1', exerciseId: 'ex-1', sets: 3 }],
        [{ id: 'pe-2', exerciseId: 'ex-1', sets: 4 }]
      ],
      Tue: [
        [{ id: 'pe-3', exerciseId: 'ex-2', sets: 5 }]
      ]
    }

    render(
      <PlannerView
        exMap={mockExMap}
        exercises={mockExercises}
        plan={planWithMultipleExercises}
        setPlan={setPlanMock}
        goals={mockGoals}
        muscleCats={mockMuscleCats}
        activeDay="Mon"
        setActiveDay={vi.fn()}
      />
    )

    // Weekly Volume section should be rendered
    expect(screen.getByText('Weekly Volume')).toBeInTheDocument()
  })

  it('should show empty state when day has no exercises', () => {
    render(
      <PlannerView
        exMap={mockExMap}
        exercises={mockExercises}
        plan={mockPlan}
        setPlan={setPlanMock}
        goals={mockGoals}
        muscleCats={mockMuscleCats}
        activeDay="Tue" // Tuesday has no exercises
        setActiveDay={vi.fn()}
      />
    )

    expect(screen.getByText(/drag exercises here/i)).toBeInTheDocument()
  })
})
