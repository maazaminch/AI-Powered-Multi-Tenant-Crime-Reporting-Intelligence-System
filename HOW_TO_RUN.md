# CRIMe SaaS — How to Run the Project (Linux and Windows)

This document is for anyone setting up **CRIMe** on their own computer. The app is a full-stack crime reporting system:

| Folder | What it is | Default URL |
|---|---|---|
| `CRIMe-Server` | Node.js + Express API | http://localhost:8000 |
| `CRIMe-Client` | React (Vite) frontend | http://localhost:3000 |

MongoDB and Redis are **local** (`127.0.0.1`). Cloudinary, Gmail, Gemini, and Google OAuth are **cloud services**. They work from Windows or Linux if you use the same `.env` keys the project owner sends you.

---

## 1. Can these env files run locally? (Answer: yes)

The current setup is already local-ready. **You do not need to change Mongo or Redis URIs.**

| Variable | Current purpose | Works on another PC? |
|---|---|---|
| `MONGO_URI=mongodb://127.0.0.1:27017/crime_saas_db` | Local MongoDB | Yes, if MongoDB is installed and running |
| `REDIS_URL=redis://localhost:6379` | Local Redis | Yes, if Redis is installed and running |
| `PORT=8000` | API port | Yes |
| `CORS_ORIGIN=http://localhost:3000` | Frontend origin | Yes (Vite uses port 3000) |
| `VITE_API_BASE_URL=http://localhost:8000` | Client → API | Yes |
| `VITE_SOCKET_URL=http://localhost:8000` | Socket.IO | Yes |
| Cloudinary `CLOUD_NAME` / `API_KEY` / `API_SECRET` | Evidence / image uploads | Yes (cloud, any machine) |
| `EMAIL_USER` / `EMAIL_PASS` | OTP and invite emails (Gmail) | Yes (cloud) |
| `GEMINI_API_KEY` | Case AI summary/severity | Yes (cloud) |
| `GOOGLE_CLIENT_ID` + `VITE_GOOGLE_CLIENT_ID` | Google sign-in | Yes on `http://localhost:3000` if that origin is allowed in Google Cloud Console |
| `JWT_SECRET` / `SESSION_SECRET` | Auth cookies | Yes (must match between restarts on that machine) |
| `SUPER_ADMIN_EMAIL` / `PASSWORD` / `PHONE` | First Super Admin seed | Yes, after you run the seed script |

**Important**

- `.env` files are **gitignored**. Cloning the repo does **not** copy secrets. The owner must send `CRIMe-Server/.env` and `CRIMe-Client/.env` privately (USB, encrypted zip, password manager — not GitHub).
- Your local MongoDB starts **empty**. You will not have the owner’s existing cases until you seed Super Admin (and optionally demo data).
- The server **exits on startup** if Cloudinary name/key/secret are missing.
- The server **fails on startup** if Redis is not running (`redis.js` connects immediately).
- Do **not** commit `.env` to Git.

---

## 2. Tools you must install

### Both Linux and Windows

1. **Git**
2. **Node.js 20 LTS** (or newer 20.x / 22.x). Mongoose 9 and this repo expect a current Node.  
   Check: `node -v` and `npm -v`
3. **MongoDB Community Server 7 or 8** (service running on port **27017**)
4. **Redis 7** (service running on port **6379**)
5. A code editor (VS Code / Cursor) — optional

### Windows-specific notes

| Tool | Recommended way on Windows |
|---|---|
| Node.js | Installer from https://nodejs.org (LTS). Tick “Add to PATH”. |
| MongoDB | MongoDB Community MSI, keep default port 27017, install as a Windows service. Compass GUI is optional but useful. |
| Redis | Redis is not official on Windows. Pick **one**: **A)** Docker Desktop → `docker run -d --name redis -p 6379:6379 redis:7` · **B)** [Memurai](https://www.memurai.com/) Developer Edition · **C)** install Redis inside **WSL2** and use `redis://localhost:6379` if it is forwarded. |
| `bcrypt` native build | If `npm install` fails on `bcrypt`, install **Visual Studio Build Tools** with “Desktop development with C++”, then run `npm install` again in `CRIMe-Server`. |

### Linux-specific notes

```bash
# Debian/Ubuntu examples
sudo apt update
sudo apt install -y git
# Node 20 via NodeSource or nvm is recommended rather than old apt Node
# MongoDB: follow MongoDB’s official Ubuntu repo docs
sudo apt install -y redis-server
sudo systemctl enable --now mongod redis-server
```

---

## 3. Files you must receive from the owner

Copy these into the same paths on your machine (do not rename):

```
Crime-SaaS/
  CRIMe-Server/.env
  CRIMe-Client/.env
```

If you only got this markdown file, you cannot start the API until those env files exist. Use the templates in **section 8** and fill values the owner gives you.

---

## 4. Project structure

```
Crime-SaaS/
├── CRIMe-Client/          React + Vite UI
├── CRIMe-Server/          Express API
│   ├── server.js          Entry point
│   ├── app.js             Routes
│   ├── .env               Secrets (not in git)
│   └── src/seed/seedScript.js   Creates Super Admin
└── HOW_TO_RUN.md          This file
```

---

## 5. Step-by-step setup

Open **two terminals**. Commands below work in **Linux bash** and **Windows PowerShell** / **Command Prompt** (use `cd` the same way).

### 5.1 Get the code

```bash
git clone <REPO_URL>
cd Crime-SaaS
```

Or unzip the project folder the owner sent you.

Place `.env` files as in section 3.

### 5.2 Confirm MongoDB and Redis are running

**Linux**

```bash
sudo systemctl status mongod
sudo systemctl status redis-server
redis-cli ping
# Expect: PONG
```

**Windows**

- Services app → **MongoDB** should be Running.  
- If you used Docker for Redis:

```powershell
docker ps
docker run -d --name redis -p 6379:6379 redis:7
```

Then:

```powershell
# If redis-cli exists
redis-cli ping
```

### 5.3 Start the backend

```bash
cd CRIMe-Server
npm install
npm run dev
```

You should see something like:

```
MongoDB connected: 127.0.0.1
Redis Client Connected
Server running on port http://localhost:8000
```

Health check in a browser: http://localhost:8000/api/health  
Expect JSON with `"status": "ok"`.

If Cloudinary vars are missing, the process prints an error and **exits**.  
If Redis is down, you will see `Redis Client Error` and the process will not stay healthy.

### 5.4 Create the Super Admin (first time only)

Keep using the same `CRIMe-Server` folder (so `.env` loads):

```bash
node src/seed/seedScript.js
```

- If it prints **Super Admin recovered successfully**, log in with `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` from `.env`.
- If it prints **Super Admin already exists**, that email is already in your local DB.

This script does **not** copy the owner’s production/demo cases. It only creates one Super Admin user.

Optional large demo dataset (tenants, stations, dummy cases) exists at `CRIMe-Server/script/seed.js`. Only run it if the owner tells you to; it inserts a lot of data and uses a simple demo password defined in that file.

### 5.5 Start the frontend

New terminal:

```bash
cd CRIMe-Client
npm install
npm run dev
```

Vite is configured for **port 3000**. Open:

**http://localhost:3000**

---

## 6. How to log in after setup

| Role | How you get it |
|---|---|
| Super Admin | Seed script + email/password in `CRIMe-Server/.env` |
| Tenant Admin | Super Admin **invites** by email → register `/register/invite` → Super Admin **approves** → Super Admin **assigns to a tenant** |
| Police | Tenant Admin **invites** by email → register → Admin **approves** → Admin **assigns to a station** |
| Station Head | Admin assigns an approved officer as SHO of a station |
| Citizen | Self-register at `/register` |
| Guest | `/report` or `/guest/report` (OTP email, no account) |

Staff flow is always: **invite → register (PENDING) → approve → then assign tenant/station**.

---

## 7. What each cloud key is used for

These stay the same on Windows and Linux (they are not “localhost” services).

| Feature | Needs |
|---|---|
| Evidence / profile image upload | Cloudinary (server **will not start** without it) |
| Guest OTP, invite emails, some notifications | Gmail `EMAIL_USER` + Gmail **App Password** (`EMAIL_PASS`) |
| AI case summary and severity | `GEMINI_API_KEY` (if missing, reporting should still work with a fallback severity) |
| “Continue with Google” | Same Client ID on server and client. Google Cloud Console → authorized JavaScript origins must include `http://localhost:3000` and redirect URIs if used |
| PDF receipts | Generated on the server (`uploads/pdfs`). Folder is created at runtime; no extra install |

AWS S3 is **commented out**. You do not need AWS to run locally.

---

## 8. Environment templates (if you must create files by hand)

Create `CRIMe-Server/.env` (fill real values from the owner):

```env
MONGO_URI=mongodb://127.0.0.1:27017/crime_saas_db
REDIS_URL=redis://localhost:6379

PORT=8000
CORS_ORIGIN=http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

JWT_SECRET=
SESSION_SECRET=

EMAIL_USER=
EMAIL_PASS=

SUPER_ADMIN_EMAIL=
SUPER_ADMIN_PASSWORD=
SUPER_ADMIN_PHONE=

GEMINI_API_KEY=
GEMINI_MODEL=gemini-flash-latest

GOOGLE_CLIENT_ID=

AUDIT_LOG_LEVEL=INFO
AUDIT_ENABLED=true
AUDIT_ASYNC=true
AUDIT_RETENTION_DAYS=90
AUDIT_EXCLUDE_ROUTES=/health,/ping,/favicon.ico
```

Optional (invite emails already default to `http://localhost:3000`):

```env
FRONTEND_URL=http://localhost:3000
CLIENT_ORIGIN=http://localhost:3000
```

Create `CRIMe-Client/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SOCKET_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=
```

`VITE_GOOGLE_CLIENT_ID` must be the **same** value as server `GOOGLE_CLIENT_ID`.

After changing any `VITE_*` variable, restart `npm run dev` on the client.

---

## 9. Ports that must be free

| Port | Service |
|---|---|
| 27017 | MongoDB |
| 6379 | Redis |
| 8000 | CRIMe-Server |
| 3000 | CRIMe-Client (Vite) |

If 3000 is taken, Vite may pick 3001 and **CORS will fail** because `CORS_ORIGIN` is `http://localhost:3000`. Stop the other app or change both Vite `server.port` and `CORS_ORIGIN` together.

---

## 10. Daily start (after the first setup)

1. Start MongoDB service  
2. Start Redis (or `docker start redis`)  
3. Terminal 1: `cd CRIMe-Server && npm run dev`  
4. Terminal 2: `cd CRIMe-Client && npm run dev`  
5. Browser: http://localhost:3000  

Production-style API only (no nodemon): `cd CRIMe-Server && npm start`

---

## 11. Troubleshooting

| Symptom | What to check |
|---|---|
| `MongoDB connected` never appears / process exits | MongoDB not running, or `MONGO_URI` wrong |
| `Redis Client Error` / ECONNREFUSED 6379 | Redis not running. Server imports Redis at boot — it is required. |
| `Missing Cloudinary configuration` then exit | `.env` not in `CRIMe-Server/.env`, or three Cloudinary vars empty |
| Frontend loads but API 401 / CORS error | Client not on `http://localhost:3000`, or server CORS mismatch |
| `npm install` fails on `bcrypt` (Windows) | Install VS Build Tools (C++), retry |
| Google login popup error | Client ID mismatch, or `http://localhost:3000` not in Google authorized origins |
| OTP email never arrives | Gmail App Password, spam folder, or Google blocking the new machine |
| Guest report works but upload fails | Cloudinary credentials / unsigned preset if the UI uses unsigned upload |
| Logged in as Super Admin but empty system | Expected on a fresh local DB — create a tenant, invite an admin |
| Health: http://localhost:8000/api/health | Must return `"status": "ok"` |

---

## 12. Optional: Docker Redis only (Windows)

If you have Docker Desktop:

```powershell
docker run -d --name crime-redis -p 6379:6379 redis:7
```

Keep `REDIS_URL=redis://localhost:6379` in `.env`. MongoDB can stay as a native Windows service.

---

## 13. What you should not do

- Do not switch `MONGO_URI` to Atlas unless the owner gives you Atlas access. The project is configured for **local** Mongo.
- Do not commit `.env`.
- Do not email `.env` in plain text if you can avoid it (contains mail, JWT, Cloudinary, and AI keys).
- Do not run the large `script/seed.js` on a database you care about without asking.

---

## 14. Quick verification checklist

- [ ] Node 20+ (`node -v`)
- [ ] `mongod` / MongoDB service running
- [ ] Redis running (`redis-cli ping` → `PONG`)
- [ ] `CRIMe-Server/.env` and `CRIMe-Client/.env` present
- [ ] `cd CRIMe-Server && npm install && npm run dev`
- [ ] http://localhost:8000/api/health → ok
- [ ] `node src/seed/seedScript.js` (once)
- [ ] `cd CRIMe-Client && npm install && npm run dev`
- [ ] http://localhost:3000 opens the home page
- [ ] Super Admin can log in at `/login`
