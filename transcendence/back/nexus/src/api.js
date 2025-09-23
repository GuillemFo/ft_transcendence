'use strict';
import Fastify from 'fastify'
import cors from '@fastify/cors'
import routes from './routes.js'
import cookie from '@fastify/cookie'
import fs from 'fs'

const fastify = Fastify({
})

await fastify.register(import('@fastify/swagger'), {
    openapi: {
        info: {
            title: 'Nexus API',
            description: 'API to connect frontend and backend for our transdance',
            version: 'dev'
        }
    }
})

fastify.register(cookie, {});

await fastify.register(import('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false
    },
    uiHooks: {
        onRequest: function (request, reply, next) { next() },
        preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
    transformSpecificationClone: true
})


await fastify.register(cors, {
	origin: "https://localhost:3000",
    methods: ['POST', 'PUT', 'GET', 'DELETE'],
	allowedHeaders: 'Content-Type,Authorization',
	exposedHeaders: 'Content-Type,Authorization',
	credentials:true,
})

fastify.get('/', {
    schema: {
        description: 'Redirect to this page',
        tags: ['misc'],
        summary: 'Root',
    },
        handler: async (request, reply) => {
        reply.redirect('/docs');
    }
})

fastify.get('/ping', {
    schema: {
        description: 'Test connection',
        tags: ['misc'],
        summary: 'Ping',
    },
        handler: async (request, reply) => {
        reply.send({ping:"pong"})
    }
})

routes.forEach((route) => {
    fastify.route(route);
});


const start = async () => {
    try {
        await fastify.listen({port: 3001, host:'0.0.0.0'});
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()
