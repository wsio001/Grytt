import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import EmptyState from '../EmptyState'

describe('EmptyState Component', () => {
  it('should render correctly', () => {
    const { container } = render(<EmptyState message="Test message" />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should display custom message', () => {
    const { getByText } = render(<EmptyState message="No workouts found" />)
    expect(getByText('No workouts found')).toBeInTheDocument()
  })
})
