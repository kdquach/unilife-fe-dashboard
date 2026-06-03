# UniLife Admin Dashboard - Sprint 1

ReactJS + Ant Design + Tailwind CSS dashboard for UniLife Sprint 1 Admin User Management.

## Features

- Orange UniLife branding with provided logo assets.
- Admin login screen.
- Dashboard shell with sidebar and topbar.
- User Management module:
  - List users.
  - Search by name, email, phone.
  - Filter by role and status.
  - Create user.
  - Update user profile fields.
  - Update user role inline.
  - Activate/deactivate account.
  - View user detail drawer.
- Mock mode by default, ready to connect to NodeJS/Express backend.

## Tech stack

- ReactJS
- Vite
- Ant Design
- Tailwind CSS
- Axios
- React Router

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Login in mock mode:

```txt
admin@unilife.local / Password@123
```

## Backend API mapping

Set `VITE_USE_MOCK=false` when backend is ready.

Expected APIs:

```txt
POST   /api/v1/auth/login
GET    /api/v1/users?page=&limit=&keyword=&role=&status=
GET    /api/v1/users/:id
POST   /api/v1/users
PATCH  /api/v1/users/:id
PATCH  /api/v1/users/:id/status
PATCH  /api/v1/users/:id/role
```

The current User fields are aligned with the backend seed/model direction:

```txt
id/fullName/email/phone/role/avatarUrl/isActive/createdAt/updatedAt
```

## Notes for team

This is only the Admin User Management scope for Sprint 1. Later modules can be added under `src/pages` and `src/features` using the same structure.
