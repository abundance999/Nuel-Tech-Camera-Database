# Nuel Tech Camera Database

A mobile-first React + Vite application for logging and managing CCTV camera installations.

## Overview

This project provides a field-friendly interface for adding client installation records, searching across stored entries, and viewing summary statistics. It supports both public guest usage and admin mode, with in-app admin management and a dark theme toggle.

## Features

- Public and Admin modes with separate access behavior
- Add, edit, and delete client records
- Public users can add records and update most fields, while name/contact and existing credentials remain protected
- Admin users can manage all fields and delete records
- In-app admin email management UI for adding/removing admins
- Live search across location, system, installer, SIM number, and network
- Expandable client cards with detailed credentials, SIM info, and memory card size
- Summary dashboard with totals and breakdowns
- Floating action button for quick client creation
- Dark mode toggle with persistent preference
- Responsive mobile-first layout

## Tech Stack

- React 19
- Vite
- Supabase (PostgreSQL + auth)
- Vanilla CSS with theme variables

## Getting Started

### Prerequisites

- Node.js 18 or newer
- Supabase project

### Installation

```bash
git clone https://github.com/your-org/nuel-camera-db.git
cd "Nuel Tech Camera DB"
npm install
```

### Configure Supabase

Create a Supabase project and copy the project URL and anon key.

Update `src/supabase.js` as needed:

```js
const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key'
```

### Database schema

Use the following SQL in Supabase to create the `clients` table and enable row-level security:

```sql
create table clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  date text,
  name text,
  contact text,
  location text not null,
  cameras integer,
  system text,
  installers jsonb default '[]',
  username text,
  password text,
  subscription numeric,
  memory_card_size text,
  sims jsonb default '[]'
);

alter table clients enable row level security;

create policy "Public read" on clients for select using (true);
create policy "Public insert" on clients for insert with check (true);
create policy "Public update" on clients for update using (true);
create policy "Public delete" on clients for delete using (true);
```

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project structure

- `src/App.jsx` — main app shell, mode switching, auth logic, theme state
- `src/supabase.js` — Supabase client configuration
- `src/components/` — reusable UI components
- `src/index.css` — global styles and theme variables

## Usage

- Toggle between Public and Admin modes at the top
- Use the floating plus button to add a new client
- Top search filters across all client fields
- Public users cannot edit client name/contact or existing credentials
- Admin mode includes a dedicated admin management section
- Dark mode is available via the floating theme button

## Deployment

Recommended options:

- Vercel: import repo, deploy with default settings
- Netlify: build locally and deploy the `dist/` folder

## Scripts

- `npm run dev` — start development server
- `npm run build` — build production files
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

## Notes

- This app is designed for internal use and field deployment
- Admin configuration is managed in the app rather than relying on environment variables
- Dark theme uses CSS variables and persists user preference in `localStorage`

## License

Internal use only — Nuel Technologies and Engineering Limited. All rights reserved.
