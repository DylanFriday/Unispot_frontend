# UniSpot Frontend

A React + TypeScript single-page application for UniSpot that lets users discover courses, read/write reviews, browse and purchase study sheets, and manage lease listings with role-based access for students, staff, and admins.

<h2>Team Members</h2>
<table>
  <thead>
    <tr>
      <th>Name</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>SITT HMUE EAIN</td>
    </tr>
    <tr>
      <td>HSU MYAT NOE MAUNG MAUNG</td>
    </tr>
    <tr>
      <td>WIN THUTA AUNG</td>
    </tr>
  </tbody>
</table>

## Tech Stack

| Layer        | Technology |
| ------------ | ---------- |
| **Frontend** | React 19, TypeScript, Vite 7, React Router v7 |
| **State**    | TanStack Query |
| **HTTP**     | Axios (JWT Bearer interceptor + 401 redirect handler) |
| **Forms**    | React Hook Form + Zod |
| **UI**       | Tailwind CSS, Recharts, reusable shared components |

---

## Features

- **Authentication** - Register/login flow with profile bootstrap via `/auth/me`.
- **Role-Based Access** - Route protection for `STUDENT`, `STAFF`, and `ADMIN` using `ProtectedRoute` and `RoleRoute`.
- **Course Reviews** - Browse courses and post/view course and teacher reviews.
- **Study Sheet Marketplace** - Public listing, student-owned study sheet CRUD, and purchase flow.
- **PromptPay QR Payment Support** - Study sheet purchases generate EMV payload + QR from `VITE_PROMPTPAY_PHONE`.
- **Lease Marketplace** - Public lease listing browsing and student lease listing management.
- **Dashboard + Wallet** - Shared dashboard landing and student wallet flow.
- **Profile + My Reviews** - Authenticated profile management and student review history.
- **Moderation Workspace** - Staff/admin moderation pages for study sheets, leases, teacher reviews, and teacher suggestions.
- **Admin Tools** - Payments, withdrawals, and report moderation routes.

---

## Admin Side Screenshots

### Admin Login

![Admin login](docs/screenshots/admin/admin-login.png)

### Dashboard

![Dashboard](docs/screenshots/admin/dashboard.png)

### Study Sheets

![Study sheets](docs/screenshots/admin/study-sheets.png)

### Leases Marketplace

![Leases marketplace](docs/screenshots/admin/leases-marketplace.png)

### Course Reviews (Course List)

![Course reviews list](docs/screenshots/admin/course-reviews-list.png)

### Course Reviews (Detail)

![Course reviews detail](docs/screenshots/admin/course-reviews-detail.png)

### Study Sheet Moderation

![Study sheet moderation](docs/screenshots/admin/mod-study-sheets.png)

### Teacher Review Moderation

![Teacher review moderation](docs/screenshots/admin/mod-teacher-reviews.png)

### Lease Moderation

![Lease moderation](docs/screenshots/admin/mod-lease-listings.png)

### Payments

![Payments](docs/screenshots/admin/payments.png)

### Withdrawals

![Withdrawals](docs/screenshots/admin/withdrawals.png)

### Report Moderation

![Report moderation](docs/screenshots/admin/report-moderation.png)

### Profile

![Profile](docs/screenshots/admin/profile.png)

---

## Project Structure

```txt
Unispot_frontend/
├── docs/
│   └── screenshots/
│       └── admin/
├── public/
├── src/
│   ├── api/
│   │   ├── http.ts                        # Axios instance + auth interceptors
│   │   ├── auth.api.ts                    # Auth endpoints
│   │   ├── courses.api.ts                 # Course endpoints
│   │   ├── reviews.api.ts                 # Course review endpoints
│   │   ├── teacherReviews.api.ts          # Teacher review endpoints
│   │   ├── studySheets.api.ts             # Study sheet endpoints
│   │   ├── leaseListings.api.ts           # Lease listing endpoints
│   │   ├── leases.api.ts                  # Lease marketplace endpoints
│   │   ├── moderation.api.ts              # Study sheet moderation endpoints
│   │   ├── reviewModeration.api.ts        # Review moderation endpoints
│   │   ├── teacherReviewModeration.api.ts # Teacher review moderation endpoints
│   │   ├── teacherSuggestions.api.ts      # Teacher suggestion endpoints
│   │   ├── leaseModeration.api.ts         # Lease moderation endpoints
│   │   ├── payments.api.ts                # Payment/admin endpoints
│   │   ├── withdrawals.api.ts             # Admin withdrawal endpoints
│   │   ├── reports.api.ts                 # Admin report moderation endpoints
│   │   ├── profile.api.ts                 # Profile endpoints
│   │   ├── wallet.api.ts                  # Wallet endpoints
│   │   ├── dashboard.api.ts               # Dashboard endpoints
│   │   └── purchases.api.ts               # Study sheet purchase endpoints
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   └── useAuth.ts
│   ├── components/                        # Shared UI (Button, Modal, Table, Alert, etc.)
│   ├── layouts/
│   │   └── AppLayout.tsx
│   ├── pages/
│   │   ├── admin/
│   │   ├── dashboard/
│   │   ├── moderation/
│   │   ├── courses/
│   │   ├── leases/
│   │   ├── profile/
│   │   ├── reviews/
│   │   └── wallet/
│   ├── routes/
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleRoute.tsx
│   ├── utils/
│   │   ├── promptpay.ts
│   │   ├── format.ts
│   │   └── money.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── README.md
```

---

## Route Access Matrix

| Area | Routes | Access |
| ---- | ------ | ------ |
| Public | `/`, `/login`, `/register`, `/courses`, `/courses/:courseId/reviews`, `/study-sheets`, `/lease-listings`, `/leases` | Everyone |
| Authenticated | `/dashboard`, `/profile`, `/student/*`, `/student/study-sheets/*`, `/student/lease-listings/*` | Any logged-in user |
| Student only | `/study-sheets/create`, `/leases/mine`, `/wallet`, `/reviews/mine` | `STUDENT` |
| Moderation | `/moderation/*`, `/moderation/study-sheets`, `/moderation/lease-listings`, `/moderation/teacher-reviews`, `/moderation/teacher-suggestions` | `STAFF` or `ADMIN` |
| Admin | `/admin`, `/admin/payments`, `/admin/withdrawals`, `/admin/reports` | `ADMIN` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- UniSpot backend service running and reachable

### Install and Run

```bash
npm install
npm run dev
```

Default local URL: `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Environment Variables

Create `.env` in project root:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_PROMPTPAY_PHONE=0936022762
VITE_ADMIN_EMAIL=admin@example.com
VITE_ADMIN_PASSWORD=your_admin_password
```

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `VITE_API_BASE_URL` | Yes | Base URL for backend API calls (`src/api/http.ts`). |
| `VITE_PROMPTPAY_PHONE` | Recommended | PromptPay phone/ID used to generate purchase QR payload on study sheets page. |
| `VITE_ADMIN_EMAIL` | Optional | Enables one-click admin login button on login page. |
| `VITE_ADMIN_PASSWORD` | Optional | Password paired with `VITE_ADMIN_EMAIL` for quick admin login. |

---

## Backend Integration

This frontend is wired for the UniSpot backend located on your machine at:

`/Users/noey/Desktop/GitHub/Unispot_backend`

Ensure backend CORS allows the frontend origin during local development.

---

## Notes

- Access token is stored in `localStorage` key `access_token`.
- Request interceptor injects `Authorization: Bearer <token>`.
- On `401`, the client clears token and redirects to `/login`.
- Post-auth landing redirects to `/dashboard` for all roles in current frontend logic.
