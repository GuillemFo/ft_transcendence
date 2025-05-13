FROM node:18

WORKDIR /app

# Install create-next-app CLI globally
RUN npm install -g create-next-app

# Generate the app (name: my-app)
RUN create-next-app my-app --typescript --eslint --no-tailwind --use-npm

WORKDIR /app/my-app
RUN npm install

EXPOSE 3000
CMD ["npm", "run", "dev"]
