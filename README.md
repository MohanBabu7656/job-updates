# Stack School — Job Finder Dashboard

An AI-powered job search and WhatsApp post generator built with **Next.js**, **Adzuna API**, and **NVIDIA NIM**.

## What it does

1. **Searches** latest IT jobs in India via Adzuna API
2. **Verifies** each job URL is live before showing it
3. **Formats** a copy-ready WhatsApp post using NVIDIA NIM (Llama 3.1)
4. You **copy & paste** to your WhatsApp channel — no auto-posting, no ban risk

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Job Search**: [Adzuna API](https://developer.adzuna.com) (free)
- **LLM**: [NVIDIA NIM](https://build.nvidia.com) — `meta/llama-3.1-8b-instruct` (free)

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/job-finder.git
cd job-finder
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
```
Then fill in your keys in `.env.local`:

| Variable | Where to get it |
|----------|----------------|
| `ADZUNA_APP_ID` | [developer.adzuna.com](https://developer.adzuna.com) |
| `ADZUNA_APP_KEY` | Same as above |
| `NVIDIA_NIM_API_KEY` | [build.nvidia.com](https://build.nvidia.com) → Get API Key |

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── page.js                    # Root page
├── layout.js                  # Dark theme layout
├── JobFinderDashboard.js      # Main dashboard orchestrator
├── SearchPanel.js             # Filters sidebar
├── JobCard.js                 # Job card + WhatsApp preview
├── StatsBar.js                # Stats summary bar
└── api/jobs/
    ├── search/route.js        # Adzuna job search
    └── verify/route.js        # URL verify + LLM framing
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repository
3. Add these **Environment Variables** in Vercel dashboard:
   - `ADZUNA_APP_ID`
   - `ADZUNA_APP_KEY`
   - `NVIDIA_NIM_API_KEY`
4. Deploy ✅

## Usage

1. Pick a **preset** (Python, Java, etc.) or type custom keywords
2. Set filters: location, days old, min salary
3. Click **🔍 Find Jobs**
4. Watch cards appear with real-time status: `Queued → Checking URL → AI Formatting → ✅ Active`
5. Click **📋 Copy Post** → paste into WhatsApp Channel

---

Built for [Stack School](https://stackschool.in) 🚀
