# 🏫 School Enquiry Chatbot

An AI chatbot that answers parents' and students' questions about a school — admissions, age criteria, fees, timings, transport, uniform, exams, facilities and more. Built with Node.js, Socket.io and Supabase, with a custom NLP engine that needs no paid AI API.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🧠 NLP engine | Keyword + stemmed Jaccard similarity intent classifier (no external API) |
| 📚 Knowledge base | 76 ready-made school intents (`data/schoolIntents.js`) |
| 🌐 Multilingual | English, Hindi & Marathi |
| 🎙️ Voice input | Web Speech API |
| 💬 Live chat | Hands the conversation to a human admin when the bot isn't confident |
| 🛠️ Admin panel | Add, edit, enable/disable intents; view sessions and stats |
| 📦 Database | Supabase (Postgres) — intents, chat logs, live chats |

---

## 📁 Project Structure

```
school-enquiry-chatbot/
├── server.js               # Express + Socket.io server
├── .env.example            # Environment variables template
│
├── data/
│   └── schoolIntents.js    # ⭐ The school knowledge base — edit answers here
│
├── config/
│   └── database.js         # Supabase client
├── models/                 # Supabase data-access modules
│   ├── Intent.js           # intents table
│   ├── ChatLog.js          # chat_logs + chat_messages tables
│   └── LiveChat.js         # live_chats + live_chat_messages tables
├── controllers/            # REST API logic
├── routes/                 # /api/chat, /api/admin, /api/livechat, /api/translate
├── services/
│   ├── nlpService.js       # Intent classifier
│   ├── liveChatService.js  # Live chat queue & sessions
│   └── translationService.js
│
├── public/                 # Chat website (index.html, chat.js, style.css)
├── admin/                  # Admin panel + admin live chat console
│
├── supabase/
│   └── schema.sql          # Tables, functions, RLS — run once in Supabase
└── database/
    └── seed.js             # Loads data/schoolIntents.js into Supabase
```

---

## ⚙️ Setup

### Prerequisites
- Node.js 18+
- A free [Supabase](https://supabase.com) project

### 1. Install
```bash
git clone https://github.com/omkolhe04/school_enquiry_chat_bot.git
cd school_enquiry_chat_bot
npm install
```

### 2. Create the database tables
1. In your Supabase project, open **SQL Editor → New query**.
2. Paste the contents of `supabase/schema.sql` and click **Run**.

### 3. Configure `.env`
```bash
cp .env.example .env
```
Fill in:

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API → **Project URL** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → **service_role** key |
| `SCHOOL_NAME`, `SCHOOL_PHONE`, `SCHOOL_EMAIL`, `SCHOOL_WEBSITE`, `SCHOOL_ADDRESS` | Your school's details — shown on the website and in bot replies |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Admin panel login — **change the defaults** |

> The service_role key bypasses Row Level Security, so keep it server-side only (`.env` is git-ignored). RLS is enabled on every table with no policies, so the public anon key can't read or write anything.

### 4. Load the school intents
```bash
npm run seed
```

### 5. Run
```bash
npm start        # production
npm run dev      # development, auto-reload
```

| URL | Page |
|---|---|
| http://localhost:3000 | 💬 Chat website |
| http://localhost:3000/admin | 🛠️ Admin panel |
| http://localhost:3000/admin/chat | 🎧 Admin live chat console |

---

## ✏️ Customising for Your School

The answers in `data/schoolIntents.js` use **sample values** for a typical CBSE day school in India (fees, timings, age criteria, bus routes…). Before going live:

1. Set your school's details in `.env` — these fill `{{SCHOOL_NAME}}`, `{{PHONE}}`, `{{EMAIL}}`, `{{WEBSITE}}` and `{{ADDRESS}}` in every answer.
2. Edit the answers either:
   - in `data/schoolIntents.js`, then run `npm run seed` again (this **replaces** all intents in the database), or
   - in the **Admin Panel → Intents**, which edits the database directly.
3. Update the highlight slides and stat tiles in `public/index.html` (search for `ci-slide` and `ci-tile`).

Intents saved in the database override built-in intents with the same name, so the bot keeps working even before you seed.

### Intent format
```js
{
  intentName: 'school_timings',          // unique id
  displayName: 'School Timings',         // label in the admin panel
  category: 'campus',                    // admissions | academics | fees | campus | contact | events | general
  keywords: ['timing', 'school hours'],  // matter most for short questions
  trainingPhrases: ['what are the school timings'], // matter most for long questions
  responses: ['⏰ School runs 7:45 AM – 2:15 PM…'], // one is picked at random
}
```

### Tuning
```env
CONFIDENCE_THRESHOLD=0.35   # minimum score to answer; raise for stricter matching
LIVE_CHAT_THRESHOLD=0.25    # below this, the user is offered live chat with an admin
```

---

## 🧠 What the Bot Knows

| Category | Topics |
|---|---|
| Admissions | Process, dates, age criteria, documents, entrance test, seats, mid-year transfer, RTE 25%, Class 11 streams, status, cancellation, campus visit, TC & certificates |
| Fees | Fee structure, payment methods, instalments, late fee, sibling concession, scholarships, other charges, transport fee |
| Academics | Classes, curriculum (CBSE/NCERT/NEP), subjects, exams, results, homework, attendance, PTMs, remedial classes, special needs, books, parent app, teachers |
| School life | Timings, holidays, uniform, canteen, phone policy, discipline, facilities, library, labs, medical, daycare, hostel (day school), bus, bus safety, pickup, safety, anti-bullying, counselling |
| Events | Sports, clubs & activities, annual events, trips & camps, Olympiads, scouts & guides |
| Contact | Phone & email, address, office hours, website, complaints, jobs |
| General | Greetings, about the school, board, medium, co-ed, principal |

---

## 🔌 API Reference

### Chat
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | `{ message, sessionId }` → bot reply with intent & confidence |
| `GET` | `/api/chat/history/:sessionId` | Messages for a session |
| `GET` | `/api/chat/sessions` | Paginated sessions |
| `GET` | `/api/chat/stats` | Totals and accuracy |
| `GET` | `/api/config` | Public school details from `.env` |
| `GET` | `/api/health` | Health check |

### Admin (header `Authorization: Bearer <base64(user:pass)>`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/login` | `{ username, password }` → `{ token }` |
| `GET` | `/api/admin/intents` | List intents (`?category=fees`) |
| `POST` | `/api/admin/intents` | Create intent |
| `PUT` | `/api/admin/intents/:id` | Update intent |
| `DELETE` | `/api/admin/intents/:id` | Delete intent |
| `POST` | `/api/admin/intents/:id/toggle` | Enable / disable |

### Live chat (admin)
`GET /api/livechat/queue` · `/active` · `/stats` · `/history` · `/session/:roomId` · `POST /api/livechat/session/:roomId/close`
Public: `POST /api/livechat/session/:roomId/rate` — `{ rating: 1–5, feedback }`

### Socket.io events
| Event | Direction | Description |
|---|---|---|
| `chat_message` | client → server | `{ message, sessionId, language }` |
| `bot_response` | server → client | Reply with intent, confidence, `canEscalate` |
| `request_live_chat` | client → server | Join the admin queue |
| `admin_register` / `admin_accept_chat` | admin → server | Go online / take a chat |
| `live_chat_message` | both | Message in a live chat room |
| `end_live_chat` | both | Close the chat |

---

## 🛡️ Before Going Live

- [ ] Replace the sample fees, timings and other figures with your school's real details
- [ ] Set a strong `ADMIN_PASSWORD`
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` secret (never ship it to the browser)
- [ ] Serve over HTTPS (e.g. behind nginx or Caddy) and set `NODE_ENV=production`
- [ ] Add rate limiting (e.g. `express-rate-limit`)

---

## 📄 License

MIT
