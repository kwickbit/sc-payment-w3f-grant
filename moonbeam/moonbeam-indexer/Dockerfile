# Use Node.js as the base image
FROM node:23

# Install pnpm globally so it can be cached
RUN apt-get update

# Set working directory
WORKDIR /app

# Copy only package.json and pnpm-lock.yaml files to leverage Docker cache
COPY package.json ./ 

# Install dependencies
RUN npm install

# Install subsquid CLI
RUN npm i -g @subsquid/cli@latest

# Copy the rest of the application code
COPY . .

RUN npm run build

# Start Fastify in development mode
CMD ["bash", "-c", "sqd run ."]

EXPOSE 4350