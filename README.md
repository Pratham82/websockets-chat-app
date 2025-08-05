Here is your **final `README.md`** — fully cleaned up and production-ready:

---

# WebSocket Chat App 💬

A full-stack real-time chat application built with:

- **Backend:** Node.js, Express, PostgreSQL (raw `pg` client)
- **Frontend:** Next.js, React, Tailwind CSS
- **WebSocket:** Real-time communication for rooms/messages
- **Database:** PostgreSQL (local via Docker)
- **Architecture:** Monorepo using Turborepo

---

## 📁 Folder Structure

```

/apps
├── server # Backend API (Express + pg)
└── web # Frontend (Next.js + Tailwind)
├── migrations # SQL dumps and schema setup
├── docker-compose.yml # Docker orchestration
├── README.md

```

---

## 🧑‍💻 Features

- ✅ User authentication (register, login)
- ✅ Room creation & listing
- ✅ Real-time messaging using WebSockets
- ✅ Member tracking per room
- ✅ API docs with Swagger

---

## 🐳 Running with Docker

Make sure Docker is installed. Then run:

```bash
docker-compose up --build
```

This will:

- Start PostgreSQL on port `5432`
- Start the backend on `localhost:4000`
- Start the frontend on `localhost:3000`
- Optional: Adminer on `localhost:8080` (DB viewer)

Update your `.env` file inside `apps/server`:

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/websocket_chat
```

---

## 🛠 Local Development

```bash
# Install root dependencies
npm install

# Start backend
cd apps/server
npm install
npm run dev

# Start frontend
cd apps/web
npm install
npm run dev
```

---

## 📦 Migrations

SQL schema and seed data lives in the `migrations/` folder.

To run a SQL dump manually:

```bash
psql -U postgres -d websocket_chat -f migrations/supabase_migration.sql
```

---

## 📂 API Routes

```
routes/
├── auth.ts        # Login, Register endpoints
├── rooms.ts       # Room CRUD
├── messages.ts    # Send/Receive messages
```

---

## 🧬 Database Schema

![DB Schema](/assets/db_schema.png)

---

## 🖼 Screenshots

![Home](/assets/ui1.png)
![Rooms](/assets/ui2.png)

---

## 📄 License

MIT © 2025 [Pratham82](https://github.com/Pratham82)
