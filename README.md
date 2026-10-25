# 🎓 AI Chatbot for College Enquiry System

> A production-ready AI chatbot that answers student queries about college information using custom NLP intent classification, Node.js, Socket.io, and MongoDB.

---

## 📸 Features

| Feature | Details |
|---|---|
| 🧠 NLP Engine | TF-IDF + Cosine Similarity (custom, no API needed) |
| 💬 Real-time | Socket.io with typing indicators |
| 📦 Database | MongoDB (chat logs + intents) |
| 🎨 UI | Animated dark cosmic theme |
| 🛠️ Admin Panel | Full CRUD for intents |
| 📊 Analytics | Accuracy, sessions, message stats |
| 🔁 REST API | Full OpenAPI-compatible endpoints |
| 🌱 Seed Data | 30+ ready-to-use college intents |

---

## 🧮 Mathematical Model

**Intent Classification:**
```
Î = argmax P(I | U)
```

**Confidence Score (Cosine Similarity):**
```
confidence = (A · B) / (|A| × |B|)
```
Where A = TF-IDF vector of intent training corpus, B = query vector.

**Accuracy:**
```
Accuracy = (Correct Predictions / Total Queries) × 100
```
Where "Correct" = confidence ≥ threshold (default: 0.35)

---

## 📁 Project Structure

```
college-chatbot/
├── server.js               # Express + Socket.io server
├── package.json
├── .env.example            # Environment variables template
│
├── config/
│   └── database.js         # MongoDB connection
│
├── controllers/
│   ├── chatController.js   # Chat API logic
│   └── adminController.js  # Admin CRUD logic
│
├── routes/
│   ├── chat.js             # /api/chat routes
│   └── admin.js            # /api/admin routes
│
├── models/
│   ├── Intent.js           # Intent schema
│   └── ChatLog.js          # Chat session schema
│
├── services/
│   └── nlpService.js       # NLP engine (TF-IDF + stemmer)
│
├── public/
│   ├── index.html          # Chat UI
│   ├── style.css           # Styles (dark cosmic theme)
│   └── chat.js             # Frontend JS
│
├── admin/
│   └── admin-panel.html    # Admin dashboard
│
└── database/
    └── seed.js             # Seed 30+ intents
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js ≥ 18.x
- MongoDB ≥ 6.x (local or Atlas)
- npm ≥ 9.x

---

### Step 1: Clone / create the project
```bash
git clone <repo-url> college-chatbot
cd college-chatbot
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

**Key `.env` variables:**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/college_chatbot
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
CONFIDENCE_THRESHOLD=0.35
COLLEGE_NAME=Greenfield Institute of Technology
COLLEGE_PHONE=+1-800-555-0100
COLLEGE_EMAIL=admissions@git.edu
COLLEGE_WEBSITE=https://www.git.edu
COLLEGE_ADDRESS=123 University Avenue, Tech City, TC 45678
```

### Step 4: Start MongoDB
```bash
# Local MongoDB
mongod --dbpath /data/db

# OR use MongoDB Atlas (update MONGODB_URI in .env)
```

### Step 5: Seed the database
```bash
npm run seed
```
This inserts **30+ pre-built intents** covering all college topics.

### Step 6: Start the server
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

### Step 7: Open the app
| URL | Description |
|---|---|
| `http://localhost:3000` | 💬 Chat UI |
| `http://localhost:3000/admin` | 🛠️ Admin Panel |
| `http://localhost:3000/api/health` | ❤️ Health check |

---

## 🔌 API Reference

### Chat API

#### `POST /api/chat`
Send a user message and get NLP response.

**Request:**
```json
{
  "message": "How do I apply for admission?",
  "sessionId": "sess-1234567-abc",
  "userId": "optional-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "sess-1234567-abc",
  "message": "📋 Admission Process at GIT:\n1. Fill online form...",
  "intent": "admission_process",
  "displayName": "Admission Process",
  "confidence": 0.8231,
  "entities": [],
  "isFallback": false,
  "topScores": [
    { "intent": "admission_process", "score": 0.8231 },
    { "intent": "admission_eligibility", "score": 0.3104 }
  ]
}
```

#### `GET /api/chat/stats`
```json
{
  "success": true,
  "stats": {
    "totalSessions": 142,
    "totalMessages": 1847,
    "totalResolved": 1693,
    "totalFallback": 154,
    "accuracy": 91.65
  }
}
```

#### `GET /api/chat/history/:sessionId`
Returns full message history for a session.

---

### Admin API

All admin routes require: `Authorization: Bearer <base64(user:pass)>`

#### `POST /api/admin/login`
```json
{ "username": "admin", "password": "admin123" }
```
Returns `{ "token": "..." }`

#### `GET /api/admin/intents`
Returns all intents with training phrases and responses.

#### `POST /api/admin/intents`
Create a new intent.

#### `PUT /api/admin/intents/:id`
Update an existing intent.

#### `DELETE /api/admin/intents/:id`
Delete an intent.

#### `POST /api/admin/intents/:id/toggle`
Activate or deactivate an intent.

---

## 🧠 Supported Intents (30+)

| Intent | Category | Example Query |
|---|---|---|
| `greetings` | General | "Hello", "Hi there" |
| `about_college` | General | "Tell me about the college" |
| `admission_process` | Admissions | "How do I apply for admission?" |
| `admission_eligibility` | Admissions | "What is the eligibility criteria?" |
| `admission_dates` | Admissions | "When does admission start?" |
| `course_details` | Academics | "What courses are offered?" |
| `course_duration` | Academics | "How long is B.Tech?" |
| `syllabus` | Academics | "What is the syllabus?" |
| `fee_structure` | Fees | "What is the fee structure?" |
| `fee_payment` | Fees | "How to pay fees online?" |
| `scholarships` | Fees | "Are scholarships available?" |
| `exam_schedule` | Academics | "When are the exams?" |
| `exam_results` | Academics | "How to check results?" |
| `backlog_reappear` | Academics | "How to clear backlog?" |
| `faculty_information` | Academics | "Who are the professors?" |
| `hod_contacts` | Academics | "Contact the CSE HOD" |
| `campus_facilities` | Campus | "What facilities are available?" |
| `hostel_details` | Campus | "Is hostel available?" |
| `library` | Campus | "Library timings?" |
| `placements` | Campus | "What is the placement record?" |
| `transport_bus` | Campus | "Is there a bus service?" |
| `internship` | Campus | "How to get internship?" |
| `sports_facilities` | Campus | "Is there a gym?" |
| `research` | Academics | "Research opportunities?" |
| `events` | Events | "What events are coming up?" |
| `clubs_societies` | Events | "What clubs are there?" |
| `contact_details` | Contact | "What is the contact number?" |
| `location_directions` | Contact | "How to reach the college?" |
| `affiliation` | General | "Is college approved by AICTE?" |
| `anti_ragging` | General | "Anti-ragging policy?" |
| `thanks` | General | "Thank you!" |

---

## 🌐 Socket.io Events

| Event | Direction | Description |
|---|---|---|
| `chat_message` | Client → Server | Send user message |
| `bot_typing` | Server → Client | Show/hide typing indicator |
| `bot_response` | Server → Client | Bot reply with NLP metadata |

**Client example:**
```javascript
const socket = io();
socket.emit('chat_message', {
  message: 'What courses do you offer?',
  sessionId: 'sess-abc123'
});
socket.on('bot_response', (data) => {
  console.log(data.message, data.confidence);
});
```

---

## 🐳 Docker (Optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t college-chatbot .
docker run -p 3000:3000 --env-file .env college-chatbot
```

---

## 📈 Customisation

### Adding a new intent
1. Via Admin Panel → Intents → + New Intent
2. Or add to `database/seed.js` and re-run `npm run seed`
3. Or POST to `/api/admin/intents` directly

### Changing confidence threshold
```env
CONFIDENCE_THRESHOLD=0.40   # increase for stricter matching
```

### Personalising responses
Use template variables in responses:
- `{{COLLEGE_NAME}}` → College name from .env
- `{{PHONE}}` → College phone
- `{{EMAIL}}` → Contact email
- `{{WEBSITE}}` → Website URL
- `{{ADDRESS}}` → Physical address

---

## 🛡️ Production Checklist

- [ ] Set strong `ADMIN_PASSWORD` in .env
- [ ] Use MongoDB Atlas with auth for production
- [ ] Enable HTTPS (use nginx / Caddy as reverse proxy)
- [ ] Set `NODE_ENV=production`
- [ ] Use PM2 for process management: `pm2 start server.js`
- [ ] Set up log rotation
- [ ] Configure rate limiting (add `express-rate-limit`)

---

## 📄 License

MIT © College Chatbot Team
