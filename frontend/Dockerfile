# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy source
COPY frontend/ .

# Build React app
RUN npm run build

# Production stage - serve with node
FROM node:18-alpine

WORKDIR /app

# Install serve to run the static build
RUN npm install -g serve

# Copy built app from build stage
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Run server
CMD ["serve", "-s", "dist", "-l", "3000"]
