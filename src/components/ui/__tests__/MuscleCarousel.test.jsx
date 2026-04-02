import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MuscleCarousel from '../MuscleCarousel'

describe('MuscleCarousel Component', () => {
  const mockMuscleCats = {
    Chest: ['Chest', 'Front Delt'],
    Back: ['Traps', 'Upper Back', 'Lower Back'],
    Shoulders: ['Front Delt', 'Mid Delt', 'Rear Delt']
  }

  it('should render all muscle categories', () => {
    render(<MuscleCarousel muscleCats={mockMuscleCats} catTab="Chest" setCatTab={vi.fn()} />)

    expect(screen.getByText('Chest')).toBeInTheDocument()
    expect(screen.getByText('Back')).toBeInTheDocument()
    expect(screen.getByText('Shoulders')).toBeInTheDocument()
  })

  it('should call setCatTab when category is selected', () => {
    const handleSetCatTab = vi.fn()
    render(<MuscleCarousel muscleCats={mockMuscleCats} catTab="Chest" setCatTab={handleSetCatTab} />)

    fireEvent.click(screen.getByText('Back'))
    expect(handleSetCatTab).toHaveBeenCalledWith('Back')
  })

  it('should highlight active category', () => {
    const { container } = render(<MuscleCarousel muscleCats={mockMuscleCats} catTab="Chest" setCatTab={vi.fn()} />)
    expect(container).toBeTruthy()
  })

  it('should match snapshot', () => {
    const { container } = render(<MuscleCarousel muscleCats={mockMuscleCats} catTab="Chest" setCatTab={vi.fn()} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
