# Collaborative Notes Application

A real-time collaborative note-taking application built with Next.js, Supabase, and LiveBlocks.

## Features

- **Real-time Collaboration**: Multiple users can edit notes simultaneously
- **Ruled Paper Interface**: Familiar note-taking experience with blue lines and red margin
- **Secure Authentication**: Email/password and Google OAuth with Supabase
- **Row-Level Security**: Fine-grained permissions (Read, Write, Update, Admin)
- **Folder Organization**: Organize notes in folders
- **Search Functionality**: Find notes quickly
- **Export Options**: Download notes as DOCX or PDF
- **Comments & Locking**: Collaborative features for teams

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **Editor**: TipTap with ProseMirror
- **Real-time**: LiveBlocks + Y.js CRDT
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth

## Getting Started

### 1. Install Dependencies

```bash
cd app
npm install
```

### 2. Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# LiveBlocks Configuration
LIVEBLOCKS_SECRET_KEY=pk_live_your_secret_key
LIVEBLOCKS_PUBLIC_KEY=pk_live_your_public_key
```

### 3. Database Setup

1. Go to your Supabase project
2. Open SQL Editor
3. Copy and run the SQL from `src/lib/database.ts`

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 to see the application.

## Project Structure

```
app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── login/             # Login page
│   │   ├── notes/[id]/        # Note editor page
│   │   └── page.tsx           # Homepage
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── editor/            # TipTap editor components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── database.ts        # Database schema
│   │   ├── liveblocks-provider.ts
│   │   ├── liveblocks.ts
│   │   ├── supabase.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts           # TypeScript interfaces
```

## API Endpoints

### Notes
- `GET /api/notes` - List user's notes
- `POST /api/notes` - Create new note
- `GET /api/notes/[id]` - Get specific note
- `PATCH /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

### Authentication
- `POST /api/liveblocks-auth` - LiveBlocks authentication

## Database Schema

The application uses the following main tables:

- `profiles` - User profiles (extends auth.users)
- `notes` - Note metadata
- `note_content` - Y.js document state
- `folders` - Note organization
- `permissions` - Access control (RLS enforced)
- `comments` - Note comments

## Features Status

### Completed
- [x] Next.js project setup
- [x] TipTap editor with ruled paper styling
- [x] Database schema with RLS
- [x] Authentication UI
- [x] Basic layout components
- [x] API routes for notes CRUD
- [x] LiveBlocks integration structure

### In Progress
- [ ] Real-time collaboration (LiveBlocks + Y.js)
- [ ] Authentication implementation
- [ ] Note saving/loading

### Planned
- [ ] Folder management
- [ ] Search functionality
- [ ] Export to DOCX/PDF
- [ ] Comments system
- [ ] Sentence-level locking
- [ ] Mobile responsiveness

## Development Notes

- TypeScript errors are expected until dependencies are installed
- Mock data is used in some components until full API integration
- LiveBlocks integration is structured but needs environment variables
- All components follow the design specifications from the requirements document

## License

MIT
