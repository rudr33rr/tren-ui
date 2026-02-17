# TrenUI

A modern workout and exercise tracking application built with Next.js, Supabase, and TypeScript.

## 📋 Overview

TrenUI is a comprehensive fitness tracking platform that helps users manage their workouts, track progress, and explore exercise libraries. The application provides an intuitive interface for creating custom workout routines and monitoring fitness goals.

## ✨ Features

- **Dashboard**: Overview of your fitness journey with last completed workout tracking
- **Workout Management**: Create, edit, and manage custom workout routines
- **Exercise Library**: Browse and search exercises with detailed form instructions
- **Workout Sessions**: Track and complete workout sessions
- **Progress Tracking**: Monitor your fitness progress over time
- **User Authentication**: Secure sign-up, login, and password recovery
- **Dark/Light Theme**: System-aware theme switching with manual override
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) with [Radix UI](https://www.radix-ui.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Font**: [Geist Sans](https://vercel.com/font)

## 📁 Project Structure

```
tren-ui/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages (login, sign-up, etc.)
│   ├── dashboard/         # Main application pages
│   │   ├── exercises/     # Exercise library
│   │   ├── progress/      # Progress tracking
│   │   └── workouts/      # Workout management
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── shared/           # Shared components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── stores/               # Zustand state management stores
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 20 or later
- npm, yarn, or pnpm
- A Supabase account and project

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mRud3r/tren-ui.git
   cd tren-ui
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up Supabase**

   - Create a new project at [database.new](https://database.new)
   - Get your project URL and anon key from [Project Settings > API](https://supabase.com/dashboard/project/_/settings/api)

4. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🗄️ Database Schema

The application uses Supabase with the following main tables:
- `workout_session` - Stores workout session data
- `workouts` - Stores workout routines
- `exercises` - Exercise library
- `muscle_groups` - Muscle group classifications

## 🎨 Customization

### Theme

The application supports both dark and light themes. The theme switcher is available in the footer and respects system preferences by default.

### UI Components

UI components are built with shadcn/ui. To customize or add new components:

```bash
npx shadcn@latest add [component-name]
```

## 🚢 Deployment

### Deploy to Vercel

The easiest way to deploy TrenUI is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables
4. Deploy

### Environment Variables for Production

Make sure to set the following environment variables in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Links

- [Repository](https://github.com/mRud3r/tren-ui)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
