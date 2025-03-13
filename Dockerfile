# Stage 1: Build the application
FROM node:20-alpine AS builder

ENV WORKDIR=/telegram-bot

# Set the working directory
WORKDIR $WORKDIR

# Copy root pnpm files
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies for the entire workspace
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . $WORKDIR

# Build the specific service (my-app)
RUN pnpm build

# Stage 2: Create the production image
FROM node:20 AS production

ENV WORKDIR=/telegram-bot

# Set the working directory
WORKDIR $WORKDIR

# Copy root pnpm files
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install production dependencies for the entire workspace
RUN pnpm install --prod --frozen-lockfile

# Copy the built application from the builder stage
COPY --from=builder $WORKDIR/dist ./dist

# Expose the port the app runs on
EXPOSE 3000
EXPOSE 3002

USER root

# Start the specific service
CMD ["node", "dist/main"]