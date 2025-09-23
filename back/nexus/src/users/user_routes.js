'use strict';
import UsersController from './UsersController.js';

const tags = {
    users: "users",
    dev: "dev (this will be deleted)",
    misc: "misc"
}

const routes = [
	// {
	// 	method: "GET",
	// 	url: "/users",
	// 	handler: UsersController.get_all,
	// 	schema: {
	// 		description: 'Returns all users',
	// 		tags: [tags.dev, tags.users],
	// 		summary: 'Get all users - FOR TESTING ONLY',
	// 	}
	// },
	{
		method: "GET",
		url: "/users/:id",
		handler: UsersController.get_one,
		schema: {
			description: 'Returns specific user',
			tags: [tags.users],
			summary: 'Get one user',
			params: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						description: 'user id'
					}
				}
			}
		}
	},
	{
		method: "GET",
		url: "/users/get_by_username/:username",
		handler: UsersController.get_by_username,
		schema: {
			description: 'Returns specific user by their username',
			tags: [tags.users],
			summary: 'Get one user by username',
			params: {
				type: 'object',
				properties: {
					username: {
						type: 'string',
						description: 'username'
					}
				}
			}
		}
	},
	{
		method: "POST",
		url: "/users",
		handler: UsersController.create,
		schema: {
			description: 'Creates a new user',
			tags: [tags.users],
			summary: 'Create user',
			body: {
				type: 'object',
				properties: {
					username: { type: 'string' },
					password: {type: 'string'},
					email: {type: 'string'},
				}
			},
		}
	},
	// {
	// 	method: "PUT",
	// 	url: "/users/:id",
	// 	handler: UsersController.update,
	// 	schema: {
	// 		description: 'Updates the information of an existing user',
	// 		tags: [tags.dev, tags.users],
	// 		summary: 'Update user - FOR TESTING ONLY',
	// 		params: {
	// 			type: 'object',
	// 			properties: {
	// 				id: {
	// 					type: 'string',
	// 					description: 'user id'
	// 				}
	// 			}
	// 		},
	// 		body: {
	// 			type: 'object',
	// 			properties: {
	// 				username: { type: 'string' },
	// 				password: {type: 'string'},
	// 				email: {type: 'string'},
	// 				avatar: {type: 'string'},
	// 				wins: {type: 'string'},
	// 				losses: {type: 'string'},
	// 			}
	// 		},
	// 	}
	// },
	{
		method: "DELETE",
		url: "/users/:id",
		handler: UsersController.delete,
		schema: {
			description: 'Deletes a user',
			tags: [tags.users],
			summary: 'Delete user',
			params: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						description: 'user id'
					}
				}
			}
		}
	},
	{
		method: "POST",
		url: "/users/login",
		handler: UsersController.login,
		schema: {
			description: 'Validate user/password',
			tags: [tags.users],
			summary: 'Validate user',
			body: {
				type: 'object',
				properties: {
					username: { type: 'string' },
					password: {type: 'string'},
				}
			},
        }
	},
	{
		method: "POST",
		url: "/users/google_login",
		handler: UsersController.google_login,
		schema: {
			description: 'Attempt to login with a google account',
			tags: [tags.users],
			summary: 'Login with google',
			body: {
				type: 'object',
				properties: {
					token: { type: 'string' },
				}
			},
        }
	},
	{
		method: "PUT",
		url: "/users/:id/username",
		handler: UsersController.update_username,
		schema: {
			description: 'Updates a user\'s username',
			tags: [tags.users],
			summary: 'Update username',
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
					username: { type: 'string' },
				}
			},
		}
	},
	{
		method: "PUT",
		url: "/users/:id/password",
		handler: UsersController.update_password,
		schema: {
			description: 'Updates a user\'s password',
			tags: [tags.users],
			summary: 'Update password',
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
					password: { type: 'string' },
				}
			},
		}
	},
	{
		method: "PUT",
		url: "/users/:id/email",
		handler: UsersController.update_email,
		schema: {
			description: 'Updates a user\'s email',
			tags: [tags.users],
			summary: 'Update email',
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
					email: { type: 'string' },
				}
			},
		}
	},
    // {
    //     method: "PUT",
    //     url: "/users/:id/avatar",
    //     handler: UsersController.update_avatar,
	// 	schema: {
	// 		description: 'Updates a user\'s avatar',
	// 		tags: [tags.dev, tags.users],
	// 		summary: 'INTERNAL USE ONLY - Update avatar',
	// 		params: {
	// 			type: 'object',
	// 			properties: {
	// 				id: {
	// 					type: 'string',
	// 					description: 'user id'
	// 				}
	// 			}
	// 		},
	// 		body: {
	// 			type: 'object',
	// 			properties: {
	// 				avatar: { type: 'string' },
	// 			}
	// 		},
	// 	}
    // },
	// {
	// 	method: "PUT",
	// 	url: "/users/:id/add_match_stats",
	// 	handler: UsersController.add_match_stats,
	// 	schema: {
	// 		description: 'Updates a user\'s stats. This will add the value of each field to the existing value stored in the DB. If a field is not present, nothing will be updated',
	// 		tags: [tags.dev, tags.users],
	// 		summary: 'INTERNAL USE ONLY - Update stats',
	// 		params: {
	// 			type: 'object',
	// 			properties: {
	// 				id: {
	// 					type: 'string',
	// 					description: 'user id'
	// 				}
	// 			}
	// 		},
	// 		body: {
	// 			type: 'object',
	// 			properties: {
	// 				wins: {type: 'string'},
	// 				losses: {type: 'string'},
	// 				parryAttempts: {type: 'string'},
	// 				parrysHit: {type: 'string'},
	// 				longestRally: {type: 'string'},
	// 				longestParryChain: {type: 'string'},
	// 				timesScoredAgainst: {type: 'string'},
	// 				timesScored: {type: 'string'}
	// 			}
	// 		},
	// 	}
	// },
	{
		method: "GET",
		url: "/users/:id/friendships",
		handler: UsersController.get_friends,
		schema: {
			description: 'Get a users friends',
			tags: [tags.users],
			summary: 'Get friends',
			params: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						description: 'user id'
					}
				}
			}
		}
	},
	{
		method: "POST",
		url: "/users/:id/friendship",
		handler: UsersController.add_friend,
		schema: {
			description: 'Create new friendship between two users',
			tags: [tags.users],
			summary: 'Add friend',
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
					friendId: { type: 'string' },
				}
			},
		}
	},
	{
		method: "DELETE",
		url: "/users/:id/friendship",
		handler: UsersController.delete_friendship,
		schema: {
			description: 'Breaks a beautiful bond between to users :(',
			tags: [tags.users],
			summary: 'Remove friendship',
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
					friendId: {
						type: 'string',
						description: 'friend id'
					}
				}
			}
		}
	},
	// {
	// 	method: "GET",
	// 	url: "/users/friendships",
	// 	handler: UsersController.get_all_friendships,
	// 	schema: {
	// 		description: 'Returns all friendships',
	// 		tags: [tags.dev, tags.users],
	// 		summary: 'Get all friendships - FOR TESTING ONLY',
	// 	}
	// },
	{
		method: "GET",
		url: "/users/:id/friend_requests",
		handler: UsersController.get_friend_requests,
		schema: {
			description: 'Returns friend requests of a user, needs query side?=sent/received',
			tags: [tags.users],
			summary: 'Get friend requests related to user',
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
					side: {
						type: 'string',
						description: "either 'sent' or 'received'"
					},
				}
			}
		}
	},
	{
		method: "POST",
		url: "/users/:id/friend_request",
		handler: UsersController.add_friend_request,
		schema: {
			description: 'Create new request',
			tags: [tags.users],
			summary: 'Add friend request',
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
					receiver: {
						type: 'string',
					},
				}
			},
		}
	},
	{
		method: "DELETE",
		url: "/users/:id/friend_request",
		handler: UsersController.delete_friend_request,
		schema: {
			description: 'Removes a friend request',
			tags: [tags.users],
			summary: 'Remove friend request',
			params: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						description: 'The sender id'
					}
				}
			},
			querystring: {
				type: 'object',
				properties: {
					receiverId: {
						type: 'string',
						description: 'The receiver id'
					}
				}
			}
		}
	},
	// {
	// 	method: "GET",
	// 	url: "/users/friend_requests",
	// 	handler: UsersController.get_all_friend_requests,
	// 	schema: {
	// 		description: 'Returns all friend_requests',
	// 		tags: [tags.dev, tags.users],
	// 		summary: 'Get all friend requests - FOR TESTING ONLY',
	// 	}
	// },
	{
		method: "GET",
		url: "/coffee",
		handler: async (req, res) => {
            res.status(418).send({status: "I'm a teapot"});
        },
		schema: {
			description: 'Request a coffee',
			tags: [tags.misc],
			summary: 'Get a coffee',
		}
	},
]

export default routes;