# ai-expense-tracker
AI Financial Expense Tracker - Full Stack Project
# FinAI — AI Financial Expense Tracker (Full Stack)

This fulfills the PDF brief's **Backend Requirements** (REST APIs, database integration,
AI model/API integration, role management) by adding a real Node.js/Express + MongoDB
backend behind your existing frontend.

```
finai/
├── backend/      Node.js + Express + MongoDB REST API, JWT auth, role management,
│                 Python ML model for AI budget suggestions
└── frontend/     Your existing UI (index.html), now wired to the backend via fetch()
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env      # then edit MONGO_URI / JWT_SECRET as needed
```

Requirements:
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017/finai`) or a MongoDB Atlas URI
- Python 3 (used by the AI budget-suggestion model — no extra pip installs needed,
  it only uses the standard library)

Seed the database with demo data (matches the original mock data in the frontend):
```bash
npm run seed
# Demo login -> email: komal@email.com / password: password123
```

Run the API:
```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```
The API listens on `http://localhost:5000/api` by default. Check `GET /api/health`.

## 2. Frontend setup

The frontend is a single static file: `frontend/index.html`. It now talks to the
backend via a small `api` client built into the page (see the `<script>` near the top
that sets `window.FINAI_API_BASE`). Open it with any static file server:

```bash
cd frontend
python3 -m http.server 3000
```
Then visit `http://localhost:3000`. Sign up for an account (or sign in with the seeded
demo account above) — this calls the real `/api/auth/register` / `/api/auth/login`
endpoints, stores a JWT, and loads your transactions from MongoDB.

If your backend isn't on `localhost:5000`, set the base URL before the page's scripts
run, e.g. by editing the inline `<script>` tag at the top of `index.html`:
```html
<script>window.FINAI_API_BASE = 'https://your-api-domain.com/api';</script>
```

## 3. What's wired up vs. still using demo data

| Module | Status |
|---|---|
| Auth (login/signup) | ✅ Real JWT auth against MongoDB (`/api/auth`) |
| Expense tracking (add/edit/delete) | ✅ Full CRUD against MongoDB (`/api/transactions`) |
| Dashboard totals & recent transactions | ✅ Live, computed from your real transactions |
| Budgets | ✅ Real budgets stored per user/month (`/api/budgets`) |
| AI budget suggestions | ✅ Calls a Python ML model (`backend/ml/budget_suggestion.py`) via the API |
| AI Q&A advisor | ✅ Calls backend `/api/ai/insights` (uses Claude if `ANTHROPIC_API_KEY` is set, otherwise a rule-based fallback — the API key never touches the browser) |
| Bill reminders / notifications | ✅ API + model ready (`/api/reminders`); not yet wired into the Notifications page UI |
| Analytics page charts | ⏳ Still using illustrative demo data — easy to wire to `/api/transactions/analytics/summary` and `/api/reports/monthly` the same way Dashboard was |
| Role management | ✅ `user`/`admin` roles enforced via middleware; see `/api/admin/users` |

## 4. API reference (summary)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | – | Create account |
| POST | /api/auth/login | – | Get JWT |
| GET | /api/auth/me | ✅ | Current user profile |
| GET | /api/transactions | ✅ | List/filter transactions |
| POST | /api/transactions | ✅ | Create transaction |
| PUT | /api/transactions/:id | ✅ | Update transaction |
| DELETE | /api/transactions/:id | ✅ | Delete transaction |
| GET | /api/transactions/analytics/summary | ✅ | Totals + category/monthly breakdown |
| GET | /api/budgets | ✅ | List budgets for a month |
| POST | /api/budgets | ✅ | Create/update a category budget |
| GET | /api/reminders | ✅ | List bill reminders |
| POST | /api/reminders | ✅ | Create reminder |
| GET | /api/ai/budget-suggestions | ✅ | Python ML model output |
| POST | /api/ai/insights | ✅ | Natural-language AI advisor |
| GET | /api/reports/monthly | ✅ | Year-by-month income/expense report |
| GET | /api/reports/export.csv | ✅ | CSV export of all transactions |
| GET/PUT | /api/admin/users... | ✅ admin only | Role management |

## 5. Deployment notes

- **Database**: use MongoDB Atlas for production; put the connection string in `MONGO_URI`.
- **Secrets**: set a strong random `JWT_SECRET`; never commit `.env`.
- **CORS**: set `CLIENT_ORIGIN` to your deployed frontend's URL.
- **AI key**: set `ANTHROPIC_API_KEY` on the server only — it is never sent to the browser.
- Typical hosting: backend on Render/Railway/Fly.io/EC2, frontend as a static site
  (Netlify/Vercel/S3+CloudFront) pointed at the backend via `FINAI_API_BASE`.
