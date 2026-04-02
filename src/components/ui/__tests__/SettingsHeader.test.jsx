import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import SettingsHeader from '../SettingsHeader'

describe('SettingsHeader Component', () => {
  it('should render correctly with showAdd=false', () => {
    const { container } = render(<SettingsHeader showAdd={false} onToggleAdd={vi.fn()} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should call onToggleAdd when button clicked', () => {
    const handleToggle = vi.fn()
    const { getByRole } = render(<SettingsHeader showAdd={false} onToggleAdd={handleToggle} />)

    fireEvent.click(getByRole('button'))
    expect(handleToggle).toHaveBeenCalledTimes(1)
  })

  it('should display title', () => {
    const { getByText } = render(<SettingsHeader showAdd={false} onToggleAdd={vi.fn()} />)
    expect(getByText('Muscle Groups')).toBeInTheDocument()
  })
})
