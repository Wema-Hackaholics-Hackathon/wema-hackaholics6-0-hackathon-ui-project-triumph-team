## Backend: Local DB & Worker

- `npm run db:init` - initializes a local SQLite DB at `backend/trustshield.db` (dev convenience).
- `npm run seed` - runs existing JSON seeding script (unchanged).
- `npm run worker` - starts a simple rules worker that reads `data/events.json`, computes alerts via `lib/rulesEngine.js`, and writes alerts to the local DB. Safe to run alongside `npm start`.

Notes:
- Changes are non-blocking: the server still serves in-memory alerts and existing endpoints. The worker writes alerts to the DB and will not delete existing data.
