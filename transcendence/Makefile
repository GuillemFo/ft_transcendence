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

VOLUMES_DIR := volumes
DIRS := $(VOLUMES_DIR)/avatars $(VOLUMES_DIR)/mh_sqlite $(VOLUMES_DIR)/um_sqlite

up: $(DIRS)
	if [ ! -d certs ]; then echo "Making dir"; mkdir certs; fi
	openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
  -keyout certs/server-key.pem -out certs/server-cert.pem
	if [ ! -d passwords ]; then mkdir passwords; fi
	openssl rand -base64 128 > ./passwords/jwt
	docker compose up

$(VOLUMES_DIR)/%:
	@mkdir -p $@

prune:
	docker system prune -a -f
	docker volume prune -a -f

clean:
	rm -rf certs
	rm -rf passwords
#joseado de ferran
	@if [ ! -z "$$(docker ps -aq)" ]; then \
		docker stop $$(docker ps -aq); \
		docker rm $$(docker ps -aq); \
	fi
	@if [ ! -z "$$(docker images -aq)" ]; then \
		docker rmi -f $$(docker images -aq); \
	fi
	@if [ ! -z "$$(docker volume ls -q)" ]; then \
		docker volume rm $$(docker volume ls -q); \
	fi
	@if [ ! -z "$$(docker network ls -q --filter type=custom)" ]; then \
		docker network rm $$(docker network ls -q --filter type=custom); \
	fi
	@echo "$(GREEN)Deleted all docker containers, volumes, networks, and images succesfully$(END)"

fclean: clean
	rm -rf $(VOLUMES_DIR)

re: clean up

#https://docs.docker.com/reference/cli/docker/compose/

.PHONY: up prune clean fclean re
