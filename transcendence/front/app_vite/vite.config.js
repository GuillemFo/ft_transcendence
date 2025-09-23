import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'

export default defineConfig({
	server:{
		host: true,
		port: 3000,
		https: {
			cert: fs.readFileSync("/run/secrets/server-certificate.pem"),
			key: fs.readFileSync( "/run/secrets/server-key.pem"),
		},
		proxy: {
			'/api': {
				target: 'http://nexus:3001',
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path.replace(/^\/api/, ''),
      		},
			'/avatars': {
				target: 'http://avatars:3002',
				changeOrigin: true,
				secure: false,
				//rewrite: (path) => path.replace(/^\/images/, ''),
     		},
			'/sockets': {
				target: 'wss://socketer:3004',
				changeOrigin: true,
				ws: true,
				secure: false,
				rewrite: (path) => path.replace(/^\/sockets/, '/'),
      		}
		},
	  	cors: {
			"http://localhost/3001": true,
			"http://127.0.0.1/3001": true
		},
		// headers: {'Access-Control-Allow-Origin': '*',}, //dev only 
		logger: {level: 'debug'},
	},
	plugins: [    
		tailwindcss(),  
	],
})
