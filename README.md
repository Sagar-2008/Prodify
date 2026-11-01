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

For a fresh database, run `Database.sql` once with MySQL. It creates the `prodify` database, its existing tables, and the new productivity tables. If the base database already exists, the migration command below safely creates any missing productivity tables.

### 1. Start the backend

    cd backend
    npm install
    npm run migrate:productivity
    npm run dev

Configure the backend environment and database before starting it. The API listens on port 5000 by default.

### 2. Start the frontend

    cd frontend
    npm install
    npm run dev

Open the local Vite URL printed in the terminal (usually localhost:5173).

Keep both terminals running while you use the site. Sign in to sync your account data across sessions and devices.

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
