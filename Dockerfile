# ---- base
FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- deps
FROM base AS deps
# 👇 Skip prisma generate during npm ci (schema not copied yet)
ENV PRISMA_SKIP_GENERATE=1
COPY package.json package-lock.json* ./
RUN npm ci

# ---- build
FROM deps AS build
COPY prisma ./prisma
# 👇 Now the schema exists; safe to generate
RUN npx prisma generate
COPY . .
RUN npm run build

# ---- runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -g 1001 nodejs && adduser -S -u 1001 nextjs
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.mjs ./next.config.mjs
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
USER 1001
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm","start"]
