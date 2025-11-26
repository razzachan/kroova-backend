# Use Node 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --no-cache

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3333

# Start application
CMD ["npm", "run", "start"]
