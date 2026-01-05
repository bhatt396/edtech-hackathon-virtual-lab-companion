# Quick Reference: React Router → Next.js App Router

This guide provides quick reference for the differences between the old Vite/React Router codebase and the new Next.js App Router implementation.

## Routing Comparison

### React Router (Old)
```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/user/:id" element={<UserPage />} />
  </Routes>
</BrowserRouter>
```

### Next.js App Router (New)
```
app/
├── page.tsx           → "/"
├── about/
│   └── page.tsx      → "/about"
└── user/
    └── [id]/
        └── page.tsx  → "/user/:id"
```

## Navigation Comparison

### React Router (Old)
```tsx
import { useNavigate, useParams, Link } from 'react-router-dom';

function Component() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Navigate programmatically
  navigate('/dashboard');
  navigate(-1); // Go back
  
  // Links
  return <Link to="/about">About</Link>;
}
```

### Next.js (New)
```tsx
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

function Component() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // Navigate programmatically
  router.push('/dashboard');
  router.back(); // Go back
  
  // Links
  return <Link href="/about">About</Link>;
}
```

## File Structure Comparison

### Old Structure (Vite)
```
src/
├── main.tsx          # Entry point
├── App.tsx           # Router setup
├── pages/            # Page components
│   ├── Home.tsx
│   └── About.tsx
└── components/       # Reusable components
```

### New Structure (Next.js)
```
app/                   # Next.js App Router
├── layout.tsx        # Root layout
├── page.tsx          # Home page
└── about/
    └── page.tsx      # About page

src/                   # Existing code (unchanged)
├── pages/            # Page components (used by app/ routes)
└── components/       # Reusable components
```

## Provider Setup Comparison

### React Router (Old)
```tsx
// App.tsx
import { QueryClientProvider } from '@tanstack/react-query';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>...</Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### Next.js (New)
```tsx
// app/layout.tsx
import { Providers } from '@/components/providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// src/components/providers.tsx
"use client";

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

## Redirect Comparison

### React Router (Old)
```tsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute() {
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Component />;
}
```

### Next.js (New)
```tsx
import { redirect } from 'next/navigation';

function ProtectedRoute() {
  if (!authenticated) {
    redirect('/login');
  }
  return <Component />;
}
```

## Dynamic Routes Comparison

### React Router (Old)
```tsx
// Route definition
<Route path="/experiment/:id" element={<ExperimentPage />} />

// Component
import { useParams } from 'react-router-dom';

function ExperimentPage() {
  const { id } = useParams(); // id is string | undefined
  return <div>Experiment {id}</div>;
}
```

### Next.js (New)
```
app/experiment/[id]/page.tsx
```

```tsx
// Component
import { useParams } from 'next/navigation';

function ExperimentPage() {
  const params = useParams();
  const id = params?.id as string; // Cast as needed
  return <div>Experiment {id}</div>;
}
```

## Client vs Server Components

### Old (everything is client)
```tsx
// All components are client-rendered
function Component() {
  const [state, setState] = useState();
  return <div>...</div>;
}
```

### New (explicit client components)
```tsx
// Client component (uses hooks, event handlers, etc.)
"use client";

function Component() {
  const [state, setState] = useState();
  return <div>...</div>;
}

// Server component (default, can fetch data)
async function Component() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

## Package Scripts Comparison

### Old (Vite)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### New (Next.js)
```json
{
  "scripts": {
    "dev": "next dev -p 8080",
    "build": "next build",
    "start": "next start -p 8080",
    "lint": "next lint"
  }
}
```

## Common Gotchas

### 1. useParams type difference
```tsx
// ❌ Old way (doesn't work in Next.js)
const { id } = useParams();

// ✅ New way
const params = useParams();
const id = params?.id as string;
```

### 2. Client directive required
```tsx
// ❌ Missing directive (causes error)
function Component() {
  const [state, setState] = useState();
  return <div>...</div>;
}

// ✅ With directive
"use client";

function Component() {
  const [state, setState] = useState();
  return <div>...</div>;
}
```

### 3. Redirect must be called before JSX
```tsx
// ❌ Wrong (redirect after return)
function Page() {
  return (
    <>
      {!auth && redirect('/login')}
      <Component />
    </>
  );
}

// ✅ Correct (redirect before return)
function Page() {
  if (!auth) {
    redirect('/login');
  }
  return <Component />;
}
```

### 4. Import from correct package
```tsx

// ❌ Wrong package
import { useRouter } from 'react-router-dom';
import { useRouter } from 'next/router'; // Pages Router

// ✅ Correct package (App Router)
import { useRouter } from 'next/navigation';
```

## Migration Checklist

When migrating a component:

- [ ] Replace `react-router-dom` imports with `next/navigation`
- [ ] Change `useNavigate()` → `useRouter()`
- [ ] Change `navigate()` → `router.push()`
- [ ] Change `navigate(-1)` → `router.back()`
- [ ] Update `useParams()` typing
- [ ] Add `"use client"` if using hooks
- [ ] Replace `<Link to=...>` → `<Link href=...>`
- [ ] Update redirects to use `redirect()` before JSX
- [ ] Test the component

## Additional Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js Navigation](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating)
- [Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

---

**Last Updated**: 2026-01-05
