# Stage 1: Build the Angular application
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies using npm ci for deterministic builds
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build --configuration=production

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the custom nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application from the build stage
# Note: Output path changed in Angular 17+. Usually dist/project-name/browser
# Need to use base-project instead of SanadAngular because angular.json still uses "base-project"
COPY --from=build /app/dist/base-project/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
