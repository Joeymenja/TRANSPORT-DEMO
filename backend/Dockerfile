FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY services/auth-service/package*.json ./services/auth-service/
COPY services/member-service/package*.json ./services/member-service/
COPY services/transport-service/package*.json ./services/transport-service/

# Install all dependencies (including devDependencies for build)
RUN npm install

COPY . .

# Build all services (assumes turbo is configured or individual builds)
RUN npm run build --workspaces

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built services
COPY --from=builder /app/services/auth-service/dist ./services/auth-service/dist
COPY --from=builder /app/services/auth-service/package*.json ./services/auth-service/

COPY --from=builder /app/services/member-service/dist ./services/member-service/dist
COPY --from=builder /app/services/member-service/package*.json ./services/member-service/

COPY --from=builder /app/services/transport-service/dist ./services/transport-service/dist
COPY --from=builder /app/services/transport-service/package*.json ./services/transport-service/
COPY --from=builder /app/services/transport-service/uploads ./services/transport-service/uploads

# Expose ports
EXPOSE 8081 8082 8083

# Default command (overridden in docker-compose)
CMD ["node", "services/transport-service/dist/main"]
