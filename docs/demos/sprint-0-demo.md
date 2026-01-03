# Sprint 0 Demo Script

**Duration:** 60 seconds
**Goal:** Demonstrate No-Fake Foundation is working

## Setup (before demo)

```bash
# Clean install
rm -rf node_modules packages/*/node_modules
pnpm install

# Run CI checks
pnpm typecheck
pnpm test
pnpm scan
```

## Demo Flow

### Part 1: No-Stub Scanner Enforcement (20 seconds)

1. **Show scanner works:**
   ```bash
   pnpm scan
   # Expected: Scanning 10 files... ✅ No violations found
   ```

2. **Demonstrate violation detection:**
   - Open `packages/renderer/src/App.tsx`
   - Add line: `const bad = new MockLLMGateway()`
   - Run: `pnpm scan`
   - Expected: ❌ Violation found with file/line number
   - Revert change

### Part 2: App Launches (No-Fake Compliant) (30 seconds)

3. **Build and launch app:**
   ```bash
   pnpm build
   pnpm dev
   ```

4. **Verify in app:**
   - ✅ Window opens with "KidModStudio" title
   - ✅ Workbench layout visible (3 columns)
   - ❌ NO "Export" button (not implemented yet)
   - ❌ NO "Crafty" window (not implemented yet)
   - → **No-Fake rule working!**

### Part 3: CI Pipeline (10 seconds)

5. **Show CI config:**
   - Open `.github/workflows/no-stub-scan.yml`
   - Explain: "Every commit runs scanner automatically"
   - Show: "Build breaks if violations found"

## Success Criteria

- [x] Scanner detects forbidden patterns
- [x] CI pipeline configured
- [x] App launches with basic shell
- [x] No fake/stub UI elements visible
- [x] E2E test passes
