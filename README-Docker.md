# WireVault – Docker Deployment Bundle

This folder contains everything to run WireVault in containers with automatic HTTPS via Caddy.

## Files
- `Dockerfile` – Multi-stage build for Next.js + Prisma.
- `docker-compose.yml` – Default stack using a named volume `wirevault-data`.
- `docker-compose.lxc.yml` – Alternate stack for Proxmox LXC with a host bind mount at `/data`.
- `Caddyfile` – Serves `/uploads/*` directly from the data volume and reverse proxies the app.
- `docker/entrypoint.sh` – Runs `prisma migrate deploy` before starting the app.
- `prisma/seed.cjs` – Optional production seed script (admin + DEMO01).
- `.dockerignore`
- `.env.compose.example` – Example env file for Compose.

## Quick start (generic server)
```bash
# 1) Copy these files into your project root
# 2) Create a .env (compose) from the example
cp .env.compose.example .env
# Edit DOMAIN, EMAIL, and set a strong SESSION_HMAC_SECRET

# 3) Build & run
docker compose up -d --build

# 4) (Optional) seed demo/admin
docker compose run --rm app node prisma/seed.cjs
```

Your site will be at: `https://$DOMAIN`

- Uploads: `/uploads/<shortId>/<file>` (served by Caddy from the shared data volume)
- SQLite DB: `/data/prod.db` (inside the volume)

## Proxmox LXC variant
If you created an LXC with a **mount point** from the host to `/data` in the container, use:

```bash
docker compose -f docker-compose.lxc.yml up -d --build
```

This binds the app & caddy to `/data` so your DB and uploads live on the Proxmox host storage.

## Updates
```bash
git pull
docker compose up -d --build app
```

## Rollback
```bash
git checkout v1.0.0   # or any known-good tag/commit
docker compose up -d --build app
```

## Backups (DB + uploads)
```bash
docker run --rm -v wirevault-data:/data -v "$PWD":/backup alpine \\
  sh -c 'tar -czf /backup/wirevault-backup-$(date +%F-%H%M).tgz -C / data'
```

> For the LXC variant replace the volume with `-v /data:/data`.

## Notes
- The app expects `UPLOAD_ROOT=/data/uploads`, so `/uploads/*` maps to files on disk.
- Entry point applies DB migrations automatically (`prisma migrate deploy`).
- Keep Prisma migrations committed in your repo.
