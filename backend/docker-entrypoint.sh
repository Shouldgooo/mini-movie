#!/bin/sh
set -e

echo "Initializing database schema if needed..."
npx prisma db init -y

echo "Seeding movies if needed..."
npx tsx scripts/seed.ts

echo "Starting MiniMovie API..."
exec npx tsx src/server.ts
