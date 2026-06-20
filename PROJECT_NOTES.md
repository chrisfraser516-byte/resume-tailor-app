[PROJECT_NOTES.md](https://github.com/user-attachments/files/29153545/PROJECT_NOTES.md)
# Sharpen — Project Notes

This file is the single source of truth for this project. If you're picking this up in a
new conversation with Claude (or any AI), paste in this file's contents (or just point to
this repo) and the GitHub repo URL so the work can continue without starting over.

**GitHub repo:** github.com/chrisfraser516-byte/resume-tailor-app
**Live site:** https://resume-tailor-app-vy2o.onrender.com
**Hosting:** Render, Starter plan ($7/month)

Last updated: June 19, 2026

---

## What this is

"Sharpen" — a web app where job seekers paste in their resume/LinkedIn text and a job
description, and get back a tailored resume (rewritten to match the job's language,
using only their real experience — no fabricated skills), a keyword match score, and a
downloadable Word doc.

## Current status: LIVE, working, free to use (no payments yet)

What's built and confirmed working as of this date:
- [x] Core resume tailoring tool (paste resume + job description → tailored output)
- [x] Keyword match scoring (matched vs. missing keywords from the job posting)
- [x] Change log (explains what was changed and why)
- [x] Copy to clipboard / download as .txt
- [x] Download as Word doc (.docx) — properly formatted with headers, bullets, bold name
- [x] Deployed live on Render, connected to GitHub for auto-deploy on commit
- [x] Mobile-responsive (works in phone browsers already, no extra work needed for this)

## Tech stack (current)

- **Frontend:** Single HTML file (`public/index.html`) — vanilla JS, no framework
- **Backend:** `server.js` — plain Node.js (no Express, no npm dependencies at all,
  uses only Node's built-in `http` module) — keeps the Anthropic API key private
- **AI:** Calls Anthropic's API directly (model: `claude-sonnet-4-6`) for the resume
  tailoring logic
- **Word doc generation:** Happens in the browser using the `docx` JS library, loaded via
  jsDelivr CDN: `https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.min.js`
  ⚠️ Note: do NOT use cdnjs.cloudflare.com for this library — it doesn't actually host
  it; this caused a real bug that took a while to debug. jsDelivr is the correct CDN.
- **Hosting:** Render, Starter instance ($7/mo), auto-deploys from GitHub `main` branch

## Important lessons learned (so we don't repeat mistakes)

1. **Opening .html files in TextEdit (Mac) breaks them** — TextEdit can render HTML as a
   page instead of showing raw code, and re-saves a corrupted "Cocoa HTML Writer" stub
   if you copy from the rendered view. Always edit code via GitHub's own web editor, or
   a real code editor (VS Code), never a plain text app that might "helpfully" render it.
2. **GitHub's upload-files feature renames instead of replacing** if a file with the same
   name already exists (e.g. creates `index (1).html` instead of overwriting). Check
   for duplicate files after uploading.
3. **Always verify CDN URLs actually exist** before relying on them — a wrong CDN path
   fails silently (no error in the page, just a blank "ReferenceError" later when the
   library is used).
4. **The Anthropic API key must NEVER be pasted into chat or committed to GitHub.** It
   only goes into Render's Environment Variables dashboard. A real key was accidentally
   exposed once during setup — it was revoked and replaced. The `.gitignore` file in
   this repo prevents `.env` from ever being committed.

## Business plan / pricing (decided, not yet built)

**Free tier:** 1 free tailored resume, gated by verified email (real clicked confirmation
link, not just typing an email) plus basic rate-limiting by IP/browser to prevent abuse.
Decided against a "preview only" free tier — a full real result is what proves the
product works and converts people to paying.

**Pay-per-resume (no subscription):**
- Single resume: $2.99
- 10-pack: $9.99 ($1.00/resume)

**Subscriptions (cancel anytime):**
- Monthly: $14.99/mo
- 3-month: $12.99/mo (billed $38.97 every 3 months, ~13% off)
- 12-month: $9.49/mo (billed $113.88 annually, ~37% off)
(Considered also offering a 6-month and 9-month tier; decided to keep it simple with
just these 3 to reduce complexity and decision paralysis.)

**Pricing rationale:** Researched competitors in June 2026 — Jobscan ($49.95/mo),
Kickresume ($4.50–19/mo), ResuFit ($14.90/mo), Four-Leaf ($20/mo or $5 one-time pass),
RankResume (~$0.23/resume in bundles). Sharpen is positioned mid-market: cheaper than
Jobscan, comparable to ResuFit, with per-use options matching Four-Leaf/RankResume's
model for casual users.

**Cost basis:** Each Anthropic API call costs a few cents at most — pricing has wide
margin over raw cost even at the cheapest tier.

## Competitive positioning (important strategic note)

Real risk identified: anyone can paste a resume + job description into Claude/ChatGPT
directly and get a similar rewrite for free. Raw "we rewrite resumes with AI" is NOT
a defensible moat on its own — competitors have realized this too (e.g. Four-Leaf and
others bundle tailoring with auto-apply, tracking, scoring as a full workflow, because
that's what a bare chatbot can't replicate).

**Decided differentiator: saved resumes + history.** A chatbot makes you re-paste your
resume every single time. Sharpen should let a user save their resume once, then
re-tailor it against new job postings in one step (just paste the new job description),
plus see a history of past tailored versions. This is the actual reason to choose
Sharpen over a raw AI chat — not "better writing," but "less repetitive work + memory."

## Build plan — what's next, in order

### Step 1: Accounts + database (NOT YET STARTED)
- Use **Supabase** — gives both a database AND auth (login/signup/password reset) in
  one service, reducing build complexity vs. building a custom login system.
- This is the foundation everything else depends on.

### Step 2: Payments (NOT YET STARTED)
- **Stripe Checkout** for taking payment (subscriptions + one-time purchases)
- **Stripe Customer Portal** for self-serve cancellation/plan changes (reduces support
  burden — people manage their own subscription without emailing us)
- **Stripe Smart Retries** (built-in feature, just toggle on) for automatically retrying
  failed card payments before we'd ever need to intervene manually

### Step 3: Free trial gating (NOT YET STARTED)
- Ties into Step 1's database: a `free_trial_used` flag per account
- Requires real email verification (click a link), not just typing an email

### Step 4: Usage tracking (NOT YET STARTED)
- Connects subscription/credit status to actual resume-generation counts
- Enforces limits (e.g. unlimited for subscribers, decrement credits for pay-per-use)

### Step 5: Saved resume + history feature (NOT YET STARTED — the differentiator)
- "Save this resume" option after pasting one in
- "My saved resumes" page
- "Tailor this saved resume against a new job" flow — skip re-pasting the resume
- History view of past tailored results

## Long-term cost considerations (discussed, for budgeting)

At small scale (handful–low hundreds of users), expect roughly $30–50/month in
infrastructure (Render + Supabase + an email-sending service like Resend for
verification emails), plus Stripe's ~2.9% + $0.30 per-transaction fee, plus Anthropic
API usage (scales with actual usage — a good sign, not a bad one).

At moderate growth (low thousands of users), expect roughly $75–150/month
infrastructure as free tiers get outgrown.

Other real but easy-to-miss ongoing considerations: customer support time (reduced by
Stripe's self-serve portal), failed payment handling (reduced by Stripe Smart Retries),
occasional refunds/chargebacks (Stripe charges ~$15 per disputed chargeback on top of
the refund), and the ongoing responsibility of protecting stored user emails/passwords
once accounts exist (mitigated by using Supabase Auth instead of a custom-built system).

## Marketing notes (early thinking, not yet executed)

Researched competitor marketing: most rely on content marketing (blog posts ranking in
search for "best resume tool 2026" etc.) rather than paid ads, since this is a slower
but cheaper channel.

Reddit identified as a plausible channel (subreddits like r/jobs, r/resumes,
r/careerguidance) — but with real risk of "just use ChatGPT" pushback, and Reddit
culture punishes disguised self-promotion harshly. Right approach if pursued: genuine
participation first, transparent disclosure ("I built this, sharing in case useful"),
use designated self-promo threads where they exist, never post identical content across
many subreddits at once.

**Decided: revisit marketing in depth once the product actually has working payments**
— strategy should be built around real numbers (actual cost per customer, actual
conversion rates) rather than guesses made before the product can take payment.

## How to resume this project in a new conversation

1. Share this file's contents (or just say "read PROJECT_NOTES.md in my repo")
2. Share the GitHub repo URL: github.com/chrisfraser516-byte/resume-tailor-app
3. Mention which step (1–5 above) you're currently working on
4. If something's broken on the live site, share the exact error from the browser's
   Console tab (right-click page → Inspect → Console) — this has been the fastest way
   to actually diagnose real bugs throughout this project, much faster than describing
   symptoms alone.
