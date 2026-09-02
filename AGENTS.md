# Project Overview

A minimal audio player with two parts: one for playing music files from the system filepicker and one for scanning the user's music library. Currently uses:
- a Flask backend, stored in /api
- a Postgres DB, which talks to the backend on port 5432
- a React frontend, stored in /src
- tests using Cypress, stored in /cypress
- environment variables stored in .env

# Setup commands

- Install dependencies: `npm install`
- Run the backend: `npm run api`
- Run the frontend: `npm run dev`
- Run tests: `npm run e2e`
- Run linting: `npm run lint`