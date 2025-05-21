#From transcendence main folder launch:
##########
#docker compose build frontend
#docker run -d --name front_cont -p 3000:3000 transcendence-frontend
##########


#Others
#docker compose -f ./docker-compose.yml up --detach --build
#docker compose build
#docker compose up -d
#docker exec -it <container_id> /bin/bash
#docker ps
#docker compose down
#docker run -d -p 3000:3000 --name <container_name> <image_name>
#Dangerous:
#docker system prune -a (wipe all)
#docker volume ls
#docker network ls
#docker ... prune (remove)
#docker rmi [image name or id] (rm image)

https://docs.docker.com/reference/cli/docker/compose/
