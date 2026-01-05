# Virtual Lab Companion - Next.js

An interactive virtual laboratory platform for students and teachers, featuring physics, chemistry, and biology experiments with 2D, 3D, and animated visualizations.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **3D Graphics**: Three.js + React Three Fiber
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **State Management**: React Query
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18.x or higher (20.x+ recommended for optimal Next.js and Firebase performance)
- npm 8.x or higher

## 🛠️ Installation

Due to peer dependency conflicts with `@react-three/drei` and React 19, use the legacy peer deps flag:

```bash
npm install --legacy-peer-deps
```

Or use the provided script:

```bash
npm run install:clean
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Homepage
│   ├── login/               # Login route
│   ├── choose-role/         # Role selection route
│   ├── teacher/             # Teacher dashboard route
│   ├── student/             # Student dashboard route
│   ├── experiment/[id]/     # Dynamic experiment routes
│   ├── library/             # Experiment library route
│   └── not-found.tsx        # 404 page
│
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── classroom/      # Classroom management
│   │   ├── common/         # Shared components (Navbar, etc.)
│   │   ├── lab/            # Lab-specific components
│   │   ├── ui/             # shadcn/ui components
│   │   └── providers.tsx   # Client-side providers wrapper
│   │
│   ├── experiments/        # Experiment visualizations
│   │   ├── twoD/          # 2D simulations
│   │   ├── threeD/        # 3D simulations
│   │   ├── animated/      # Animated explanations
│   │   └── interactive/   # Interactive experiments
│   │
│   ├── pages/              # Page components (used by app routes)
│   │   ├── teacher/
│   │   ├── student/
│   │   └── ...
│   │
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Libraries (Firebase, utils)
│   ├── context/            # React contexts
│   ├── data/               # Static data (experiments.json)
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   └── index.css           # Global styles
│
├── public/                  # Static assets
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## 🔥 Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Google Sign-In)
3. Create a Firestore database
4. Copy your Firebase config
5. Create `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

For detailed setup instructions, see `FIREBASE_SETUP_GUIDE.md`

## 🎓 Features

### For Teachers
- Create and manage virtual classrooms
- Assign experiments to students
- View student experiment submissions
- Track student progress

### For Students
- Join classrooms with invite codes
- Perform virtual experiments
- Record observations
- Submit experiment reports
- Access assigned experiments

### Experiments
- **Physics**: Projectile Motion, Simple Pendulum, Ohm's Law, Solar System
- **Chemistry**: Acid-Base Titration
- **Biology**: Microscope Cell Observation

Each experiment includes:
- 2D simulations
- 3D interactive visualizations
- Animated explanations
- Step-by-step procedures
- Objectives and apparatus lists
- Observation recording
- Viva questions

## 🔄 Recent Migration

This project was recently migrated from Vite + React Router to Next.js App Router. See `NEXTJS_MIGRATION.md` for details about the migration process.

### Key Changes
- ✅ Migrated from `react-router-dom` to Next.js App Router
- ✅ All routing now uses `next/navigation`
- ✅ Server-side rendering capabilities
- ✅ Automatic code splitting
- ✅ Built-in Font optimization
- ✅ Image optimization support

## 📝 Development Notes

### Client vs Server Components
- Most components use hooks and must be client components (`"use client"`)
- Route pages include authentication logic and are client components
- Future optimization: Move static content to server components

### Dynamic Routes
- Experiment pages use Next.js dynamic routes: `/experiment/[id]`
- Parameters are accessed via `useParams()` from `next/navigation`

### Peer Dependencies
- The project uses `--legacy-peer-deps` due to React Three Fiber compatibility
- This is a known issue and does not affect functionality

## 🐛 Known Issues

See `NEXTJS_MIGRATION.md` for a comprehensive list of known issues and their solutions.

## 📚 Additional Documentation

- `NEXTJS_MIGRATION.md` - Detailed migration documentation
- `FIREBASE_SETUP_GUIDE.md` - Firebase configuration guide
- `AI_ASSISTANT_SETUP.md` - AI assistant integration guide
- `MOBILE_ACCESS_SETUP.md` - Mobile access configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is part of an educational hackathon.

## 🙏 Acknowledgments

- Built with Next.js, React, and Firebase
- UI components from shadcn/ui and Radix UI
- 3D visualizations powered by Three.js and React Three Fiber
- Icons from Lucide React

---

**Version**: 1.0.0 (Post Next.js Migration)  
**Last Updated**: 2026-01-05
