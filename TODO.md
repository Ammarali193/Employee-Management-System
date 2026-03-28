# EMS Frontend Setup for Production API

## Completed
- [x] Create `.env.local` with `NEXT_PUBLIC_API_URL=https://employee-management-system-production-9f59.up.railway.app/api`
- [x] Update `services/api.js` to use `process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"`

## Next Steps
1. Restart Next.js dev server: `npm run dev`
2. Test API calls (login, fetch employees/shifts/etc.)
3. For Vercel deployment: Add `NEXT_PUBLIC_API_URL` env var in Vercel dashboard
4. Deploy: `vercel --prod`
