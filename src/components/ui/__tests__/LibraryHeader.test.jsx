import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import LibraryHeader from '../LibraryHeader'

describe('LibraryHeader Component', () => {
  it('should render correctly with showAdd=false', () => {
    const { container } = render(<LibraryHeader showAdd={false} onToggleAdd={vi.fn()} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should call onToggleAdd when button clicked', () => {
    const handleToggle = vi.fn()
    const { getByRole } = render(<LibraryHeader showAdd={false} onToggleAdd={handleToggle} />)

    fireEvent.click(getByRole('button'))
    expect(handleToggle).toHaveBeenCalledTimes(1)
  })

  it('should display title', () => {
    const { getByText } = render(<LibraryHeader showAdd={false} onToggleAdd={vi.fn()} />)
    expect(getByText('Exercise Library')).toBeInTheDocument()
  })
})
