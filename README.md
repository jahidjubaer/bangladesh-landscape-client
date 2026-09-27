# বাংলাদেশ ল্যান্ডস্কেপ — Client

React frontend of Bangladesh Landscape, a district-by-district travel portal for Bangladesh (AI tour plans, verified local guides, blogs, stay/transport bookings). Bangla-first with full English support.

**Stack**: React 19 + Vite · React Router 7 · Tailwind CSS 4 + DaisyUI 5 · TanStack Query · Motion (Framer) · Swiper · Leaflet · Quill — JavaScript only.

Backend API: [`bangladesh-landscape-server`](../../../bangladesh-landscape-server)

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173 — proxies /api and /uploads to :5000
```

The API server must be running on port 5000 (see the server repo).

## Build

```bash
npm run build      # outputs dist/
```

For production, set `VITE_API_URL` to the deployed API's `/api/v1` base URL.
