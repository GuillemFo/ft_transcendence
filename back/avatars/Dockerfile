FROM node:24-alpine3.21

WORKDIR /api/
COPY conf/ ./

RUN npm install
RUN npm install fastify
RUN npm install @fastify/static
RUN npm install @fastify/multipart
RUN npm install @fastify/cors
RUN npm install -g nodemon
RUN npm install @dicebear/core @dicebear/collection --save
RUN npm install sharp
RUN npm install jsonwebtoken
RUN npm install @fastify/cookie

EXPOSE 3002
CMD ["sh", "init.sh"]
