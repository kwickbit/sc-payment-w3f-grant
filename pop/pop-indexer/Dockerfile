# Use Node.js as the base image
FROM node:23

# Install pnpm globally so it can be cached
RUN apt-get update && \
    npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy only package.json and pnpm-lock.yaml files to leverage Docker cache
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

RUN pnpm run build

# Start Fastify in development mode
CMD ["bash", "-c", "npx squid-typeorm-migration apply && node -r dotenv/config lib/main.js"]