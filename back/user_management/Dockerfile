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
RUN npm install bcrypt
RUN npm install google-auth-library --save

EXPOSE 3010
CMD ["sh", "init.sh"]