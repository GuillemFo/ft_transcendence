# Dockerfile
FROM node:18

WORKDIR /app

COPY my-app/ .

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]

