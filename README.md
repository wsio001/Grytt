# Grytt

A personal workout tracking web app built with React, Vite, and Tailwind CSS. Track your daily workouts, plan your training schedule, and manage your exercise library with drag-and-drop functionality.

## Features

- **Today View**: Log and track your daily workouts
- **Planner View**: Plan your training schedule in advance
- **Library View**: Manage your exercise library (30 default exercises included)
- **Settings View**: Customize your app preferences
- **Auto-save**: Changes automatically sync to Supabase after 1.2 seconds
- **Drag & Drop**: Intuitive exercise organization with custom drag-and-drop
- **Cloud Sync**: All data stored securely in Supabase

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (Auth + Database)
- **State Management**: React hooks with custom drag reducer

## Project Structure

```
src/
├── App.jsx                      # Main app component with routing and auth
├── constants.js                 # Shared constants and helper functions
├── data/
│   └── defaultExercises.js      # 30 default exercises
├── lib/
│   └── supabase.js              # Supabase auth, load, and save functions
├── hooks/
│   ├── useDebouncedSave.js      # Auto-save hook (1.2s debounce)
│   └── useDragReducer.js        # Drag and drop state management
└── components/
    ├── LoginScreen.jsx          # Simple name-based login
    ├── TodayView.jsx            # Daily workout tracking
    ├── PlannerView.jsx          # Training schedule planner
    ├── LibraryView.jsx          # Exercise library management
    ├── SettingsView.jsx         # App settings
    ├── ExerciseModal.jsx        # Exercise editing modal
    └── DropZone.jsx             # Drag and drop zone component
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd Grytt
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_WILLIAM_EMAIL=your_email
   VITE_WILLIAM_PASSWORD=your_password
   VITE_DEMO_EMAIL=demo_email
   VITE_DEMO_PASSWORD=demo_password
   ```

### Supabase Setup

Create a table named `app_state` in your Supabase project:

```sql
CREATE TABLE app_state (
  user_id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;
```

### Running the App

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Authentication

The app uses a simple name-based authentication system:
- Enter "William" or "Demo" in the login screen
- Credentials are mapped to Supabase user accounts via environment variables
- All user data is stored per-user in the `app_state` table

## Data Storage

All app state (workouts, exercises, settings) is stored as a single JSONB blob per user in Supabase. This approach:
- Simplifies data management
- Enables automatic syncing
- Reduces database complexity
- Allows flexible schema evolution

## Development

- **Auto-save**: All state changes trigger an auto-save after 1.2 seconds of inactivity
- **Hot reload**: Vite provides instant hot module replacement during development
- **Tailwind**: Utility-first CSS for rapid UI development

## License

Private project - All rights reserved

## Author

William
