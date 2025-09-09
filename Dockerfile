# Dockerfile for Next.js fortune-telling app development

# Use the official Node LTS version as the base image
FROM node:20-alpine

# Create app directory and set it as the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies first
# (This allows Docker to cache npm install results when only application code changes)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the port Next.js will run on
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
