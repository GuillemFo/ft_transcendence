FROM node:24-alpine3.21

#*Database
RUN apk update && apk add sqlite

#*Nodejs & fastify
WORKDIR /api/
COPY conf/ ./

RUN npm install
RUN npm install fastify
RUN npm install @fastify/cors
RUN npm install @fastify/swagger
RUN npm install @fastify/swagger-ui

RUN npm install -g nodemon
RUN npm install jsonwebtoken
RUN npm install @fastify/cookie

EXPOSE 3001

CMD ["sh", "init.sh"]
