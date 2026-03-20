FROM node:22-alpine AS base
WORKDIR /app

COPY package.json turbo.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/

RUN npm install

COPY packages/ packages/
COPY apps/api/ apps/api/

RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

EXPOSE 4000
CMD ["npx", "tsx", "apps/api/src/index.ts"]
