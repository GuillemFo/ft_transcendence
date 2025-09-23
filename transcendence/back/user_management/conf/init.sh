cd /api/db

touch users.db

if [ ! -s users.db ]; then
	sqlite3 users.db < ../config.sql
fi

cd /api/src

nodemon api
