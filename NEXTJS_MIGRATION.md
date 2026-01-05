# Next.js Migration - Virtual Lab Companion

This document outlines the successful migration from Vite + React Router to Next.js App Router.

## Migration Summary

### What Was Changed

#### 1. **Project Structure**
- **Created `app/` directory** for Next.js App Router
- **Kept `src/` directory** with all existing components, hooks, lib, and page components
- **Route structure migration**:
  - `/` → `app/page.tsx` (Landing page)
  - `/login` → `app/login/page.tsx`
  - `/choose-role` → `app/choose-role/page.tsx`
  - `/teacher` → `app/teacher/page.tsx`
  - `/student` → `app/student/page.tsx`
  - `/experiment/:id` → `app/experiment/[id]/page.tsx` (Dynamic route)
  - `/library` → `app/library/page.tsx`

#### 2. **Configuration Files**
- ✅ **Created**: `next.config.ts` - Next.js configuration
- ✅ **Updated**: `package.json` - Next.js scripts and dependencies
- ✅ **Updated**: `tsconfig.json` - Next.js TypeScript config
- ✅ **Updated**: `.gitignore` - Added `.next` and `out` directories
- 🔧 **Kept**: `tailwind.config.ts`, `postcss.config.js` (no changes needed)
- ❌ **Deprecated**: `vite.config.ts` (no longer used, but kept for reference)

#### 3. **Routing Migration**
- **Replaced** all `react-router-dom` imports with `next/navigation`
- **Updated** `useNavigate()` → `useRouter()`
- **Updated** `useParams()` → `useParams()` from Next.js (with different typing)
- **Updated** `navigate()` → `router.push()`
- **Updated** `navigate(-1)` → `router.back()`

#### 4. **File Changes**

**Pages Updated:**
- ✅ `src/pages/LandingPage.tsx` - useRouter for navigation
- ✅ `src/pages/ExperimentPage.tsx` - useRouter + useParams (Next.js)
- ✅ `src/pages/ExperimentLibrary.tsx` - useRouter
- ✅ `src/pages/ChooseRole.tsx` - useRouter
- ✅ `src/pages/teacher/TeacherDashboard.tsx` - useRouter
- ✅ `src/pages/student/StudentDashboard.tsx` - useRouter

**Components Updated:**
- ✅ `src/components/common/Navbar.tsx` - useRouter
- ✅ `src/components/auth/Login.tsx` - Removed unused navigate import
- ✅ **Created** `src/components/providers.tsx` - Client-side providers wrapper

**New Files Created:**
- ✅ `app/layout.tsx` - Root layout with fonts and providers
- ✅ `app/page.tsx` - Home page with auth logic
- ✅ `app/login/page.tsx`, `app/choose-role/page.tsx`, etc.
- ✅ `app/not-found.tsx` - 404 page

### What Was NOT Changed

✅ **All business logic remains intact**
✅ **All UI components unchanged** (`src/components/`)
✅ **All hooks unchanged** (`src/hooks/`)
✅ **All utilities unchanged** (`src/lib/`, `src/utils/`)
✅ **All experiment components unchanged** (`src/experiments/`)
✅ **All data files unchanged** (`src/data/`)
✅ **All services unchanged** (`src/services/`)
✅ **No component renames** - all components keep their original names
✅ **No feature removals** - all existing features preserved

## How to Run

### Development
```bash
npm run dev
```
Server will start at `http://localhost:8080`

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Known Issues & Notes

### 1. **Client Components**
- Most components that use hooks need `"use client"` directive
- The `Providers` component and all route pages are client components
- Static components (pure UI) can remain server components

### 2. **Dynamic Routes**
- The experiment ID route uses Next.js dynamic segments: `[id]/page.tsx`
- `useParams()` from Next.js returns params as potentially undefined, so we cast as needed

### 3. **Authentication Flow**
- Authentication redirects now use `redirect()` from `next/navigation`
- Loading states handled before redirects to prevent hydration errors

### 4. **Styling**
- All Tailwind CSS continues to work as-is
- Global styles from `src/index.css` are imported in `app/layout.tsx`
- Font optimization now uses Next.js built-in font optimization

## Dependencies

### Added
- `next` (^16.1.1)
- Automatically installs compatible React 19

### Removed
- `react-router-dom` ❌
- All Vite-related devDependencies can be removed (kept for now)

### Updated
- `react` → 19.x (automatically by Next.js)
- `react-dom` → 19.x (automatically by Next.js)

## Migration Checklist

- [x] Install Next.js
- [x] Create `app/` directory structure
- [x] Create root `layout.tsx`
- [x] Migrate all routes to `page.tsx` files
- [x] Update all navigation imports (`react-router-dom` → `next/navigation`)
- [x] Create client-side components wrapper (Providers)
- [x] Update authentication redirects
- [x] Update TypeScript config for Next.js
- [x] Update package.json scripts
- [x] Remove `react-router-dom` dependency
- [x] Add Next.js to `.gitignore`
- [x] Test all routes
- [ ] Delete old Vite config (optional)
- [ ] Remove Vite devDependencies (optional)

## Testing the Migration

1. **Homepage** (`/`) - Should show landing page or redirect if authenticated
2. **Login** (`/login`) - Should show login page
3. **Role Selection** (`/choose-role`) - Should work with authentication guard
4. **Teacher Dashboard** (`/teacher`) - Should require teacher role
5. **Student Dashboard** (`/student`) - Should require student role
6. **Experiment Pages** (`/experiment/[id]`) - Should load dynamically
7. **Library** (`/library`) - Should show all experiments

## Next Steps

1. Test the application thoroughly
2. Remove old Vite files if no longer needed
3. Consider server-side rendering opportunities
4. OptimizeComponents that can be server components
5. Add metadata to each page for better SEO

## Support

If you encounter any issues:
1. Check that all imports are using `next/navigation` instead of `react-router-dom`
2. Ensure client components have `"use client"` directive
3. Verify all dynamic routes use correct `[param]` naming
4. Check console for hydration warnings

---

**Migration Completed: 2026-01-05**
**Next.js Version: 16.1.1**
**App Router: Yes**
