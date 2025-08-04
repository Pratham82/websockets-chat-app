# Claude Code Configuration

This file contains configuration and context for Claude Code to better understand and work with this project.

## Project Overview

WebSocket Chat Application - A real-time chat application built with Next.js frontend and Express.js backend.

## Project Structure

```
websocket-chat/
├── apps/
│   ├── web/           # Next.js frontend
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── contexts/
│   │   │   └── hooks/
│   │   └── package.json
│   └── server/        # Express.js backend
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   └── db.ts
│       └── package.json
└── packages/          # Shared packages
```

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Express.js, Socket.IO, PostgreSQL
- **Database**: PostgreSQL (running in Docker with persistent volume)
- **Authentication**: JWT tokens with bcrypt password hashing

## Development Commands

- `npm run dev` - Start Next.js development server
- `npm run build` - Build the application
- `npm run lint` - Run ESLint
- `npm run start` - Start production server

## API Endpoints

- `POST /api/auth/login` - User login (username, password)
- `POST /api/auth/register` - User registration (username, email, password)

## Environment Variables

- `NEXT_PUBLIC_API_URL` - API base URL (defaults to http://localhost:4000)
- `JWT_SECRET` - Secret for JWT token signing
- Database connection variables for PostgreSQL

## Key Features

- Real-time messaging with Socket.IO
- User authentication with persistent sessions
- Protected routes (redirects to login if not authenticated)
- Responsive UI with Tailwind CSS

## Development Notes

- Server runs on port 4000 by default
- Client runs on port 3000 by default
- PostgreSQL database has persistent storage via Docker volumes
- Authentication uses localStorage for client-side token storage
