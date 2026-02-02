# UniSpot Frontend

React + TypeScript + Vite frontend for UniSpot. Uses TanStack Query, existing auth/RBAC guards, and a shared UI component set.

## Local setup

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Key routes

- Public
  - `/` Home
  - `/courses` Courses
  - `/courses/:courseId/reviews` Course + Teacher Reviews
  - `/study-sheets`
  - `/leases`
- Student
  - `/student`
  - `/leases/mine`
  - `/student/study-sheets/*`
  - `/student/lease-listings/*`
- Moderation (STAFF/ADMIN)
  - `/moderation/study-sheets`
  - `/moderation/reviews`
  - `/moderation/teacher-reviews`
  - `/moderation/teacher-suggestions`
  - `/moderation/lease-listings`
- Admin (ADMIN)
  - `/admin`
  - `/admin/payments`

## UX highlights

- Courses page supports search and student course creation.
- Course Reviews page includes course reviews + teacher reviews with sorting, reporting, and moderation status badges.
- Teacher reviews are created by entering a teacher name directly (no teacher list required).
- Admin/Staff navigation grouped under collapsible Moderation/Admin sections.

## Notes

- Backend endpoints, auth, interceptors, and RBAC guards are assumed to be provided by the existing UniSpot API.
- All data fetching/mutations use TanStack Query.
