# Voxio Admin

Admin panel for managing Voxio: clients, credits, files, transcription jobs, transcripts, system users, roles, permissions, personal account, and sessions.

## Tech Stack

- Vue 3 + TypeScript
- Vite 7
- Pinia
- Vue Router
- Axios
- Tailwind CSS 4

## Requirements

- Node.js 20+
- pnpm 10+

## Local Development

```bash
pnpm install
pnpm dev
```

By default, the app runs at `http://localhost:5173`.

## Build

```bash
pnpm build
pnpm preview
```

## Environment Variables

The admin app communicates with the API through Axios. In dev mode, Vite proxies `/api` to the backend.

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for API requests (runtime) | `/api` |
| `VITE_API_PROXY_TARGET` | Backend URL for Vite dev proxy | `http://localhost:3000` |

### `.env` Example

```env
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:3000
```

## How API Works in Dev Mode

- Frontend requests go to `/api/*`
- Vite proxies them to `VITE_API_PROXY_TARGET`
- For cookie-based auth, the proxy rewrites `Set-Cookie Path=/` to `Path=/api/`
- If the API is unavailable, the proxy returns `503` with an error message

## Docker

The project includes a separate `docker-compose.yml` for the admin panel.

```bash
docker compose up -d
```

- **Admin:** http://localhost

By default, the admin connects to the API at `host.docker.internal:3000` (API running on the host). Ensure the API is running before starting the admin.

On Linux, if `host.docker.internal` does not work, set `API_HOST` to your host IP or add `extra_hosts` in docker-compose.

## Authentication and Access Control

- **Login:** `POST /auth/login` (via `/api/auth/login` in dev)
- **Refresh:** `POST /auth/refresh` (uses HTTP-only cookie)
- **Logout:** `POST /auth/logout`
- Current user is resolved from access token payload (`userId`, `permissions`) + `GET /users/:id`
- Admin panel access requires `manage.all`
- Section access is controlled by permissions:
  - **Clients:** `manage.all` (clients, credits, storage, jobs, transcripts)
  - **System users:** `users.read`, `users.create`, `users.update`
  - **Roles:** `roles.read`, `roles.create`, `roles.update`
  - **Permissions:** `permissions.read`, `permissions.create`, `permissions.update`

## Main Pages

| Path | Description |
|------|-------------|
| `/login` | Sign in |
| `/` | Dashboard |
| `/settings` | Settings |
| **Clients** | |
| `/clients` | Clients list |
| `/clients/new`, `/clients/:id/edit` | Client form |
| `/clients/storage` | File storage |
| `/credits` | Credits |
| `/jobs` | Transcription jobs |
| `/transcripts` | Transcripts |
| **Administration** | |
| `/users` | System users |
| `/users/new`, `/users/:id/edit` | User form |
| `/roles` | Roles |
| `/roles/new`, `/roles/:id/edit` | Role form |
| `/permissions` | Permissions |
| `/permissions/new`, `/permissions/:id/edit` | Permission form |
| `/my-account` | My account + sessions |

## Project Structure

```text
src/
  app/              # router, providers
  entities/         # domain base types (client, credit, job, transcript, file, user, role, permission)
  features/         # auth, users, roles, permissions, clients, credits, jobs, transcripts, files, theme
  pages/            # route pages
  shared/           # api client, shared UI, constants, composables
  widgets/          # layout, sidebar
```

## Notes

- Sessions are not mocked; list/delete operations use real API endpoints.
- The "My Account" dropdown item opens the account page.
- Profile editing fields are planned for a next iteration and are currently a placeholder.
