cd /api/db

touch match_history.db

if [ ! -s match_history.db ]; then
	sqlite3 match_history.db < ../config.sql
fi

cd /api/src

nodemon api
