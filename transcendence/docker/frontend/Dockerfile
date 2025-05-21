# docker/frontend/Dockerfile
FROM node:18

WORKDIR /app

COPY front/package*.json ./
RUN npm install

COPY front ./

# Build the typescript
RUN npm run build

# build the talwind
RUN npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify

#cpy files manually
RUN cp src/index.html dist/
RUN cp -r src/styles dist/

# Temporal "serve" to prompt fast // Will need to remove and prepare a proper nginx or whatever?? 
RUN npm install -g serve


EXPOSE 3000

# Serve the built files from ./dist
CMD ["serve", "-s", "dist", "-l", "3000"]


