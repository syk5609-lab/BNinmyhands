## Getting Started

Run the backend first at `http://127.0.0.1:8000`, then start the frontend:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set `SCANNER_API_BASE_URL=http://127.0.0.1:8000` in `.env.local` if you need to override the default API base.

Validation:

```bash
npm run lint
npm run build
```

Launch routes:

- `/login`
- `/signup`
- `/account`
- `/community`
- `/admin` (admin role only)

Guest dashboard/detail access remains available. Account/profile and later write actions require login.

Runtime feature flags are server-backed and visible in `/admin`:

- `community_enabled`
- `ads_enabled`
- `write_actions_enabled`

If community is disabled, `/community` and coin-detail discussion stay calm and readable.
If ads are disabled, dashboard/detail ad slots collapse safely without breaking layout.
