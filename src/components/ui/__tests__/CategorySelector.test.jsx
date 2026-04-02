import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import CategorySelector from '../CategorySelector'

describe('CategorySelector Component', () => {
  const mockCategories = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core']

  it('should render all categories', () => {
    const { getByText } = render(
      <CategorySelector
        categories={mockCategories}
        selectedCategory="Chest"
        onSelectCategory={vi.fn()}
      />
    )

    mockCategories.forEach(cat => {
      expect(getByText(cat)).toBeInTheDocument()
    })
  })

  it('should call onSelectCategory when category clicked', () => {
    const handleSelect = vi.fn()
    const { getByText } = render(
      <CategorySelector
        categories={mockCategories}
        selectedCategory="Chest"
        onSelectCategory={handleSelect}
      />
    )

    fireEvent.click(getByText('Back'))
    expect(handleSelect).toHaveBeenCalledWith('Back')
  })

  it('should match snapshot', () => {
    const { container } = render(
      <CategorySelector
        categories={mockCategories}
        selectedCategory="Chest"
        onSelectCategory={vi.fn()}
      />
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
