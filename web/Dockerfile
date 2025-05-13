FROM node:18

# Create app folder and set it as working dir
WORKDIR /app

# Install create-next-app globally
RUN npm install -g create-next-app

# Create a new Next.js + TypeScript app inside the container
RUN create-next-app my-app --typescript

# Debug: List the contents of the /app directory
RUN ls -la /app

# Switch to the newly created app directory
WORKDIR /app/my-app

# Debug: List the contents of the /app/my-app directory
RUN ls -la

# Ensure dependencies are installed (optional but safe)
RUN npm install

# Expose dev port
EXPOSE 3000

# Start the dev server
CMD ["npm", "run", "dev"]
