#!/bin/sh

# Deploy changes to the database
npx prisma migrate deploy

# Launch nginx
exec nginx -g "daemon off"

