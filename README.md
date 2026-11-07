# ZENKAI OS

ZENKAI OS is Prodify's personal productivity command center. It brings daily quests, long-term goals, learning practice, habits, focus sessions, ambient music, analytics, and journaling into one workspace.

## What is included

- **Command center:** today’s quests, habits, focus time, learning activity, goals, and power level.
- **Quest board:** create missions, set a category and due date, mark work complete, and earn XP.
- **Goals and projects:** track milestones toward longer-term outcomes.
- **Training log:** record DSA, courses, projects, reading, and other practice, including problems solved.
- **Existing Prodify tools:** habit calendar, Pomodoro timer, ambient audio, analytics, journal, and email OTP authentication.
- **Progression:** quests, focus sessions, training time, and completed training items add XP to a personalized Saiyan-style power curve.
- **Personalization:** create your own quest, goal, and training categories and tune XP rewards, level pace, and transformation names.

Quest, goal, training, category, and progression data sync through the authenticated Express API to MySQL. Existing browser-only quest, goal, and training entries are imported into the first account that syncs on that browser.

## Run locally

Use two terminals from the repository root. MySQL must be running and the backend environment must point to it (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and the existing authentication and mail settings).

For a fresh database, run `npm run migrate:base` once with the backend environment configured. It applies `Database.sql` to create the `prodify` database and existing tables. Then run `npm run migrate:productivity` to create any missing productivity tables.

### 1. Start the backend

    cd backend
    npm install
    npm run migrate:base
    npm run migrate:productivity
    npm run dev

Configure the backend environment and database before starting it. The API listens on port 5000 by default.

### 2. Start the frontend

    cd frontend
    npm install
    npm run dev

Open the local Vite URL printed in the terminal (usually localhost:5173).

The frontend reads the API address from `VITE_API_URL`; when unset, it uses `http://localhost:5000`.

Keep both terminals running while you use the site. Sign in to sync your account data across sessions and devices.

## Deploy for free

The free personal setup uses Vercel Hobby for both the React site and Express API, TiDB Cloud Starter for MySQL-compatible storage, and Gmail SMTP for verification codes. It uses provider subdomains, so you do not need to buy a domain. TiDB Cloud Starter does not require a credit card. Vercel Hobby is for personal, non-commercial use.

Free services have limits: the API scales down when idle and may have a cold start. Vercel Hobby pauses the affected service when its free limits are reached rather than charging for overages. Vercel functions also limit request and response bodies to 4.5 MB, so character poster uploads are limited to 3 MB to account for base64 encoding. TiDB Cloud Starter includes 5 GiB of row storage and 50 million request units per month; it blocks new connections if the free quota is exceeded. Keep TiDB on the free plan and do not enable consumption-based billing. [Vercel Hobby plan](https://vercel.com/docs/plans/hobby), [Vercel function limits](https://vercel.com/docs/functions/limitations), and [TiDB Starter quotas](https://docs.pingcap.com/tidbcloud/select-cluster-tier/).

### 1. Create the free database

Create a TiDB Cloud Starter instance and copy its public connection host, port, username, and password from the Connect dialog. Use port `4000`; this app enables TLS for the public database connection.

From the repository, initialize the schema using the same connection details. In PowerShell:

    cd backend
    Copy-Item .env.example .env

Fill in `DB_HOST`, `DB_USER`, and `DB_PASSWORD` in `backend/.env`, then run:

    npm install
    npm run migrate:base
    npm run migrate:productivity

These commands create the `prodify` database and all app tables. Keep `.env` private; do not commit it.

### 2. Deploy the API

In Vercel, import this repository as a project with Root Directory `backend`. Select the free Hobby plan. Add these environment variables in the project's settings: `DB_HOST`, `DB_PORT=4000`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=prodify`, `DB_SSL=true`, `JWT_SECRET` (a long random secret), `EMAIL_USER`, `EMAIL_PASS`, and `ALLOWED_ORIGINS` (the frontend's full origin, added after deploying the site). The email variables use a Gmail account and its App Password.

To create a Google App Password, turn on 2-Step Verification on the Google account and create an app password for this service. [Google's instructions](https://support.google.com/accounts/answer/185833). Vercel allows outbound SMTP connections on Gmail's ports; it blocks port 25, which this setup does not use. [Vercel's SMTP guidance](https://vercel.com/kb/guide/serverless-functions-and-smtp).

After Vercel deploys, copy the project URL, such as `https://zenkai-api.vercel.app`. Once the database is created, configured, and migrated, opening `<API URL>/healthz` should return a status of `ok`.

### 3. Deploy the site

In Vercel, import the same repository as a second project with Root Directory `frontend`. Set `VITE_API_URL` to the full Vercel API URL (no trailing slash), then deploy. Copy the site's Vercel origin (for example, `https://zenkai-web.vercel.app`, no trailing slash) into the API project's `ALLOWED_ORIGINS` environment variable and redeploy the API. Sign up to confirm the API wakes and Gmail delivers the verification code.

For local setup, copy `frontend/.env.example` to `frontend/.env.local` and set `VITE_API_URL=http://localhost:5000`.

## Frontend checks

    cd frontend
    npm run lint
    npm run build
    npm test

`npm test` runs the browser-independent timer and palette checks. Backend API tests use a disposable pair of database accounts; run `npm test` from `backend` after configuring MySQL. They do not send email. Manual browser acceptance cases, including OTP delivery and responsive interactions, are listed in [docs/TEST_PLAN.md](docs/TEST_PLAN.md).

## Project structure

- frontend/ — React 19, Vite, React Router, and the ZENKAI OS interface.
- backend/ — Express API, authentication, habits, Pomodoro sessions, and journal routes.
- Database.sql — database schema.
