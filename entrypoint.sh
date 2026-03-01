#!/bin/sh

# Deploy changes to the database
npx prisma migrate deploy --schema=/prisma/schema.prisma

# Launch nginx
exec "$@"

