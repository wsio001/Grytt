# Smart Test Running Guide 🚀

## 🎯 Run Only Related Tests

### Option 1: Watch Mode (Recommended for Development)
**Automatically runs only tests affected by your changes:**

```bash
npm test
```

What it does:
- ✅ Watches for file changes
- ✅ Only runs tests related to changed files
- ✅ Blazing fast (only runs what's needed)
- ✅ Interactive - press keys to filter tests

**Keyboard shortcuts in watch mode:**
- `a` - Run all tests
- `f` - Run only failed tests
- `t` - Filter by test name pattern
- `p` - Filter by filename pattern
- `q` - Quit watch mode

**Example:**
```bash
# Start watch mode
npm test

# Make changes to src/components/ui/ExerciseCard.jsx
# Watch mode automatically runs only ExerciseCard.test.jsx
```

---

### Option 2: Test UI (Visual Interface)
**Interactive dashboard showing test results:**

```bash
npm run test:ui
```

Benefits:
- 🎨 Visual interface in browser
- 📊 See test coverage in real-time
- 🔍 Filter and search tests easily
- 📈 Performance metrics

Opens at: `http://localhost:51204/__vitest__/`

---

### Option 3: Run Tests for Changed Files Only
**Only run tests for files changed since last git commit:**

```bash
npm run test:changed
```

Great for:
- Pre-commit checks
- Quick validation before push
- CI/CD pipelines

---

### Option 4: Run Specific Test File
**Run a single test file:**

```bash
npm test -- LoginScreen
# or
npm test -- ExerciseCard.test.jsx
```

---

### Option 5: Filter by Pattern
**Run tests matching a pattern:**

```bash
# Run all component tests
npm test -- components/ui

# Run all integration tests
npm test -- integration

# Run all tests with "Login" in the name
npm test -- Login
```

---

## 🚀 Recommended Workflow

### During Active Development:
```bash
npm test
```
Leave this running in a terminal. It watches files and runs related tests automatically.

### Before Committing:
```bash
npm run test:changed
```
Quickly verify only the tests affected by your changes.

### Full Test Suite (CI/CD):
```bash
npm run test:run
npm run test:coverage
```

---

## 💡 How Vitest Determines "Related" Tests

Vitest is smart about finding related tests:

1. **Direct imports**: If you change `ExerciseCard.jsx`, it runs `ExerciseCard.test.jsx`
2. **Dependency chain**: If you change a component used by 3 others, it runs all 4 test files
3. **Integration tests**: If you change a file used in integration tests, those run too

**Example:**
```
You edit: src/lib/supabase.js
Vitest runs:
  ✓ src/lib/supabase.test.js (direct test)
  ✓ src/hooks/useDebouncedSave.test.js (imports supabase)
  ✓ src/__tests__/AuthFlow.integration.test.jsx (uses supabase)
  ✓ src/__tests__/DataSync.integration.test.jsx (uses supabase)
```

---

## 🎨 VS Code Integration (Optional)

Install the **Vitest extension** for VS Code:
- Run tests from the editor
- See test status inline
- Debug tests with breakpoints
- Click to jump to failing tests

Extension ID: `vitest.explorer`

---

## ⚡ Performance Tips

1. **Use watch mode during development** - fastest feedback
2. **Run full suite only before commits** - catches edge cases
3. **Use test:ui for debugging** - visual feedback helps
4. **Keep tests fast** - mock expensive operations
5. **Use test:changed for quick checks** - validate your changes

---

## 📊 Coverage Reports

Generate coverage after changes:
```bash
npm run test:coverage
```

View HTML report:
```bash
open coverage/index.html
```

Coverage is also shown in test:ui interface!

---

## 🔥 Quick Reference

| Command | When to Use |
|---------|-------------|
| `npm test` | Active development (watch mode) |
| `npm run test:ui` | Visual debugging |
| `npm run test:changed` | Pre-commit validation |
| `npm run test:run` | CI/CD, full validation |
| `npm test -- Pattern` | Run specific tests |
| `npm run test:coverage` | Check coverage metrics |

---

**Happy testing! 🚀**
