'use strict';
import Fastify from 'fastify'

import db from './db.js'
import routes from './routes.js'

const fastify = Fastify({
})

fastify.get('/', async (request, reply) => {
    return { ping: 'pong' }
})

routes.forEach((route) => {
    fastify.route(route);
});

async function database() {
    try {
        await db.sync();
        console.log("db sync successful");
    } catch (e) {
       console.log(e);
    }
}

const start = async () => {
    try {
        await fastify.listen({port: 3010, host:'0.0.0.0'});
        database();
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()
