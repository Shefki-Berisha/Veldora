# Use a base image with Node.js
FROM node:21.7.3-alpine

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies for canvas and other packages
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev libjpeg-turbo-dev giflib-dev

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm dependencies
RUN apk add --no-cache libc6-compat
RUN apk add --no-cache libc6-compat cairo pango libjpeg-turbo-dev
RUN apk add --no-cache fontconfig ttf-dejavu
RUN npm install --omit=dev
RUN npm install -g typescript
RUN npm install ts-node
RUN npm install dotenv
RUN npm install discord.js
RUN npm install -g node-gyp
RUN npm install canvas
RUN npm install mongodb
RUN npm install glob
RUN npm install request
RUN npm install uuid
RUN npm install captcha-canvas

# Copy the rest of your application code
COPY . .

# Optionally, compile TypeScript if you're using it
RUN npm install -g typescript
RUN tsc

# Command to run your app
CMD ["node", "dist/index.js"]  # Adjust based on your entry point