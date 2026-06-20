[PROJECT_NOTES (1).md](https://github.com/user-attachments/files/29155541/PROJECT_NOTES.1.md)
# Sharpen — Project Notes

This file is the single source of truth for this project. If you're picking this up in a
new conversation with Claude (or any AI), paste in this file's contents (or just point to
this repo) and the GitHub repo URL so the work can continue without starting over.

**GitHub repo:** github.com/chrisfraser516-byte/resume-tailor-app
**Live site:** https://sharpenresumes.com (custom domain, verified, SSL active)
**Also still works:** https://resume-tailor-app-vy2o.onrender.com (Render's default URL)
**Hosting:** Render, Starter plan ($7/month)
**Domain:** sharpenresumes.com, purchased via Namecheap, renews ~$18.48/yr (Domain Privacy
included free)
**Database/Auth:** Supabase project "sharpen-resume-tailor" (free tier)

Last updated: June 19, 2026 (evening session — accounts, payments groundwork)

---

## What this is

"Sharpen" — a web app where job seekers paste in their resume/LinkedIn text and a job
description, and get back a tailored resume (rewritten to match the job's language,
using only their real experience — no fabricated skills), a keyword match score, and a
downloadable Word doc.

## Current status: LIVE on custom domain, accounts/login working, payments NOT built yet

What's built and confirmed working as of this date:
- [x] Core resume tailoring tool (paste resume + job description → tailored output)
- [x] Keyword match scoring (matched vs. missing keywords from the job posting)
- [x] Change log (explains what was changed and why)
- [x] Copy to clipboard / download as .txt
- [x] Download as Word doc (.docx) — properly formatted with headers, bullets, bold name
- [x] Deployed live on Render, connected to GitHub for auto-deploy on commit
- [x] Mobile-responsive (works in phone browsers already, no extra work needed for this)
- [x] Custom domain (sharpenresumes.com) connected to Render, SSL certificate active
- [x] User accounts: sign up / log in / log out via Supabase Auth (email + password)
- [x] Email confirmation flow works end-to-end (tested live, confirmed working)

## What's NOT done yet (in priority order)

1. **Branded confirmation emails (IN PROGRESS — pick up here next session)**
   Right now, signup confirmation emails arrive from Supabase's generic shared sender
   ("Supabase Auth <noreply@mail.app.supabase.io>"), NOT from sharpenresumes.com. This
   works for testing but looks untrustworthy/spammy to a real stranger signing up, and
   Supabase's shared sender is also rate-limited (2 emails/hour) and unreliable at scale.

   **Next step:** Set up Resend (resend.com) to send these emails from our own domain.
   1. Go to resend.com -> Domains -> Add Domain -> enter `sharpenresumes.com`
   2. Resend will show DNS records (TXT/MX/CNAME) to add
   3. Add those records in Namecheap's Advanced DNS (same screen used for the Render
      domain setup -- add alongside existing records, don't delete those)
   4. Wait for Resend to verify the domain (DNS propagation, can take time)
   5. In Supabase: Authentication -> Emails -> SMTP Settings -> connect to Resend (there's
      a guided "Connect to Supabase" flow on Resend's side too -- check resend.com/supabase)
   6. Test by signing up again and confirming the email now comes from
      noreply@sharpenresumes.com (or similar) instead of Supabase's generic address

2. **Payments (Stripe) — NOT STARTED**
   - Stripe Checkout for subscriptions + one-time purchases
   - Stripe Customer Portal for self-serve cancellation/plan changes
   - Stripe Smart Retries (toggle on) for failed payment handling

3. **Free trial gating — NOT STARTED**
   - Ties to a `free_trial_used` flag per account in the Supabase database
   - Requires a real `profiles` or similar table (currently only Supabase's built-in
     `auth.users` table exists — no custom app tables have been created yet)

4. **Usage tracking — NOT STARTED**
   - Connects subscription/credit status to actual resume-generation counts

5. **Saved resume + history feature — NOT STARTED (the competitive differentiator)**
   - "Save this resume" option, "My saved resumes" page, re-tailor against new job
     postings without re-pasting, history view
   - Important: this is NOT just a side feature — it's the actual reason to choose
     Sharpen over pasting into a raw AI chatbot like Claude/ChatGPT directly (see
     "Competitive positioning" section below)

## Tech stack (current)

- **Frontend:** Single HTML file (`public/index.html`) — vanilla JS, no framework
- **Backend:** `server.js` — plain Node.js (no Express, no npm dependencies at all,
  uses only Node's built-in `http` module) — keeps the Anthropic API key private
- **AI:** Calls Anthropic's API directly (model: `claude-sonnet-4-6`) for the resume
  tailoring logic, via our own `/api/tailor` backend endpoint
- **Word doc generation:** Happens in the browser using the `docx` JS library, loaded via
  jsDelivr CDN: `https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.min.js`
- **Accounts/Auth:** Supabase Auth, loaded via jsDelivr CDN:
  `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
  Our server exposes a `/api/config` endpoint that hands the Supabase URL + anon/public
  key to the frontend (safe to expose — protected by Row Level Security, not secrecy)
- **Database:** Supabase Postgres (project: sharpen-resume-tailor, free tier, region:
  East US/Ohio). Row Level Security is enabled by default on new tables (important —
  keep this on for any new tables we create).
- **Hosting:** Render, Starter instance ($7/mo), auto-deploys from GitHub `main` branch
- **Domain:** sharpenresumes.com via Namecheap, DNS records point to Render (A record
  @ -> 216.24.57.1, CNAME www -> resume-tailor-app-vy2o.onrender.com)
- **Email (in progress):** Moving from Supabase's default sender to Resend, using the
  sharpenresumes.com domain

## Environment variables currently set in Render

- `ANTHROPIC_API_KEY` — Anthropic API key (server-side only, never exposed to browser)
- `SUPABASE_URL` — Supabase project URL (e.g. https://skxpcdlhshgnufjaxlzu.supabase.co)
- `SUPABASE_ANON_KEY` — Supabase "Publishable key" / anon key (safe for browser exposure,
  protected by Row Level Security — this is intentionally sent to the frontend via
  /api/config)

Note: Supabase has renamed `anon`/`service_role` keys to `Publishable`/`Secret` keys in
their newer dashboard UI. They are the same underlying credentials — use Publishable
key for `SUPABASE_ANON_KEY`, never use the Secret key in this app at all (it bypasses
Row Level Security and must never be exposed to the browser or committed to GitHub).

## Important lessons learned (so we don't repeat mistakes)

1. **Opening .html files in TextEdit (Mac) breaks them** — TextEdit can render HTML as a
   page instead of showing raw code, and re-saves a corrupted "Cocoa HTML Writer" stub
   if you copy from the rendered view. Always edit code via GitHub's own web editor, or
   a real code editor (VS Code), never a plain text app that might "helpfully" render it.
2. **GitHub's upload-files feature renames instead of replacing** if a file with the same
   name already exists (e.g. creates `index (1).html` instead of overwriting), AND if you
   delete the only file in a folder, Git deletes the now-empty folder too (Git doesn't
   track empty folders). If this happens: create a `path/.gitkeep` placeholder file
   first (typing the full `folder/.gitkeep` path in "Create new file") to recreate the
   folder, THEN navigate into that folder on GitHub and upload into it from inside —
   uploading while "standing inside" the target folder lands files correctly.
3. **Always verify CDN URLs actually exist** before relying on them — a wrong CDN path
   fails silently (no error in the page, just a blank "ReferenceError" later when the
   library is used). This happened with the docx library (cdnjs.cloudflare.com doesn't
   actually host it — jsDelivr does, at a specific build path that took real research
   to find correctly: build/index.umd.min.js, not index.umd.js).
4. **The Anthropic API key must NEVER be pasted into chat or committed to GitHub.** It
   only goes into Render's Environment Variables dashboard. A real key was accidentally
   exposed once during setup — it was revoked and replaced. The `.gitignore` file in
   this repo prevents `.env` from ever being committed.
5. **Supabase's "Site URL" setting defaults to localhost:3000** and must be manually
   changed to the real production domain (Authentication -> URL Configuration), or email
   confirmation links will send users to a broken localhost link. Also add the
   production domain + /* to "Redirect URLs" in that same settings page.
6. **Supabase's default/shared email sender is unreliable and unbranded** — limited to
   ~2 emails/hour, sends from a generic Supabase address, sometimes doesn't deliver at
   all (especially to Gmail). Production apps need a custom SMTP provider (Resend,
   SendGrid, Mailgun) connected in Authentication -> Emails -> SMTP Settings.
7. **"Premium" domain pricing trap:** some seemingly-normal domain names are flagged as
   "premium" by registrars and priced at hundreds or thousands of dollars instead of the
   normal ~$10-15/year. Always check the actual price shown before adding to cart.
   The domain we ultimately bought, sharpenresumes.com, was confirmed at normal pricing
   (~$18.48/yr renewal) — but an earlier check on the same name briefly showed an
   unrelated $1,100 premium listing, which we correctly did NOT purchase.
8. **Domain registrar DNS interfaces vary in confusing ways** — Namecheap has at least
   two different DNS-editing screens (a "bulk" Actions-menu version with separate
   "Record Name" AND "Host" fields, vs. the standard single-domain "Advanced DNS" tab
   with just one "Host" field). Prefer the standard single-domain path: Domain List →
   click the domain name itself → Advanced DNS tab → Add New Record. Avoid the bulk
   "Actions" dropdown unless intentionally doing a multi-domain operation.
9. **New domain purchases often come with default placeholder DNS records** (e.g. a
   parking-page CNAME, a URL redirect record) that must be deleted before adding the
   real records pointing to your host — otherwise they conflict.
10. **Don't use a CNAME record for the root/bare domain (@ host)** — most DNS providers
    (including Namecheap) advise against this since it can break MX/email records. Use
    an A record pointing to the host's IP instead (Render provided 216.24.57.1 as the
    fallback A-record value specifically for this case). CNAME is fine for `www`.

## Business plan / pricing (decided, not yet built)

**Free tier:** 1 free tailored resume, gated by verified email (real clicked confirmation
link, not just typing an email) plus basic rate-limiting by IP/browser to prevent abuse.
Decided against a "preview only" free tier — a full real result is what proves the
product works and converts people to paying.

**Pay-per-resume (no subscription):**
- Single resume: $2.99
- 10-pack: $9.99 ($1.00/resume)

**Subscriptions (cancel anytime) — simplified to 3 tiers:**
- Monthly: $14.99/mo
- 3-month: $12.99/mo (billed $38.97 every 3 months, ~13% off)
- 12-month: $9.49/mo (billed $113.88 annually, ~37% off)
(Originally considered 4 tiers including 6-month and 9-month; simplified to 3 to reduce
complexity and decision paralysis.)

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
This is item #5 in the "what's not done yet" build list above — it depends on having
accounts (done) and will need its own database table for storing saved resumes.

## Build plan — what's next, in order

1. ~~Accounts + database (Supabase)~~ — DONE
2. **Branded confirmation emails (Resend) — IN PROGRESS, pick up here**
3. Payments (Stripe) — NOT STARTED
4. Free trial gating — NOT STARTED
5. Usage tracking — NOT STARTED
6. Saved resume + history feature (the differentiator) — NOT STARTED

## Long-term cost considerations (discussed, for budgeting)

At small scale (handful–low hundreds of users), expect roughly $30–50/month in
infrastructure (Render $7/mo + Supabase free tier + Resend free tier + domain ~$1.50/mo
amortized), plus Stripe's ~2.9% + $0.30 per-transaction fee once payments exist, plus
Anthropic API usage (scales with actual usage — a good sign, not a bad one).

At moderate growth (low thousands of users), expect roughly $75–150/month
infrastructure as free tiers get outgrown.

Other real but easy-to-miss ongoing considerations: customer support time (reduced by
Stripe's self-serve portal, once built), failed payment handling (reduced by Stripe
Smart Retries, once built), occasional refunds/chargebacks (Stripe charges ~$15 per
disputed chargeback on top of the refund), and the ongoing responsibility of protecting
stored user emails/passwords (mitigated by using Supabase Auth instead of a custom-built
system — already done).

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
3. Mention which step you're currently working on (check "What's NOT done yet" above —
   next session should start with finishing the Resend email setup)
4. If something's broken on the live site, share the exact error from the browser's
   Console tab (right-click page → Inspect → Console) — this has been the fastest way
   to actually diagnose real bugs throughout this project, much faster than describing
   symptoms alone.
5. For DNS/domain registrar work specifically: Namecheap's interface has inconsistent
   screens depending on navigation path (see lesson #8 above) — if something looks
   different than expected, say so rather than guessing, since this tripped us up
   multiple times before.
