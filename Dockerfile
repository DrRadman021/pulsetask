FROM node:22-alpine AS runner

WORKDIR /app

# Install all dependencies (including TypeScript devDependencies) needed for build
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Build Next.js app in production mode
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000
RUN npm run build

# Expose port
EXPOSE 3000

CMD ["npm", "run", "start"]
