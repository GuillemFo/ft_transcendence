'use strict';
import Fastify from 'fastify'
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import routes from './routes.js'
import path from 'path';
import cookie from '@fastify/cookie'
import cors from '@fastify/cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: false,
})

fastify.register(fastifyStatic, {
    root: path.resolve(__dirname, '../avatars/'),
    prefix: '/avatars/',
    cacheControl: true,
    maxAge: '30d'
});

fastify.register(fastifyMultipart, {
    addToBody: true,
    // throwFileSizeLimit: true,
    // limits: {
    //     fileSize: 2 * 1024 * 1024,
    //     files: 1
    // },
});

await fastify.register(cors, {
	origin: "http://localhost:3000",
	methods: ['POST', 'PUT', 'GET', 'DELETE'],
	allowedHeaders: 'Content-Type,Authorization',
	exposedHeaders: 'Content-Type,Authorization',
	credentials:true,
})

fastify.register(cookie, {
})

fastify.get('/', async (request, reply) => {
    return { ping: 'pong' }
})

routes.forEach((route) => {
    fastify.route(route);
});


const start = async () => {
    try {
        await fastify.listen({port: 3002, host:'0.0.0.0'});
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()
