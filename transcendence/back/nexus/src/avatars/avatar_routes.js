'use strict';
import AvatarsController from './AvatarsController.js';

const routes = [
	{
		method: "POST",
		url: "/avatars/generate",
		handler: AvatarsController.generate_avatar,
		schema: {
			description: 'Generates a new avatar with the provided id - INTENDED FOR INTERNAL USE ONLY, THIS WILL NOT BE AVILABLE ON THE FINAL API',
			tags: ['avatars - USE localhost:3002 FOR THIS', 'dev (this will be deleted)'],
			summary: 'Generate avatar - FOR TESTING ONLY',
			body: {
				type: 'object',
				properties: {
					id: { type: 'string' }
				},
			},
		}
	},
	{ //Endpoint for documentation to get around Swagger UI limitations
		method: "PUT",
		url: "/avatars/:id/update",
		handler: (req, res) => {
            res.status(501).send({ error: 'This endpoint is for documentation purposes only.' });
		},
		schema: {
			tags: ['avatars - USE localhost:3002 FOR THIS'],
			summary: 'Update existing avatar',
			description: 'This endpoint only works in localhost:3002. Please use that instead.',
			consumes: ['multipart/form-data'],
			params: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						description: 'user id'
					}
				}
			},
			body: {
				type: 'object',
				properties: {
					image: {
						type: 'string',
						format: 'binary',
						description: 'Avatar image file'
					}
				},
				required: ['image']
			}
		}
	},
	{
		method: "DELETE",
		url: "/avatars/delete/:id",
		handler: AvatarsController.delete_avatar,
		schema: {
			description: 'Deletes an avatar - FOR TESTING ONLY',
			tags: ['avatars - USE localhost:3002 FOR THIS', 'dev (this will be deleted)'],
			summary: 'Delete avatar - - INTENDED FOR INTERNAL USE ONLY, THIS WILL NOT BE AVILABLE ON THE FINAL API',
			params: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						description: 'user id'
					}
				}
			},
			querystring: {
				type: 'object',
				properties: {
					filetype: {
						type: 'string',
						description: 'The image filetype'
					}
				}
			}
		}
	}
]

export default routes;