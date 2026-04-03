# Grytt App - iPhone Sideload Optimization Plan

**Status**: Pre-Production
**Target**: iOS Sideload Deployment
**Current Bundle**: 397KB JS (118KB gzipped), 49KB CSS (7KB gzipped)
**Test Coverage**: 85/88 passing (97%)

---

## Executive Summary

The app is **60% production-ready** for iPhone sideloading. Core functionality is solid, but critical PWA features and performance optimizations are missing.

**Estimated Work**: 10-14 hours total
**Priority**: Focus on PWA manifest, service worker, and code splitting first

---

## Phase 1: PWA Enablement (HIGH PRIORITY)
**Time Estimate**: 3-4 hours
**Impact**: Enable standalone app installation on iPhone

### 1.1 Create PWA Manifest
**File**: `/public/manifest.json`

```json
{
  "name": "Grytt - Fitness Tracker",
  "short_name": "Grytt",
  "description": "Track workouts, plan exercises, and achieve your fitness goals",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#111827",
  "theme_color": "#1f2937",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Tasks**:
- [ ] Create manifest.json in /public
- [ ] Generate icon-192.png and icon-512.png (use Dumbbell logo)
- [ ] Add manifest link to index.html: `<link rel="manifest" href="/manifest.json">`
- [ ] Add apple-touch-icon: `<link rel="apple-touch-icon" href="/icons/icon-180.png">`

### 1.2 Generate App Icons
**Files**: `/public/icons/icon-{180,192,512}.png`

**Source**: Use lucide-react Dumbbell icon as base
- 180x180px: Apple touch icon (iPhone home screen)
- 192x192px: Android/PWA icon
- 512x512px: High-res PWA icon

**Tool**: Use Figma, Canva, or icon generator
- Background: #fb923c (orange-400)
- Icon: White dumbbell centered
- Padding: 20% margins

**Tasks**:
- [ ] Create /public/icons directory
- [ ] Generate 3 PNG icons with Grytt branding
- [ ] Test appearance on iPhone home screen

---

## Phase 2: Offline Support (HIGH PRIORITY)
**Time Estimate**: 3-4 hours
**Impact**: Enable offline access and faster loading

### 2.1 Implement Service Worker
**File**: `/public/service-worker.js`

**Strategy**: Cache-first for assets, Network-first for API

```javascript
const CACHE_NAME = 'grytt-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js'
];

// Cache assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

**Tasks**:
- [ ] Create service-worker.js in /public
- [ ] Register service worker in src/main.jsx
- [ ] Add cache version increment on deploy
- [ ] Test offline functionality in DevTools
- [ ] Consider Workbox for advanced caching

### 2.2 Register Service Worker
**File**: `src/main.jsx`

Add after ReactDOM.createRoot():

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
```

**Tasks**:
- [ ] Add service worker registration to main.jsx
- [ ] Test registration in Chrome DevTools
- [ ] Verify cache updates on refresh

---

## Phase 3: Bundle Optimization (HIGH PRIORITY)
**Time Estimate**: 2-3 hours
**Impact**: Reduce initial load by 20-30%

### 3.1 Implement Code Splitting
**File**: `src/App.jsx`

**Current** (lines 4-7):
```javascript
import TodayView from "./components/views/TodayView/TodayView";
import PlannerView from "./components/views/PlannerView/PlannerView";
import LibraryView from "./components/views/LibraryView/LibraryView";
import SettingsView from "./components/views/SettingsView/SettingsView";
```

**Optimized**:
```javascript
import { lazy, Suspense } from "react";

const TodayView = lazy(() => import("./components/views/TodayView/TodayView"));
const PlannerView = lazy(() => import("./components/views/PlannerView/PlannerView"));
const LibraryView = lazy(() => import("./components/views/LibraryView/LibraryView"));
const SettingsView = lazy(() => import("./components/views/SettingsView/SettingsView"));
```

Wrap view rendering in Suspense (around line 267):
```javascript
<Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
  {view === "today" && <TodayView ... />}
  {view === "planner" && <PlannerView ... />}
  {view === "library" && <LibraryView ... />}
  {view === "goal" && <SettingsView ... />}
</Suspense>
```

**Tasks**:
- [ ] Convert static imports to React.lazy()
- [ ] Add Suspense wrapper with loading state
- [ ] Test tab switching for lazy load behavior
- [ ] Verify bundle chunks created in dist/

### 3.2 Strip Console Logs in Production
**File**: `vite.config.js`

Add build configuration:

```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js'],
          'icons': ['lucide-react']
        }
      }
    }
  }
})
```

**Impact**: Removes 41 console calls, saves ~2KB + CPU overhead

**Tasks**:
- [ ] Add build config to vite.config.js
- [ ] Install terser if not present: `npm install -D terser`
- [ ] Rebuild and verify no console output
- [ ] Test production build: `npm run build && npm run preview`

### 3.3 Lazy Load Default Exercises
**Files**:
- `src/data/defaultExercises.js` (current: bundled)
- `public/data/default-exercises.json` (new: loaded on demand)

Move defaultExercises to public JSON file, load on first Library view access.

**Tasks**:
- [ ] Create /public/data/default-exercises.json
- [ ] Update ExerciseLibraryModal to lazy-load exercises
- [ ] Add loading state while fetching
- [ ] Fallback to empty array if fetch fails

---

## Phase 4: Build Configuration (MEDIUM PRIORITY)
**Time Estimate**: 1-2 hours
**Impact**: Production-grade build settings

### 4.1 Optimize Vite Build
**File**: `vite.config.js`

Complete optimized configuration:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js'],
          'icons': ['lucide-react']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 600
  },
  server: {
    port: 3000
  }
})
```

**Tasks**:
- [ ] Update vite.config.js with full build config
- [ ] Test build output in dist/
- [ ] Verify chunk sizes with `npm run build`
- [ ] Check lighthouse score

### 4.2 Environment Variables
**Files**:
- `.env.production` (new)
- `.env.development` (update)

Add feature flags:

```bash
# .env.production
VITE_ENABLE_CONSOLE=false
VITE_ENABLE_ANALYTICS=true

# .env.development
VITE_ENABLE_CONSOLE=true
VITE_ENABLE_ANALYTICS=false
```

**Tasks**:
- [ ] Create .env.production
- [ ] Update console calls to check VITE_ENABLE_CONSOLE
- [ ] Add to .gitignore if not already present

---

## Phase 5: Testing & Validation (HIGH PRIORITY)
**Time Estimate**: 2-3 hours
**Impact**: Ensure optimizations don't break functionality

### 5.1 Performance Testing
**Tools**: Lighthouse, Chrome DevTools

**Metrics to Verify**:
- [ ] Performance score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3s
- [ ] Total bundle size < 150KB gzipped
- [ ] Main thread blocking < 200ms

**Tasks**:
- [ ] Run Lighthouse audit on production build
- [ ] Check Network tab for chunk loading
- [ ] Verify service worker caching in Application tab
- [ ] Test on throttled 3G connection

### 5.2 iPhone Testing
**Device**: iPhone with iOS 15+

**Checklist**:
- [ ] Install PWA to home screen
- [ ] Verify standalone mode (no Safari UI)
- [ ] Test offline functionality
- [ ] Check safe area insets (notch/dynamic island)
- [ ] Test touch interactions
- [ ] Verify responsive layout on iPhone SE, 14, 15 Pro Max
- [ ] Test background/foreground transitions
- [ ] Verify data persistence after app close

### 5.3 Regression Testing
**Ensure existing tests still pass**:

```bash
npm run test:run
```

Expected: 85/88 passing (3 skipped)

**Tasks**:
- [ ] Run full test suite after each optimization
- [ ] Add new tests for lazy loading if needed
- [ ] Update snapshots if UI changes

---

## Phase 6: Additional Optimizations (LOW PRIORITY)
**Time Estimate**: 2-3 hours
**Impact**: Polish and refinement

### 6.1 Cache Invalidation
**File**: `src/hooks/useDebouncedSave.js`

Add version checking to localStorage cache:

```javascript
const CACHE_VERSION = '1.0.0';
const CACHE_KEY = `grytt_data_cache_v${CACHE_VERSION}`;

// On load, check version and invalidate if old
const loadCache = () => {
  const cache = localStorage.getItem(CACHE_KEY);
  if (!cache) return null;

  const { version, data } = JSON.parse(cache);
  if (version !== CACHE_VERSION) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
  return data;
};
```

**Tasks**:
- [ ] Add version to cache key
- [ ] Implement cache invalidation logic
- [ ] Test cache clearing on version bump

### 6.2 Touch Optimizations
**File**: `src/index.css`

Add iOS-specific touch optimizations:

```css
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* Allow selection for inputs */
input, textarea {
  -webkit-user-select: text;
  user-select: text;
}
```

**Tasks**:
- [ ] Add touch CSS to index.css
- [ ] Test on iPhone for selection behavior
- [ ] Ensure inputs still allow text selection

### 6.3 Background Sync
**File**: New - `src/utils/backgroundSync.js`

Implement Background Sync API for offline changes:

**Tasks**:
- [ ] Check Background Sync API support
- [ ] Queue failed Supabase requests
- [ ] Retry on reconnection
- [ ] Add sync status indicator in UI

---

## Implementation Checklist

### Pre-Implementation
- [ ] Create feature branch: `git checkout -b optimize-for-ios`
- [ ] Backup current working state
- [ ] Document current bundle size baseline

### Phase 1: PWA (Day 1)
- [ ] Create manifest.json
- [ ] Generate app icons (180, 192, 512px)
- [ ] Update index.html with manifest and icon links
- [ ] Test PWA installability in Chrome

### Phase 2: Offline (Day 1-2)
- [ ] Create service-worker.js
- [ ] Register service worker in main.jsx
- [ ] Test offline mode in DevTools
- [ ] Verify cache updates

### Phase 3: Bundle (Day 2)
- [ ] Implement lazy loading for views
- [ ] Add Suspense fallback
- [ ] Update vite.config.js with terser
- [ ] Move defaultExercises to JSON

### Phase 4: Build Config (Day 2-3)
- [ ] Complete vite.config.js optimization
- [ ] Add environment variables
- [ ] Test production build

### Phase 5: Testing (Day 3)
- [ ] Run Lighthouse audit
- [ ] Test on iPhone device
- [ ] Run full test suite
- [ ] Fix any regressions

### Phase 6: Polish (Day 3-4)
- [ ] Add cache versioning
- [ ] Implement touch optimizations
- [ ] Consider background sync
- [ ] Final performance check

### Post-Implementation
- [ ] Create pull request with optimization changes
- [ ] Document bundle size improvements
- [ ] Update README with PWA installation instructions
- [ ] Merge to main and deploy

---

## Success Metrics

### Before Optimization
- Bundle: 397KB JS (118KB gzipped), 49KB CSS (7KB gzipped)
- PWA: Not installable
- Offline: Not supported
- Lighthouse: Unknown (estimate ~70-75)
- Code Splitting: None
- Console Logs: 41 in production

### Target After Optimization
- Bundle: <100KB gzipped (15-20% reduction)
- PWA: Fully installable on iOS
- Offline: Full offline support
- Lighthouse: >90 performance score
- Code Splitting: 4 lazy-loaded routes
- Console Logs: 0 in production

---

## Risk Assessment

### Low Risk (Safe to implement)
- PWA manifest.json
- App icon generation
- Console log stripping
- Touch CSS optimizations

### Medium Risk (Test thoroughly)
- Code splitting (could break hot module reload)
- Service worker (could cause caching issues)
- Lazy loading (could introduce loading states)

### High Risk (Requires careful testing)
- Vite build config changes (could break production build)
- Cache invalidation (could lose user data)
- Background sync (browser support varies)

---

## Rollback Plan

If optimizations cause issues:

1. **Service Worker Issues**: Unregister SW via DevTools or add `/unregister-sw` route
2. **Build Errors**: Revert vite.config.js to minimal config
3. **Lazy Load Breaks**: Revert to static imports temporarily
4. **Cache Problems**: Clear localStorage and reload
5. **Full Rollback**: `git reset --hard` to pre-optimization commit

---

## Resources

### Documentation
- [PWA Manifest Spec](https://web.dev/add-manifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [React Lazy Loading](https://react.dev/reference/react/lazy)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Workbox](https://developers.google.com/web/tools/workbox) - Advanced SW library
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) - Icon generator
- [Bundle Analyzer](https://www.npmjs.com/package/rollup-plugin-visualizer) - Visualize bundle

### Testing
- Chrome DevTools > Application > Service Workers
- Chrome DevTools > Network > Throttling (Slow 3G)
- Chrome DevTools > Lighthouse
- iOS Safari > Add to Home Screen

---

## Notes

- This plan prioritizes PWA functionality for iPhone sideloading
- All optimizations maintain existing 85/88 test pass rate
- Bundle size reduction is secondary to offline functionality
- Safe area support already implemented (good for iPhone notch)
- Responsive design already mobile-first (minimal changes needed)

**Estimated Total Time**: 10-14 hours spread across 3-4 days
**Risk Level**: Medium (thorough testing required)
**Production Ready**: After Phase 5 completion
