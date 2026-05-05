# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Add user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy dependencies and application files
COPY --from=builder --chown=expressjs:nodejs /app ./

USER expressjs
EXPOSE 5050

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:5050/api/health || exit 1

CMD ["npm", "start"]
