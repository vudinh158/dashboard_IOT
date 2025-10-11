# Stage 1: Builder (install deps)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production  # Chỉ production deps để image nhẹ

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

# Copy node_modules từ builder
COPY --from=builder /app/node_modules ./node_modules
# Copy toàn bộ source code (bao gồm src và bất kỳ file nào khác)
COPY ./src ./src

# Env vars mặc định
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

# Tạo non-root user (đổi tên thành nodejs cho phù hợp)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Health check cho /health endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Chạy app
CMD ["node", "src/app.js"]
