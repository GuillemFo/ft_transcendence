FROM node:24-alpine3.21

#*Database
RUN apk update && apk add sqlite

#*Nodejs & fastify
WORKDIR /api/

COPY conf/ ./

RUN npm install
RUN npm install fastify
RUN npm install sqlite3
RUN npm install sequelizer
RUN npm install @sequelize/core
RUN npm install -g nodemon

EXPOSE 3012
CMD ["sh", "init.sh"]