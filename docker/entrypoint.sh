#!/bin/sh
set -e
# Apply DB migrations (idempotent in production)
npx prisma migrate deploy
exec "$@"
