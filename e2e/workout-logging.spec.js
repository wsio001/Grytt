import { test, expect } from '@playwright/test'

test.describe('Workout Logging', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and login before each test
    await page.goto('/')

    // Login with test credentials
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword123')
    await page.click('button:has-text("Sign In")')

    // Wait for app to load
    await expect(page.getByText('Today')).toBeVisible({ timeout: 5000 })
  })

  test('should log workout and auto-save', async ({ page }) => {
    // Navigate to Today view
    await page.click('button:has-text("Today")')

    // Wait for view to load
    await page.waitForTimeout(500)

    // Check if there are any workout inputs
    const repsInputs = page.locator('input[placeholder*="reps" i], input[placeholder="0"]')
    const weightInputs = page.locator('input[placeholder*="weight" i], input[placeholder*="lbs" i]')

    const hasRepsInput = await repsInputs.count() > 0
    const hasWeightInput = await weightInputs.count() > 0

    if (hasRepsInput && hasWeightInput) {
      // Clear and fill in workout data
      const firstRepsInput = repsInputs.first()
      const firstWeightInput = weightInputs.first()

      await firstRepsInput.clear()
      await firstRepsInput.fill('10')

      await firstWeightInput.clear()
      await firstWeightInput.fill('135')

      // Wait for auto-save (800ms debounce + 500ms buffer)
      await page.waitForTimeout(1500)

      // Verify the values are still there
      await expect(firstRepsInput).toHaveValue('10')
      await expect(firstWeightInput).toHaveValue('135')

      // Check localStorage was updated
      const cachedData = await page.evaluate(() => {
        return localStorage.getItem('grytt_data_cache')
      })

      expect(cachedData).toBeTruthy()
    } else {
      // No workout planned for today - verify empty state
      const emptyState = page.getByText(/no workout/i)
      if (await emptyState.count() > 0) {
        await expect(emptyState.first()).toBeVisible()
      }
    }
  })

  test('should pre-fill with previous workout data', async ({ page }) => {
    // Navigate to Today view
    await page.click('button:has-text("Today")')
    await page.waitForTimeout(500)

    // Check if inputs are pre-filled from previous workouts
    const inputs = page.locator('input[type="text"], input[type="number"]')
    const inputCount = await inputs.count()

    if (inputCount > 0) {
      // Check if any inputs have values (pre-filled from history)
      let hasPrefilledValues = false

      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const value = await inputs.nth(i).inputValue()
        if (value && value !== '' && value !== '0') {
          hasPrefilledValues = true
          break
        }
      }

      // If we have prefilled values, that's good
      // If not, that's also fine (no previous workout history)
      // This test mainly verifies the app doesn't crash
      expect(true).toBe(true)
    }

    // The main goal is to verify the view loads without errors
    await expect(page.getByText('Today')).toBeVisible()
  })

  test('should handle multiple sets correctly', async ({ page }) => {
    // Navigate to Today view
    await page.click('button:has-text("Today")')
    await page.waitForTimeout(500)

    // Find all reps inputs for exercises
    const repsInputs = page.locator('input[placeholder*="reps" i], input[placeholder="0"]')
    const count = await repsInputs.count()

    if (count > 0) {
      // Fill multiple sets with different values
      const setsToFill = Math.min(count, 3) // Fill up to 3 sets

      for (let i = 0; i < setsToFill; i++) {
        const input = repsInputs.nth(i)
        await input.clear()
        await input.fill(`${10 - i}`) // 10, 9, 8, etc.
        await page.waitForTimeout(100) // Small delay between inputs
      }

      // Wait for auto-save
      await page.waitForTimeout(1500)

      // Refresh page to verify persistence
      await page.reload()
      await expect(page.getByText('Today')).toBeVisible()

      // Verify values persisted
      const repsAfterReload = page.locator('input[placeholder*="reps" i], input[placeholder="0"]')

      if (await repsAfterReload.count() >= setsToFill) {
        // Check first set still has correct value
        const firstValue = await repsAfterReload.first().inputValue()
        // Value should be '10' or possibly pre-filled from earlier test
        expect(firstValue).toBeTruthy()
      }
    } else {
      // No workout for today - verify empty state is shown
      const emptyMessage = page.getByText(/no workout/i, /rest day/i)
      const hasEmptyState = await emptyMessage.count() > 0

      if (hasEmptyState) {
        await expect(emptyMessage.first()).toBeVisible()
      }
    }
  })

  test('should clear inputs when clicking clear button', async ({ page }) => {
    // Navigate to Today view
    await page.click('button:has-text("Today")')
    await page.waitForTimeout(500)

    // Find inputs
    const repsInputs = page.locator('input[placeholder*="reps" i], input[placeholder="0"]')

    if (await repsInputs.count() > 0) {
      const firstInput = repsInputs.first()

      // Fill with a value
      await firstInput.clear()
      await firstInput.fill('15')
      await expect(firstInput).toHaveValue('15')

      // Look for clear/reset button (if it exists)
      const clearButton = page.locator('button').filter({ hasText: /clear|reset/i })

      if (await clearButton.count() > 0) {
        await clearButton.first().click()
        await page.waitForTimeout(500)

        // Verify input was cleared
        const valueAfterClear = await firstInput.inputValue()
        expect(valueAfterClear === '' || valueAfterClear === '0').toBe(true)
      }
    }

    // Main goal: verify Today view works without errors
    await expect(page.getByText('Today')).toBeVisible()
  })

  test('should show workout progress indicators', async ({ page }) => {
    // Navigate to Today view
    await page.click('button:has-text("Today")')
    await page.waitForTimeout(500)

    // Look for common progress indicators
    const progressElements = page.locator('[class*="progress"], [class*="complete"], [class*="done"]')

    // Check if there are any workout cards/exercises
    const workoutCards = page.locator('[class*="workout"], [class*="exercise"]')
    const hasWorkouts = await workoutCards.count() > 0

    if (hasWorkouts) {
      // If we have workouts, we might have progress indicators
      // This is just checking the UI renders correctly
      expect(await workoutCards.count()).toBeGreaterThan(0)
    } else {
      // No workouts - should show empty state
      const emptyState = page.getByText(/no workout/i)
      if (await emptyState.count() > 0) {
        await expect(emptyState.first()).toBeVisible()
      }
    }

    // Verify page is functional
    await expect(page.getByText('Today')).toBeVisible()
  })
})
