# FormCraft

**Describe your form in a sentence. Get a working form in seconds.**

FormCraft is an AI-first form builder. Type what you want to collect — "a customer feedback form for a coffee shop with a rating and an open comment" — and it drafts the fields, labels, and validation for you. Refine with a drag-and-drop editor, publish to a hosted page, and start collecting responses. No boilerplate, no schema wrangling.

---

## Why FormCraft

Most form tools make you build every field by hand. FormCraft starts from intent. You write a prompt, an AI turns it into a structured form, and you spend your time refining instead of assembling. It is the difference between filling out a spreadsheet and describing what you actually need.

- **Prompt to form in one step.** Natural-language generation produces a complete, sensible schema — not a blank canvas.
- **Full control after generation.** Everything the AI makes is editable. Reorder, retitle, retype, and tune validation without touching code.
- **Ship immediately.** Publish to a clean, hosted page at a shareable link and collect responses the same minute.

---

## Features

- **AI form generation** — Turn a plain-English description into a structured form with typed fields, labels, options, and validation rules.
- **Drag-and-drop builder** — Reorder fields, edit properties, and preview live. Eleven field types: text, long text, email, phone, number, select, radio, checkbox, date, file, and star rating.
- **Autosave with undo/redo** — Every change is saved as you work, with full undo and redo history.
- **Publish and host** — One click publishes your form to a hosted page at `/f/<slug>`. Unpublish just as easily.
- **Response collection** — Submissions are validated server-side with Zod against your form's schema, then stored and ready to review.
- **Dashboard and analytics** — Manage every form, browse responses, and view submission trends.
- **Rate limiting** — Public submission endpoints are throttled per IP to keep abuse in check, and fail open so an infrastructure hiccup never blocks a real response.
- **Authentication** — Email/password and Google sign-in, backed by secure JWT sessions.
- **Billing built in** — Free, Pro, and Business plans with subscription checkout and signature-verified webhooks.

---

<img width="1897" height="1079" alt="Screenshot 2026-08-21 133219" src="https://github.com/user-attachments/assets/86a76da0-74cd-4f01-a093-88ef5c6addf6" />

<img width="1894" height="998" alt="Screenshot 2026-08-21 133347" src="https://github.com/user-attachments/assets/a94c1f31-59fd-423f-b8e1-2713824f41c5" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/63add4c1-194e-41bd-97a8-79209a7e75ec" />


## How it works

1. **Describe** — Write a sentence about the form you need.
2. **Generate** — The AI drafts fields, types, and validation.
3. **Refine** — Adjust anything in the drag-and-drop editor; changes autosave.
4. **Publish** — Go live at a shareable link.
5. **Collect** — Responses are validated, stored, and surfaced in your dashboard.

---
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f15859a2-0475-47e5-9b10-64f1d4cd472c" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f4ec8a32-8855-4d64-b997-298b4d70e035" />


## Tech stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI, Framer Motion, Lucide |
| Database | MongoDB with Mongoose |
| Auth | NextAuth v5 (Google + credentials, JWT sessions) |
| AI | OpenRouter chat completions |
| Validation | Zod |
| Builder | dnd-kit drag-and-drop, nanoid slugs |
| Rate limiting | Upstash Redis + Ratelimit |
| Billing | Razorpay subscriptions |
| Charts & UX | Recharts, Sonner toasts, Geist font |

---

## Getting started

### Prerequisites

- Node.js 18.18+ (or 20+)
- A MongoDB database (local or Atlas)
- An OpenRouter API key for AI generation

### Setup

```bash
git clone <your-repo-url>
cd formcraft
npm install
```

Create a `.env` file in the project root:

```bash
# --- Required ---
MONGODB_URI=your-mongodb-connection-string
AUTH_SECRET=a-long-random-secret            # e.g. `openssl rand -base64 32`
OPENROUTER_API_KEY=your-openrouter-key

# --- Optional: Google sign-in (falls back to email/password if unset) ---
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# --- Optional: AI model + app URL ---
OPENROUTER_MODEL=meta-llama/llama-3.1-70b-instruct   # default if unset
NEXT_PUBLIC_APP_URL=http://localhost:3000

# --- Optional: rate limiting (skipped entirely if unset) ---
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# --- Optional: billing (only needed for paid plans) ---
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PLAN_PRO_MONTHLY=
RAZORPAY_PLAN_PRO_YEARLY=
RAZORPAY_PLAN_BUSINESS_MONTHLY=
RAZORPAY_PLAN_BUSINESS_YEARLY=
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Build for production with `npm run build` and serve with `npm start`.

---

## Plans

| Plan | Price | Highlights |
| --- | --- | --- |
| **Free** | ₹0 | 3 forms, 100 responses/mo, 10 AI generations/mo |
| **Pro** | ₹499/mo · ₹4,990/yr | Unlimited forms, 5,000 responses/mo, unlimited AI, no branding |
| **Business** | ₹999/mo · ₹9,990/yr | Everything in Pro, 5 team seats, webhooks |

---

## Project structure

```
app/
  (dashboard)/        Authenticated app — builder, editor, responses, billing
  f/[slug]/           Public hosted form pages
  api/                Route handlers (forms, submissions, billing)
components/           UI primitives and builder components
hooks/                Form builder state (autosave, undo/redo)
lib/                  AI, database, rate limiting, Razorpay, validation
models/               Mongoose models (Form, Submission)
```

---

## Deployment

FormCraft deploys cleanly to any platform that runs Next.js. On Vercel, import the repository, add the environment variables above, and deploy. Point `NEXT_PUBLIC_APP_URL` at your production domain and set your OAuth redirect and Razorpay webhook URLs to match.

---

Crafted with care by Devanshu Singh. Powered by Next.js and OpenRouter.
