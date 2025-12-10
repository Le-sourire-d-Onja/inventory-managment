#!/bin/sh

# Deploy changes to the database
npx prisma migrate deploy

npm run start -p 80
