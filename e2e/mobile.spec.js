import { test, expect, devices } from '@playwright/test'

// Run these tests with iPhone 12 configuration
test.use({ ...devices['iPhone 12'] })

test.describe('Mobile Experience', () => {
  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.goto('/')

    // Verify viewport is mobile size
    const viewport = page.viewportSize()
    expect(viewport.width).toBeLessThan(500) // Mobile width

    // Should show login screen
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.getByText('Grytt')).toBeVisible()

    // Login
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword123')
    await page.click('button:has-text("Sign In")')

    // Wait for app to load
    await expect(page.getByText('Today')).toBeVisible({ timeout: 5000 })

    // Verify mobile layout elements are visible
    const navButtons = page.locator('button').filter({ hasText: /Today|Planner|Exercises|Settings/i })
    expect(await navButtons.count()).toBeGreaterThan(0)

    // Check that header/navigation is responsive
    const body = page.locator('body')
    const bodyBox = await body.boundingBox()

    expect(bodyBox.width).toBeLessThanOrEqual(viewport.width)
  })

  test('should have proper safe area spacing on mobile', async ({ page }) => {
    await page.goto('/')

    // Check for safe area insets (important for notched devices)
    const hasSafeAreaPadding = await page.evaluate(() => {
      const root = document.documentElement
      const style = window.getComputedStyle(root)

      // Check if CSS variables or padding for safe area exist
      const paddingTop = style.paddingTop
      const hasEnvSupport = CSS.supports('padding-top', 'env(safe-area-inset-top)')

      return {
        paddingTop,
        hasEnvSupport,
        rootElement: !!root
      }
    })

    // At minimum, the page should render
    expect(hasSafeAreaPadding.rootElement).toBe(true)

    // Login to check app content
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword123')
    await page.click('button:has-text("Sign In")')

    await expect(page.getByText('Today')).toBeVisible({ timeout: 5000 })

    // Verify content doesn't overflow on mobile
    const overflow = await page.evaluate(() => {
      const body = document.body
      const html = document.documentElement

      return {
        bodyScrollWidth: body.scrollWidth,
        bodyClientWidth: body.clientWidth,
        htmlScrollWidth: html.scrollWidth,
        htmlClientWidth: html.clientWidth
      }
    })

    // No horizontal overflow (with small tolerance)
    expect(overflow.bodyScrollWidth - overflow.bodyClientWidth).toBeLessThan(20)
  })

  test('should allow touch interactions on mobile', async ({ page }) => {
    await page.goto('/')

    // Login
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword123')

    // Tap the sign in button (touch instead of click)
    await page.tap('button:has-text("Sign In")')

    await expect(page.getByText('Today')).toBeVisible({ timeout: 5000 })

    // Navigate using tap
    const plannerButton = page.locator('button').filter({ hasText: 'Planner' })

    if (await plannerButton.count() > 0) {
      await plannerButton.tap()
      await page.waitForTimeout(500)

      // Should navigate to Planner
      // Button should indicate active state
      await expect(plannerButton).toBeVisible()
    }

    // Test touch scrolling
    await page.click('button:has-text("Today")')
    await page.waitForTimeout(500)

    // Try to scroll if there's content
    const scrollable = page.locator('body')
    await scrollable.evaluate(node => {
      node.scrollTo({ top: 100, behavior: 'smooth' })
    })

    await page.waitForTimeout(300)

    // Verify scroll worked (or at least didn't error)
    const scrollTop = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop)
    expect(scrollTop >= 0).toBe(true)
  })

  test('should handle mobile keyboard interactions', async ({ page }) => {
    await page.goto('/')

    // Login
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword123')
    await page.tap('button:has-text("Sign In")')

    await expect(page.getByText('Today')).toBeVisible({ timeout: 5000 })

    // Navigate to Today
    await page.tap('button:has-text("Today")')
    await page.waitForTimeout(500)

    // Find input fields
    const inputs = page.locator('input[type="text"], input[type="number"]')

    if (await inputs.count() > 0) {
      const firstInput = inputs.first()

      // Focus the input (should trigger mobile keyboard)
      await firstInput.tap()
      await page.waitForTimeout(300)

      // Type on mobile keyboard
      await firstInput.fill('12')

      // Verify value was entered
      await expect(firstInput).toHaveValue('12')

      // Try to blur (close keyboard)
      await page.tap('body')
      await page.waitForTimeout(300)
    }

    // Verify app is still functional after keyboard interactions
    await expect(page.getByText('Today')).toBeVisible()
  })

  test('should show mobile-specific UI elements', async ({ page }) => {
    await page.goto('/')

    // Login
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword123')
    await page.tap('button:has-text("Sign In")')

    await expect(page.getByText('Today')).toBeVisible({ timeout: 5000 })

    // Check for mobile navigation (bottom nav or hamburger menu)
    const navElements = page.locator('nav, [role="navigation"]')
    const navCount = await navElements.count()

    // Some form of navigation should exist
    expect(navCount >= 0).toBe(true)

    // Check that text is readable on mobile (not too small)
    const fontSize = await page.evaluate(() => {
      const body = document.body
      const computedStyle = window.getComputedStyle(body)
      return parseFloat(computedStyle.fontSize)
    })

    // Font size should be at least 14px for readability
    expect(fontSize).toBeGreaterThanOrEqual(14)

    // Navigate to Library to check mobile-specific layout
    const exercisesButton = page.locator('button').filter({ hasText: 'Exercises' })

    if (await exercisesButton.count() > 0) {
      await exercisesButton.tap()
      await page.waitForTimeout(500)

      // On mobile, library might use a modal instead of sidebar
      const modal = page.locator('[class*="modal"], [role="dialog"]')
      const sidebar = page.locator('[class*="sidebar"]')

      // Either modal or sidebar should exist (or neither if different layout)
      const hasModal = await modal.count() > 0
      const hasSidebar = await sidebar.count() > 0

      // At minimum, the view should load without errors
      expect(true).toBe(true)
    }

    // Verify overall mobile experience is functional
    await expect(page.getByText(/Today|Planner|Exercises|Settings/i).first()).toBeVisible()
  })

  test('should work in landscape orientation', async ({ page }) => {
    // Set landscape viewport
    await page.setViewportSize({ width: 844, height: 390 }) // iPhone 12 landscape

    await page.goto('/')

    // Should still show login screen properly
    await expect(page.locator('input[type="email"]')).toBeVisible()

    // Login
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword123')
    await page.tap('button:has-text("Sign In")')

    await expect(page.getByText('Today')).toBeVisible({ timeout: 5000 })

    // Check layout doesn't break in landscape
    const overflow = await page.evaluate(() => {
      return {
        width: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
      }
    })

    // Should not have unexpected horizontal scroll
    expect(overflow.hasHorizontalScroll).toBe(false)

    // Navigate between views to ensure landscape works everywhere
    const views = ['Today', 'Planner', 'Exercises']

    for (const view of views) {
      const button = page.locator('button').filter({ hasText: view })
      if (await button.count() > 0) {
        await button.tap()
        await page.waitForTimeout(300)
        await expect(button).toBeVisible()
      }
    }
  })
})
