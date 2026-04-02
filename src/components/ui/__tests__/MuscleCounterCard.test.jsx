import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import MuscleCounterCard from '../MuscleCounterCard'

describe('MuscleCounterCard Component', () => {
  const mockData = {
    category: 'Chest',
    muscles: ['Chest', 'Front Delt'],
    vol: { 'Chest': 12, 'Front Delt': 9 },
    goals: { 'Chest': 15, 'Front Delt': 10 }
  }

  it('should render category and muscles', () => {
    const { getAllByText } = render(<MuscleCounterCard {...mockData} />)

    const chestElements = getAllByText('Chest')
    expect(chestElements.length).toBeGreaterThan(0)

    const frontDeltElements = getAllByText('Front Delt')
    expect(frontDeltElements.length).toBeGreaterThan(0)
  })

  it('should match snapshot', () => {
    const { container } = render(<MuscleCounterCard {...mockData} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
