# Sharpen — Resume Tailoring App

A small local web app that tailors your resume to a specific job posting.

## What's in this folder

```
resume-tailor-app/
├── server.js          ← the backend (no installs needed — pure Node.js)
├── .env.example        ← template for your API key
└── public/
    └── index.html       ← the actual app (frontend)
```

## Setup (one time)

### 1. Get an Anthropic API key
- Go to **console.anthropic.com** and sign up / log in (this is separate from claude.ai — different login, different billing).
- Go to **Settings → API Keys** and create a new key. It looks like `sk-ant-api03-...`.
- Go to **Settings → Billing** and add a small amount of credit (a few dollars covers a lot of testing — each resume tailoring request costs a few cents at most).
- Copy the key somewhere safe. Anthropic only shows it once.

### 2. Add your key to this project
In this folder, make a copy of `.env.example` and rename it to `.env`:

```
cp .env.example .env
```

Open `.env` in any text editor and replace the placeholder with your real key:

```
ANTHROPIC_API_KEY=sk-ant-api03-your-real-key-here
```

Save the file. **Never share this file or commit it to GitHub** — anyone with this key can use your API credits.

### 3. Make sure you have Node.js installed
Check by running:
```
node --version
```
If that fails, install Node.js from **nodejs.org** (the LTS version is fine), then try again.

## Running the app

From inside this folder, run:

```
node server.js
```

You should see:
```
Sharpen is running!
Open this in your browser: http://localhost:3000
```

Open that link in your browser. The app should load, and the "Tailor my resume" button and file upload should now work.

To stop the server, go back to the terminal and press `Ctrl+C`.

## Troubleshooting

**"No API key found on the server"** — your `.env` file is missing, misnamed, or the key wasn't saved. Double check it's named exactly `.env` (not `.env.txt`) and sits in the same folder as `server.js`.

**"Anthropic API request failed" / authentication error** — double-check you copied the full key correctly, with no extra spaces, and that you've added billing credit in the console.

**Port already in use** — another app is using port 3000. Run it on a different port:
```
PORT=3001 node server.js
```
(then open `http://localhost:3001` instead)

**Nothing happens when I click the button** — open your browser's developer console (right-click → Inspect → Console tab) and check for red error text; that'll tell us exactly what's wrong.

## Once this works locally

When you're ready to put this somewhere other people can access (not just your computer), let's talk hosting — options like Render, Railway, or Fly.io can run this exact server with minimal changes, and Vercel/Netlify work too with small adjustments since they're built more for serverless functions than long-running servers.
