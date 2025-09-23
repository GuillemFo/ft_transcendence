# front/Dockerfile
FROM node:24

WORKDIR /app
COPY ./front/app_vite /app/front
# This right now is being built and done inside app_vite using its own node_modules folder.
# For dev, this is fine and better, but we will have to do the proper install later on 
# with a script or something following this:
# https://doc.babylonjs.com/guidedLearning/usingVite
# https://tailwindcss.com/docs/installation/using-vite
# Probably will have to copy the node_modules installed at root to the front/app_vite folder
# package.json will also need new tunning

##############################################
#Pre vite commands that might not be necessary 
#RUN npm install -D typescript@latest
#RUN npm install tailwindcss@latest
#this is to compile tailwind
#RUN npm install @tailwindcss/cli
#this is to init tailwind
#RUN npm install tailwindcss-cli@latest
#RUN npx tailwindcss-cli@latest init
##############################################


######################################################
# https://doc.babylonjs.com/guidedLearning/usingVite
# https://tailwindcss.com/docs/installation/using-vite
#
RUN npm i vite@6
RUN npm i @babylonjs/core
RUN npm i @babylonjs/gui
RUN npm i @babylonjs/inspector
#
RUN npm install tailwindcss @tailwindcss/vite@latest
######################################################

EXPOSE 3000
CMD ["sh", "-c", "cd front && npm run dev"]
