# Perimeter — Base44 dev environment

## Stack
- Vite + React 18 + TypeScript + Tailwind CSS 3
- React Router (client-side routing), Zustand (modal state), lucide-react (icons)
- No backend / no database / no external secrets — pure frontend prototype

## Run
```
docker compose -f docker-compose.base44.yml up -d --build
```
- The `web` service runs `npm install` then `vite dev` on port 5173, mapped to host port 3000.
- Source is bind-mounted, so edits hot-reload in the preview.

## Verify
- `curl -sf -H "Host: external.preview.example" http://localhost:3000/` returns the app HTML.
- Preview loads the Dashboard at `/`; nav routes: `/ledger`, `/containment`, `/settings`.

## Notes
- Vite is configured with `server.host: true` and `allowedHosts: true` so the external preview hostname is accepted.
- No `.env` or secrets are required to boot.
