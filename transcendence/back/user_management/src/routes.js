'use strict';
import UsersController from './controllers/UsersController.js';

const routes = [
	{
		method: "GET",
		url: "/users",
		handler: UsersController.get_all,
	},
	{
		method: "GET",
		url: "/users/:id",
		handler: UsersController.get_one,
	},
	{
		method: "GET",
		url: "/users/get_by_username/:username",
		handler: UsersController.get_by_username,
	},
	{
		method: "POST",
		url: "/users",
		handler: UsersController.create,
	},
	{
		method: "PUT",
		url: "/users/:id",
		handler: UsersController.update,
	},
	{
		method: "DELETE",
		url: "/users/:id",
		handler: UsersController.delete,
	},
	{
		method: "POST",
		url: "/users/login",
		handler: UsersController.login,
	},
	{
		method: "POST",
		url: "/users/google_login",
		handler: UsersController.google_login,
	},
	{
		method: "PUT",
		url: "/users/:id/username",
		handler: UsersController.update_username,
	},
	{
		method: "PUT",
		url: "/users/:id/password",
		handler: UsersController.update_password,
	},
	{
		method: "PUT",
		url: "/users/:id/email",
		handler: UsersController.update_email,
	},
	{
		method: "PUT",
		url: "/users/:id/avatar",
		handler: UsersController.update_avatar,
	},
	{
		method: "PUT",
		url: "/users/:id/add_match_stats",
		handler: UsersController.add_match_stats,
	},
	{
		method: "POST",
		url: "/users/:id/friendship",
		handler: UsersController.add_friend,
	},
	{
		method: "GET",
		url: "/users/:id/friendships",
		handler: UsersController.get_friends,
	},
	{
		method: "GET",
		url: "/users/friendships",
		handler: UsersController.get_all_friendships,
	},
	{
		method: "DELETE",
		url: "/users/:id/friendship",
		handler: UsersController.delete_friendship,
	},
	{
		method: "GET",
		url: "/users/:id/friend_requests",
		handler: UsersController.get_friend_requests,
	},
	{
		method: "POST",
		url: "/users/:id/friend_request",
		handler: UsersController.add_friend_request,
	},
	{
		method: "DELETE",
		url: "/users/:id/friend_request",
		handler: UsersController.delete_friend_request,
	},
	{
		method: "GET",
		url: "/users/friend_requests",
		handler: UsersController.get_all_friend_requests,
	},
]

export default routes;