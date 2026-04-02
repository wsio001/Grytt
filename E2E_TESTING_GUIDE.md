# E2E Testing Guide - Grytt

## Overview

This guide covers End-to-End (E2E) testing for Grytt using Playwright. E2E tests verify complete user workflows in real browsers, testing the entire application stack from UI to backend integration.

## What We Test

### Test Coverage

| Test Suite | Tests | What It Covers |
|------------|-------|----------------|
| **user-journey.spec.js** | 3 | Complete user flows from login to logout |
| **workout-logging.spec.js** | 5 | Workout tracking, auto-save, data persistence |
| **cross-device-sync.spec.js** | 4 | Multi-tab sync, localStorage, offline mode |
| **mobile.spec.js** | 6 | Mobile responsiveness, touch interactions |
| **Total** | **18** | Full application testing |

### Browser Coverage

Tests run on:
- Desktop Chrome (Chromium)
- Desktop Safari (WebKit)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## Running E2E Tests

### Prerequisites

1. Install dependencies (already done):
```bash
npm install -D @playwright/test
npx playwright install chromium webkit
```

2. Create test account in Supabase:
   - Email: `test@example.com`
   - Password: `testpassword123`
   - This account is used by all E2E tests

### Quick Start

```bash
# Run all E2E tests (headless mode)
npm run test:e2e

# Run with browser UI visible
npm run test:e2e:headed

# Run with Playwright UI (interactive)
npm run test:e2e:ui

# Debug a specific test
npm run test:e2e:debug
```

### Running Specific Tests

```bash
# Run only user journey tests
npx playwright test user-journey

# Run only mobile tests
npx playwright test mobile

# Run a specific test file
npx playwright test e2e/workout-logging.spec.js

# Run tests matching a pattern
npx playwright test --grep "should log workout"
```

### Running on Specific Browsers

```bash
# Run only on Chrome
npx playwright test --project=chromium

# Run only on Safari
npx playwright test --project=webkit

# Run only mobile tests
npx playwright test --project="Mobile Chrome" --project="Mobile Safari"
```

## Test Structure

### User Journey Tests

**File:** `e2e/user-journey.spec.js`

Tests complete workflows:
- Login → Navigate app → Add exercise → Plan workout → Log workout → Logout
- Session persistence via localStorage
- Navigation between all main tabs

**Key Features:**
- Tests real authentication flow
- Verifies data persistence across page reloads
- Checks all major navigation paths

### Workout Logging Tests

**File:** `e2e/workout-logging.spec.js`

Tests workout tracking:
- Entering reps and weight
- Auto-save after 800ms debounce
- Pre-filling from previous workouts
- Multiple sets handling
- Clear/reset functionality
- Progress indicators

**Key Features:**
- Tests the core app functionality
- Verifies localStorage caching
- Ensures data persists correctly

### Cross-Device Sync Tests

**File:** `e2e/cross-device-sync.spec.js`

Tests data synchronization:
- Multi-tab sync (same user, different tabs)
- Logout and re-login persistence
- localStorage cache management
- Offline mode with localStorage fallback

**Key Features:**
- Opens multiple browser contexts
- Tests visibility API integration
- Verifies cloud sync (Supabase)

### Mobile Tests

**File:** `e2e/mobile.spec.js`

Tests mobile experience:
- Responsive layout on mobile viewports
- Safe area spacing for notched devices
- Touch interactions (tap, scroll)
- Mobile keyboard handling
- Portrait and landscape orientations

**Key Features:**
- Uses iPhone 12 device emulation
- Tests touch-specific interactions
- Verifies no horizontal scroll overflow

## Understanding Test Results

### Success Output

```
Running 18 tests using 4 workers

✓ e2e/user-journey.spec.js:5:1 › Complete User Journey › should complete full workout tracking flow (12s)
✓ e2e/workout-logging.spec.js:12:1 › Workout Logging › should log workout and auto-save (5s)
...

18 passed (1m 30s)
```

### Handling Failures

Common failure scenarios:

1. **Authentication Failures**
   ```
   Error: expect(locator).toBeVisible()
   Expected: visible
   Received: hidden
   ```
   - **Cause:** Test credentials not set up in Supabase
   - **Fix:** Create test account with email `test@example.com`

2. **Timeout Errors**
   ```
   TimeoutError: Timeout 5000ms exceeded
   ```
   - **Cause:** Element not loading in time
   - **Fix:** Check if dev server is running, increase timeout

3. **Network Errors**
   ```
   Error: net::ERR_CONNECTION_REFUSED
   ```
   - **Cause:** Dev server not running
   - **Fix:** Start dev server with `npm run dev`

### Viewing Test Reports

After running tests:

```bash
# View HTML report (opens in browser)
npx playwright show-report

# Report location
open playwright-report/index.html
```

Reports include:
- Test execution timeline
- Screenshots on failure
- Video recordings (on retry)
- Network logs
- Console logs

## Test Configuration

### playwright.config.js

Key settings:

```javascript
{
  testDir: './e2e',              // E2E tests location
  fullyParallel: true,           // Run tests in parallel
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',     // Capture trace on retry
    screenshot: 'only-on-failure', // Screenshot on fail
  },
  webServer: {
    command: 'npm run dev',      // Auto-start dev server
    url: 'http://localhost:5173',
    reuseExistingServer: true,   // Use existing if running
  }
}
```

### Customizing Tests

You can modify test behavior by editing the config:

```javascript
// Increase timeout for slow tests
use: {
  timeout: 60000, // 60 seconds per test
}

// Enable video recording
use: {
  video: 'on', // or 'retain-on-failure'
}

// Run in headed mode by default
use: {
  headless: false,
}
```

## Writing New E2E Tests

### Basic Test Template

```javascript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login before each test
    await page.goto('/')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'testpassword123')
    await page.click('button:has-text("Sign In")')
    await expect(page.getByText('Today')).toBeVisible({ timeout: 5000 })
  })

  test('should do something', async ({ page }) => {
    // Arrange
    await page.click('button:has-text("Today")')

    // Act
    const input = page.locator('input').first()
    await input.fill('test value')

    // Assert
    await expect(input).toHaveValue('test value')
  })
})
```

### Best Practices

1. **Use User-Facing Selectors**
   ```javascript
   // Good
   page.getByRole('button', { name: 'Sign In' })
   page.getByText('Today')
   page.getByPlaceholderText('Email')

   // Avoid
   page.locator('.btn-class')
   page.locator('#specific-id')
   ```

2. **Wait for Actions to Complete**
   ```javascript
   // Good
   await page.click('button')
   await expect(page.getByText('Success')).toBeVisible()

   // Avoid
   await page.click('button')
   // No wait - might fail if action is slow
   ```

3. **Handle Conditional UI**
   ```javascript
   const logoutButton = page.locator('button:has-text("Logout")')
   if (await logoutButton.count() > 0) {
     await logoutButton.click()
   }
   ```

4. **Clean Up After Tests**
   ```javascript
   test.afterEach(async ({ page }) => {
     // Logout or reset state
     const logout = page.locator('button:has-text("Logout")')
     if (await logout.count() > 0) {
       await logout.click()
     }
   })
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Dev Server Not Starting

```bash
# Check if port 5173 is in use
lsof -i :5173

# Kill process on port 5173
kill -9 $(lsof -t -i:5173)

# Start server manually
npm run dev
```

### Browser Installation Issues

```bash
# Reinstall browsers
npx playwright install --force chromium webkit

# Install system dependencies (Linux)
npx playwright install-deps
```

### Tests Failing Locally But Passing in CI

- Check viewport size matches
- Verify network conditions (offline tests)
- Check localStorage/cookies are cleared between runs
- Ensure test data is deterministic

### Debugging Flaky Tests

```bash
# Run test multiple times
npx playwright test --repeat-each=10 mobile.spec.js

# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## Performance

### Test Execution Times

Typical execution times:
- Unit tests (Vitest): < 10 seconds
- Component tests: < 30 seconds
- Integration tests: < 30 seconds
- E2E tests: 1-3 minutes

### Optimizing E2E Tests

1. **Run in Parallel**
   - Enabled by default (`fullyParallel: true`)
   - Uses 4 workers by default

2. **Reuse Authentication**
   ```javascript
   // Save auth state once
   test.beforeAll(async ({ browser }) => {
     const context = await browser.newContext()
     // Login once and save storage state
     await context.storageState({ path: 'auth.json' })
   })

   // Reuse in tests
   test.use({ storageState: 'auth.json' })
   ```

3. **Skip Unnecessary Browser Projects**
   ```bash
   # Only run Chrome tests for quick feedback
   npx playwright test --project=chromium
   ```

## Next Steps

After Phase 4 completion:
- ✅ 100+ total tests (Unit + Component + Integration + E2E)
- ✅ 80%+ code coverage
- ✅ All major user flows tested
- ✅ Cross-browser compatibility verified
- ✅ Mobile experience validated

**Ready for Production!** 🚀
