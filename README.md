🏠 Mera Basera
A student room & PG finder — built for college students in India.
Every year, thousands of students clear their board exams, get into a college, and then hit a wall nobody prepared them for: where do I actually live? Mera Basera solves that — search your college name and instantly see nearby verified rooms and PGs, with rent, distance from campus, amenities, and real photos.
🔗 Live site: mera-basera.netlify.app
---
What it does
🔍 Search by college — type your college name, see nearby listings instantly
✅ Verified badges — listings can be manually verified for extra trust
📸 Real photos — owners upload actual photos of the room
🏠 Roommate finder — students can list themselves and find someone to split rent with
🔑 Free owner registration — a dedicated page for PG/room owners to list their property in ~2 minutes
💬 Feedback system — public testimonials, moderated before going live
🔐 Accounts — students and owners can sign up, log in, and save favorite listings to a personal dashboard
⭐ Premium listings — owners can pay for a badge + top placement in search results
Tech stack
Frontend: React + Vite, React Router
Backend: Supabase — PostgreSQL database, Auth, Storage, auto-generated REST API with Row Level Security
Hosting: Netlify (auto-deploys from this repo on every push to `main`)
Getting started locally
```bash
npm install
npm run dev
```
To build for production:
```bash
npm run build
```
Project structure
```
src/
  components/   → reusable UI pieces (Nav, ListingCard, modals)
  pages/        → Home, RegisterOwner, Dashboard
  lib/          → Supabase client, auth context, helpers
```
About
Built by Ayush Sharma, a student at Ambalika University, Lucknow — starting from a simple, universal problem: admission season leaves zero time to find decent housing near campus.
Currently live and being tested around Ambalika University, with more colleges to follow.
