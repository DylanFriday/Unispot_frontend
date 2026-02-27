# UniSpot Frontend

A React + TypeScript single-page application for UniSpot that lets users discover courses, read/write reviews, browse and purchase study sheets, and manage lease listings with role-based access for students and admins.

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
- **Role-Based Access** - Route protection for student and admin-side access using `ProtectedRoute` and `RoleRoute`.
- **Course Reviews** - Browse courses and post/view course and teacher reviews.
- **Study Sheet Marketplace** - Public listing, student-owned study sheet CRUD, and purchase flow.
- **PromptPay QR Payment Support** - Study sheet purchases generate EMV payload + QR from `VITE_PROMPTPAY_PHONE`.
- **Lease Marketplace** - Public lease listing browsing and student lease listing management.
- **Dashboard + Wallet** - Shared dashboard landing and student wallet flow.
- **Profile + My Reviews** - Authenticated profile management and student review history.
- **Moderation Workspace** - Admin-side moderation pages for study sheets, leases, teacher reviews, and teacher suggestions.
- **Admin Tools** - Payments, withdrawals, and report moderation routes.

---

## Admin Side Screenshots

### Admin Login

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 22 27 31" src="https://github.com/user-attachments/assets/e48360e8-1c5d-4c24-b79b-a50007d6ce72" />

### Dashboard

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 22 30 54" src="https://github.com/user-attachments/assets/e7d66247-0703-4097-a9a3-f12c264980a2" />

### Study Sheets

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 22 28 00" src="https://github.com/user-attachments/assets/bacaddde-ecd5-4e9a-a50a-6de4fbd95f4a" />

### Leases Marketplace

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 22 28 12" src="https://github.com/user-attachments/assets/90ed46f7-8447-4a4c-b971-8b424fbf323d" />

### Course Reviews (Course List)

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 22 28 20" src="https://github.com/user-attachments/assets/91b28209-f4f9-4fe8-ae76-f53f9456f4e0" />

### Course Reviews (Detail)

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 22 28 39" src="https://github.com/user-attachments/assets/34c975b9-3059-46cb-a311-b82dc5dc8920" />

### Study Sheet Moderation

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 22 29 13" src="https://github.com/user-attachments/assets/f8be6da8-be4e-4146-9805-6944e593d8c6" />

### Teacher Review Moderation

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 22 29 22" src="https://github.com/user-attachments/assets/89b92a7e-3ac6-4f3b-bceb-643e0f84747b" />

### Lease Moderation

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 22 29 30" src="https://github.com/user-attachments/assets/c36a3f74-5323-464c-af2e-de0fc1bd777c" />

### Payments

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 22 29 36" src="https://github.com/user-attachments/assets/e1ecfefd-e781-480d-afe0-b3d87f7e0b8d" />

### Withdrawals

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 22 29 50" src="https://github.com/user-attachments/assets/da33aaa1-e8d4-4f81-ab1e-0333a19a11f8" />

### Report Moderation

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 22 30 11" src="https://github.com/user-attachments/assets/e9375a74-b33b-4344-9ac8-f607d2181e13" />

### Profile

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 22 30 25" src="https://github.com/user-attachments/assets/1d59062a-d36c-4823-b083-cf83ecb2ed64" />

---

## Student Side Screenshots

### Register

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 23 43 12" src="https://github.com/user-attachments/assets/ecb2937d-9fb1-475f-8b88-877d07edf1b2" />

### Dashboard

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 23 00 32" src="https://github.com/user-attachments/assets/36a7bb64-6fc0-4307-9299-32410e44db32" />

### Study Sheets Marketplace

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 23 00 43" src="https://github.com/user-attachments/assets/a38515da-d78d-4524-9c69-17a5e1ae979d" />

### Study Sheet Purchase Modal

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 23 44 07" src="https://github.com/user-attachments/assets/589c7a0f-1825-4b1a-b90a-ffa2735453c6" />

### Leases Marketplace

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 23 44 15" src="https://github.com/user-attachments/assets/7c94d4c7-1e9e-4856-b575-6c476edba29c" />

### Course Reviews (Course List)

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 23 44 31" src="https://github.com/user-attachments/assets/8eb38768-8fb9-46eb-95bb-218c75cfdca5" />

### Course Reviews (Course Review Tab)

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 23 44 42" src="https://github.com/user-attachments/assets/42ed496b-dff2-4c72-bf91-5defea078efc" />

### Course Reviews (Teacher Review Tab)

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 23 44 52" src="https://github.com/user-attachments/assets/a8c7ffd8-2689-452c-b99f-83f037573135" />

### My Study Sheets (My Uploads)

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 23 45 10" src="https://github.com/user-attachments/assets/1a14dbc8-4654-4475-8aa1-ee072132c039" />

### My Study Sheets (Purchased)

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 23 45 18" src="https://github.com/user-attachments/assets/ced785e0-8c16-4442-bcf2-04ec6e5f5d5b" />

### Create New Study Sheet

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 23 45 46" src="https://github.com/user-attachments/assets/a060a02e-f6ec-40e5-8914-fdc7a3ec3c50" />

### My Lease Listings

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 23 49 18" src="https://github.com/user-attachments/assets/f4b3a08e-c4ec-4417-97d6-9e9487edc640" />

### Create New Lease Listing

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 23 45 56" src="https://github.com/user-attachments/assets/a0d43221-c100-414b-b9e3-76858f1174a4" />

### Wallet

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 23 46 04" src="https://github.com/user-attachments/assets/4db93fe0-b44f-4a2f-80e3-6a8432a78594" />

### My Profile

<img width="1470" height="833" alt="Screenshot 2569-02-27 at 23 46 15" src="https://github.com/user-attachments/assets/bc8b95d3-1952-4e98-a6c8-0581c4b6e5d9" />

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
| Moderation | `/moderation/*`, `/moderation/study-sheets`, `/moderation/lease-listings`, `/moderation/teacher-reviews`, `/moderation/teacher-suggestions` | Admin-side moderation access |
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
- Across frontend and backend code, moderation endpoints and pages are grouped under admin-side workflows.
