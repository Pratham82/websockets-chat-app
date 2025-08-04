Thanks for the full context! Based on your **monorepo** structure (`apps/server`, `apps/web`, `migrations`, etc.), here’s a clean layout recommendation + where to keep the `docker-compose.yml`:

---

### ✅ Recommended Folder Structure (Cleaned Up)

```
/websocket-chat
├── apps
│   ├── server                # Node.js backend (raw PG, Express)
│   │   ├── src
│   │   │   ├── middleware
│   │   │   ├── routes
│   │   │   ├── db.ts
│   │   │   ├── index.ts
│   │   │   └── swagger.ts
│   │   ├── .env
│   │   ├── package.json
│   │   ├── tsconfig.json
│   └── web                   # Next.js frontend
│       ├── src
│       │   ├── components
│       │   ├── contexts
│       │   ├── hooks
│       │   └── pages
│       ├── public
│       ├── styles
│       ├── .env.local
│       ├── next.config.ts
│       ├── postcss.config.mjs
│       ├── tailwind.config.cjs
│       ├── package.json
│       └── tsconfig.json
├── migrations                # SQL dumps, schema setup
│   ├── supabase_migration.sql
│   ├── websocket_chat_complete_dump.sql
│   └── ...
├── README.md                 # ✅ Main documentation file
├── BACKEND_ARCHITECTURE.md   # (optional: keep if needed)
└── .gitignore
```

---

### 📦 Where to Put `docker-compose.yml`?

**Put it at the root of the project** (same level as `apps/`, `migrations/`, `README.md`). That way, you can run it globally like:

```bash
docker-compose up
```

And reference volumes/paths easily without messy relative paths.

---

### 📝 Clean `README.md` Template

```md
# WebSocket Chat App 💬

A full-stack real-time chat application built with:

- **Backend:** Node.js, Express, PostgreSQL (raw pg client)
- **Frontend:** Next.js, React, Tailwind CSS
- **WebSocket:** Real-time communication for rooms/messages
- **Database:** Supabase (PostgreSQL hosted)
- **Architecture:** Monorepo (Turborepo structure)

---

## 📁 Folder Structure
```

/apps
├── server # Backend API (Express + pg)
└── web # Frontend (Next.js + Tailwind)
├── migrations # SQL dumps and schema setup
├── docker-compose.yml

````

---

## 🧑‍💻 Features

- ✅ User authentication (login & register)
- ✅ Room creation & listing
- ✅ Real-time messages with WebSocket
- ✅ Member tracking per room
- ✅ Typed APIs with Swagger docs

---

## 🐳 Running with Docker

Make sure you have Docker installed.

```bash
# At project root
docker-compose up
````

Your `.env` file in `apps/server` should point to:

```
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/postgres
```

---

## 🛠 Local Dev Setup

```bash
# Install root deps (if using turborepo)
npm install

# Backend
cd apps/server
npm install
npm run dev

# Frontend
cd apps/web
npm install
npm run dev
```

---

## 📦 Migrations

SQL dump files are under `/migrations`. You can restore via:

```bash
psql -U postgres -d postgres -f migrations/supabase_migration.sql
```

---

## 🗂 API Structure

```
routes/
├── auth.ts        # Login, Register
├── rooms.ts       # Create, Get rooms
├── messages.ts    # Send, Get messages
```

## DB Schema

![Schema](/assets/db_schema.png)

## Screenshots

![Home](/assets/ui1.png)
![Rooms](/assets/ui2.png)

## 📄 License

MIT © \[Pratham82]
