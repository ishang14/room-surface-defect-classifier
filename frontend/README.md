# Frontend

React 19 + TypeScript + Vite + Tailwind CSS 4 single-page app for the Room Surface Defect Classifier. See the [root README](../README.md) for the full project.

## Scripts

```bash
npm install
npm run dev       # start the dev server on http://localhost:5173
npm run build     # type-check and produce a production build in dist/
npm run lint      # run ESLint
npm run preview   # serve the production build locally
```

## Configuration

Copy `.env.example` to `.env`. `VITE_API_BASE_URL` is the backend base URL including the `/api` suffix. It defaults to `http://127.0.0.1:8000/api` when unset. Vite inlines it at build time, so changing it requires a rebuild.

## Structure

```
src/
├── components/   Reusable UI (navbar, modals, cards, score widgets)
├── pages/        Login, Register, InspectionDashboard, InspectionReport
├── services/     Axios client and API calls (JWT attached automatically)
├── types/        Shared TypeScript types
└── config.ts     API / uploads base URLs
```

Routes: `/login`, `/register`, `/` (dashboard) and `/inspections/:id/report`. The last two require a JWT.
