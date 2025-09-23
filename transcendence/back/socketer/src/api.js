'use strict';
import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import jwt from 'jsonwebtoken'
import websocket from '@fastify/websocket'
import StatusController from './onlinestatus/StatusController.js'
import fs from 'fs'

const fastify = Fastify({
    logger: false,
	https: {
		cert: fs.readFileSync("/run/secrets/server-certificate.pem"),
		key: fs.readFileSync( "/run/secrets/server-key.pem"),
	}
})

await fastify.register(cors, {
	origin: "http://localhost:3000",
    methods: ['POST', 'PUT', 'GET', 'DELETE'],
	allowedHeaders: 'Content-Type,Authorization',
	exposedHeaders: 'Content-Type,Authorization',
	credentials:true,
})

await fastify.register(cookie, {
})

await fastify.register(websocket, {server: fastify.server})

fastify.register(async function (fastify) {
  fastify.get('/', { websocket: true }, StatusController.get_all)
});

export function isAllowed(req, res) {
	try {
		// console.log("check: ", jwt.verify(req.cookies.Authorization, fs.readFileSync("/run/secrets/password-jwt")).id , " =? ", req.params.id);//debug
		if ((jwt.verify(req.cookies.Authorization, fs.readFileSync("/run/secrets/password-jwt")).id == req.params.id)) {//!put actual password
			return (true);
		}
		else {
			// console.log("Debug: Wrong credential used");//dev
			return (false);
		}
	}
	catch (err) {
		// console.log("Debug: error catched in isAllowed() (api.js): ", err);
		return (false);
	}
}

const start = async () => {
  try {
    await fastify.listen({port: 3004, host:'0.0.0.0'});
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
