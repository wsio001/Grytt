import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import DateSelector from '../DateSelector'

describe('DateSelector Component', () => {
  it('should render all 7 days', () => {
    const { getByText } = render(<DateSelector activeDay="Mon" setActiveDay={vi.fn()} />)

    expect(getByText('Sun')).toBeInTheDocument()
    expect(getByText('Mon')).toBeInTheDocument()
    expect(getByText('Tue')).toBeInTheDocument()
    expect(getByText('Wed')).toBeInTheDocument()
    expect(getByText('Thu')).toBeInTheDocument()
    expect(getByText('Fri')).toBeInTheDocument()
    expect(getByText('Sat')).toBeInTheDocument()
  })

  it('should call setActiveDay when day is clicked', () => {
    const handleSetActiveDay = vi.fn()
    const { getByText } = render(<DateSelector activeDay="Mon" setActiveDay={handleSetActiveDay} />)

    fireEvent.click(getByText('Wed'))
    expect(handleSetActiveDay).toHaveBeenCalledWith('Wed')
  })

  it('should match snapshot', () => {
    const { container } = render(<DateSelector activeDay="Mon" setActiveDay={vi.fn()} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
