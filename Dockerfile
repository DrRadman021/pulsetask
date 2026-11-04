FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install dependencies needed for build
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Build Next.js app
RUN npm run build

# Expose port and declare volume for persistent SQLite database
EXPOSE 3000
VOLUME ["/app/data"]

CMD ["npm", "run", "start"]
