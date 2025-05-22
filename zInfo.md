the idea is to compile all from the Makefile (ill do it soon tm)

for now u can add your work to docker-compose.yaml services that will use the Dockerfile from /docker/backend/Dockerfile *example

and add your src at trancendence/back/src or whatever *example

Im building and destroying images a lot so be aware to branch all properly and push. (dont want to destroy anyone's work XD)

rn there is no network nor volumes between the dockers but if/ when needed just remember inception ;)

Ill use this file to update info, put important or useful links and more.

Useful commands:
- tree -> shows a tree of folders
- docker exec -it container_name /bin/bash -> exec bash in a container and enter to work


https://docs.docker.com/reference/cli/docker/compose/

https://www.server-world.info/en/note?os=Debian_12&p=nodejs&f=6

To do gforns:
investigate if compile tailwind css at package.json
prepare a shared folder with local and docker

moving to glopez branch:
https://github.com/5d10/ft_dancingtrans
