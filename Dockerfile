FROM node:20-bullseye

# Install FFmpeg and Chromium dependencies required by Remotion
RUN apt-get update && apt-get install -y \
    ffmpeg \
    chromium \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libasound2 \
    libxss1 \
    libcups2 \
    libxcomposite1 \
    libxrandr2 \
    libxdamage1 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libdrm2 \
    libgbm1 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer executable path so Remotion finds Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js app
RUN npm run build

EXPOSE 3000

# Start the server
CMD ["npm", "start"]
