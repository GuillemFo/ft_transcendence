'use strict'
import FriendshipsModel from '../models/FriendshipsModel.js'
import FriendRequestsModel from '../models/FriendRequestsModel.js'
import UserModel from '../models/UserModel.js'

import {Op} from '@sequelize/core';
import bcrypt from 'bcrypt'
import { receiveMessageOnPort } from 'worker_threads';
import {OAuth2Client} from 'google-auth-library';

const OAuth_client = new OAuth2Client();

async function get_entry(where, include = null, model = UserModel)
{
	const Model = await model.findOne({
		where:
			where,
			attributes :  include || {
				exclude : ['password']
			}
		});
	return Model;
}
;
function is_google_account(id) {
	return id.length != 36;
}
// Between 2 and 16 chars alphanumeric
const user_regex = /^[0-9A-Za-z]{2,16}$/;
// something@something.something (only one @ allowed)
const email_regex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
// At least one character, one number and one special character, between 7 and 32 characters
const password_regex = /^(?=.*?[0-9])(?=.*?[a-zA-Z])(?=.*?[^0-9A-Za-z]).{7,32}$/;

class UsersController {
	constructor(){
	}

	async get_all(req, res) {
		try {
			const users = await UserModel.findAll({
				attributes : {
					exclude : ['password']
				}
			});
			res.status(200).send(users);
		} catch (err) {
			res.status(500).send(
				{message: err.message || 'Error at UserController.get_all'},
			);
		}
	}

	async get_one(req, res) {
		try {
			const userModel = await get_entry({id :req.params.id});
			if 	(userModel) {
				res.status(200).send(userModel);
			} else {
				res.status(404).send(
					{message: 'User not found'},
				);
			}
		} catch (err) {
			res.status(500).send(
				{message: err.message || 'Error at UsersController.get_one'},
			);
		}
	}

	async get_by_username(req, res) {
		try {
			const userModel = await get_entry({username :req.params.username});
			if 	(userModel) {
				res.status(200).send(userModel);
			} else {
				res.status(404).send(
					{message: 'User not found'},
				);
			}
		} catch (err) {
			res.status(500).send(
				{message: err.message || 'Error at UsersController.get_by_username'},
			);
		}
	}

	async create(req, res) {
		try {
			if (!req.body.username || !req.body.password || !req.body.email)
			{
				return res.status(400).send({message: "Body must contain username, password and email"});
			} else if (!user_regex.test(req.body.username))
			{
				return res.status(400).send({message: "Username must be between 2 and 16 alphanumeric characters"});
			} else if (!password_regex.test(req.body.password)) {
				return res.status(400).send({message: "Invalid password"})
			} else if (!email_regex.test(req.body.email))
			{
				return res.status(400).send({message: "Email format is invalid"});
			}

			const hashed_password = await bcrypt.hash(req.body.password, 10);
			const new_user = {id: crypto.randomUUID(), username: req.body.username, password: hashed_password, email: req.body.email}

            const response = await fetch("http://avatars:3002/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({"id": new_user.id})
            });
            const avatar_body = await response.json();
            new_user["avatar"] = avatar_body.url || null;

			const userModel = await UserModel.create(new_user);
			if (userModel) {
				res.status(201).send({status: true, id: userModel.id, username: userModel.username, avatar: userModel.avatar});
			}

		} catch (e) {
			const username = await get_entry({username: req.body.username});
			const email = await get_entry({email: req.body.email});
			let error409 = {error: "The following fields must be unique:", fields:[]};
			if (username)
				error409["fields"].push("username");
			if (email)
				error409["fields"].push("email");
			if (username || email) {
				res.status(409).send(error409);
			} else {
				res.status(500).send({error: e});
			}
		}
	}

	async update(req, res) {
		try {
			const id = req.params.id;

			const userModel = await UserModel.update(req.body,
				{where: {id}});

			if (typeof (userModel[0]) !== 'undefined' && userModel[0] === 1) {
				res.status(200).send({
				status: true,
				});
			} else {
				res.status(404).send(
					{message: 'User not found'},
				);
			}
			} catch (err) {
			res.status(500).send(
				{message: err.message || 'error at UsersController.update'},
			);
		}
  	}

	async delete(req, res) {
		try {
			const id = req.params.id;
			const userModel = await get_entry({id: req.params.id}, ['avatar']);

			if (userModel) {
				const filetype = userModel.avatar.split('.').pop();
				const filename = userModel.avatar.split('.')[0].split('/')[2];
				await fetch("http://avatars:3002/" + filename + "?filetype=" + filetype, {
					method: "DELETE",
				});
				await fetch("http://match_history:3012/match_history/forget_user/" + req.params.id , {
					method: "PUT",
				});
				res.status(200).send({status: true});
			} else {
				res.status(404).send(
					{message: 'User not found'},
				);
			}
			await UserModel.destroy({where: {id}});
			} catch (err) {
				res.status(500).send(
					{message: err.message || 'Error at UsersController.delete'},
				);
		}
	}

	async login(req, res) {
		try {
			const userModel = await get_entry({
					username: req.body.username
				},
				{exclude: []}
			)
			if 	(userModel) {
				const password_check = await bcrypt.compare(req.body.password, userModel.password)
				if (password_check)
				{
					userModel.password = ":)";
					return res.status(200).send({status: true, user: userModel});
				}
			}
			res.status(401).send({message: 'Invalid username or password'})
		} catch (err) {
			res.status(500).send(
				{message: err.message || 'Error at UsersController.login'},
			);
		}
	}

	async google_login(req, res) {
		try {
			const ticket = await OAuth_client.verifyIdToken({
				idToken: req.body.token,
				audience: "534580929645-65j5664mb7mo6926ndl3f63fhpiflog2.apps.googleusercontent.com",
			});
			const payload = ticket.getPayload();
			const userid = payload['sub'];
			const existing_user = await get_entry({email: payload.email});
			if (!existing_user) {
				//* Email is not on the database, proceed with user creation
				//* Return 201

				let name = payload.name;
				name = name.substring(0, 15);
				let i = 0;
				//* Try to generate unique username
				while (await get_entry({username:name}))
				{
					name += Math.floor(Math.random()*10);
						name = name.substring(name.length - 15);
					i++;
					if (i == 15) {
						return res.status(500).send({message:"failed to provide suitable username"});
					}
				}
				const response = await fetch("http://avatars:3002/generate", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({"id": userid})
				});
				const avatar_body = await response.json();

				const new_user = {
					id: userid.toString(),
					username: name,
					email: payload.email,
					password: ":)",
					avatar: avatar_body.url || null,
				}

				const userModel = await UserModel.create(new_user);

				return res.status(201).send({user: userModel});
			}
			else if (existing_user.id != userid)
				return res.status(400).send({message: "This email is associated with a non-google account"});
			res.status(200).send({user: existing_user});
		} catch (err) {
			if (err.message == "Wrong number of segments in token: string")
				return res.status(400).send({message: "Email verification failed"});
			res.status(500).send(
				{message: err.message || 'Error at UsersController.google_login'},
			);
		}
	}

	async update_username(req, res) {
		try {
			const id = req.params.id;

			if (!req.body.username)
			{
				return res.status(400).send({message: "Malformed request: username must be present in the body of the request"});
			} else if (!user_regex.test(req.body.username)) {
				return res.status(400).send({message: "Username must be between 2 and 16 alphanumeric characters"});
			}

			const userModel = await UserModel.update({username: req.body.username},
				{where: {id}});

			if (typeof (userModel[0]) !== 'undefined' && userModel[0] === 1) {
				res.status(200).send({
				status: true,
			});
			} else {
				res.status(404).send(
					{message: 'User not found'},
				);
			}
			} catch (err) {
			res.status(500).send(
				{message: err.message || 'error at UsersController.update_username'},
			);
		}
  	}

	async update_password(req, res) {
		try {
			const id = req.params.id;

			if (is_google_account(req.params.id)) {
				return res.status(400).send({message: "Can't set a password with a google user"})
			}

			if (!req.body.password)
			{
				return res.status(400).send({message: "Malformed request: password must be present in the body of the request"});
			} else if (!password_regex.test(req.body.password)) {
				return res.status(400).send({message: "Invalid password"});
			}

			const hashed_password = await bcrypt.hash(req.body.password, 10);
			const userModel = await UserModel.update({password: hashed_password},
				{where: {id}});

			if (typeof (userModel[0]) !== 'undefined' && userModel[0] === 1) {
				res.status(200).send({
				status: true,
			});
			} else {
				res.status(404).send(
					{message: 'User not found'},
				);
			}
			} catch (err) {
			res.status(500).send(
				{message: err.message || 'error at UsersController.update_username'},
			);
		}
  	}

	async update_email(req, res) {
		try {
			const id = req.params.id;

			if (is_google_account(req.params.id)) {
				return res.status(400).send({message: "Can't update email with a google user"})
			}

			if (!req.body.email)
			{
				return res.status(400).send({message: "Malformed request: email must be present in the body of the request"});
			} else if (!email_regex.test(req.body.email)) {
				return res.status(400).send({message: "Email format is invalid"});
			}

			const userModel = await UserModel.update({email: req.body.email},
				{where: {id}});

			if (typeof (userModel[0]) !== 'undefined' && userModel[0] === 1) {
				res.status(200).send({
				status: true,
				});
			} else {
				res.status(404).send(
					{message: 'User not found'},
				);
			}
			} catch (err) {
			if (err.message == "Validation error")
			{
				res.status(400).send({message: "email already in use"})
			}
			res.status(500).send(
				{message: err.message || 'error at UsersController.update_email'},
			);
		}
  	}

	async update_avatar(req, res) {
		try {
			const id = req.params.id;

			if (!req.body.avatar)
			{
				return res.status(400).send({message: "Malformed request: url must be present in the body of the request"});
			}

            const oldModel = await get_entry({id}, ["avatar"])
			const userModel = await UserModel.update({avatar: req.body.avatar},
				{where: {id}});

			if (typeof (userModel[0]) !== 'undefined' && userModel[0] === 1) {
				res.status(200).send({status: true,	old: oldModel.avatar});
			} else {
				res.status(404).send(
					{message: 'User not found'},
				);
			}
			} catch (err) {
				res.status(500).send(
				{message: err.message || 'error at UsersController.update_avatar'},
			);
		}
  	}

	async add_match_stats(req, res) {
		try {
			const id = req.params.id;

			const userModel = await get_entry({id: req.params.id});

			if (!userModel) {
				res.response(404).send({message: "User not found"})
			}

			const newModel = {
				"wins": +userModel.wins + (+req.body.wins || 0),
				"losses":  +userModel.losses + (+req.body.losses || 0),
				"parryAttempts":  +userModel.parryAttempts + (+req.body.parryAttempts || 0),
				"parryCount":  +userModel.parryCount + (+req.body.parryCount || 0),
				"parrysHit":  +userModel.parrysHit + (+req.body.parrysHit || 0),
				"longestRally":  +userModel.longestRally + (+req.body.longestRally || 0),
				"longestParryChain":  +userModel.longestParryChain + (+req.body.longestParryChain || 0),
				"timesScoredAgainst":  +userModel.timesScoredAgainst + (+req.body.timesScoredAgainst || 0),
				"timesScored":  +userModel.timesScored + (+req.body.timesScored || 0),
			}

			const updatedModel = await UserModel.update(newModel,
				{where: {id}});

			if (typeof (updatedModel[0]) !== 'undefined' && updatedModel[0] === 1) {
				res.status(200).send({
				status: true,
				});
			} else {
				res.status(404).send(
					{message: 'User not found'},
				);
			}
			} catch (err) {
			res.status(500).send(
				{message: err.message || 'error at UsersController.update'},
			);
		}
  	}


	async add_friend(req, res) {
		try {
			if (!req.body.friendId)
			{
				return res.status(400).send({message: "Body must contain friendId"})
			}
			if (req.params.id == req.body.friendId)
			{
				res.status(409).send({message: "Can't add yourself as a friend"});
				return;
			}
			const userModel = await get_entry({id: req.params.id}, ["id"]);
			if (!userModel) {
				res.status(404).send({message: 'User not found'});
			} else if (await get_entry({[Op.or]:[{userId: req.params.id, friendId: req.body.friendId}, {userId: req.body.friendId, friendId: req.params.id}]}, null, FriendshipsModel)) {
				res.status(409).send({message: "Friendship already exists"});
			} else if (!(await get_entry({userId: req.body.friendId, receiverId: req.params.id}, null, FriendRequestsModel))) {
				res.status(409).send({message: "Can't add friend without their friend request"})
			}
			else {
				const friendshipModel = await FriendshipsModel.create({
					userId: req.params.id,
					friendId: req.body.friendId
				});
				if (!friendshipModel)
					throw new Error("Error creating register");
				res.status(201).send({
					status: true,
				});
				await FriendRequestsModel.destroy({
					where: {
						userId: req.body.friendId,
						receiverId: req.params.id
					}
				});
			}
		} catch (err) {
			if (err.message == "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed")
			{
				res.status(404).send({message: "Friend id not found"});
			} else {
				res.status(500).send({message: err.message || 'error at UsersController.add_friend'});
			}
		}
	}

	async get_all_friendships(req, res) {
		try {
			const friendshipModel = await FriendshipsModel.findAll();
			res.status(200).send({friendships: friendshipModel});
		} catch (err) {
			res.status(500).send(
				{message: err.message || 'error at UsersController.add_win'}
			);
		}
	}

	async get_friends(req, res) {
		try {
			const userModel = await get_entry({id: req.params.id}, ["id"]);
			if (!userModel) {
				res.status(404).send({message: 'User not found'});
			} else {
				const friends = await FriendshipsModel.findAll({
					where: {
						[Op.or]:{userId: userModel.id, friendId: userModel.id}
					},
					attributes: {exclude: 'password'}
				});
				const friend_list = []
				for (let i in friends)
				{
					let id = friends[i].userId;
					if (id == req.params.id)
						id = friends[i].friendId;
					const friendUserModel = await get_entry({id})
					friend_list.push(friendUserModel);
				}
				res.status(200).send({friend_list});
			}
		} catch (err) {
			res.status(500).send(
				{message: err.message || 'error at UsersController.add_win'}
			);
		}
	}

	async delete_friendship(req, res) {
		try {
			const friendshipModel = await FriendshipsModel.destroy({
				where: {
					[Op.or]:[{userId: req.params.id, friendId: req.query.friendId}, {userId: req.query.friendId, friendId: req.params.id}]
				}
			});

			if (friendshipModel) {
				res.status(200).send({
				status: true,
				});
			} else {
				res.status(404).send(
					{message: 'Friendship not found'},
				);
			}
			} catch (err) {
			res.status(500).send(
				{message: err.message || 'Error at UsersController.delete_friendship'},
			);
		}
  	}

	async get_friend_requests(req, res) {
		try {
			const userModel = await get_entry({id: req.params.id}, ["id"]);
			if (!userModel) {
				res.status(404).send({message: 'User not found'});
			} else {
				let friendRequests;
				if (req.query.side == 'sent') {
					friendRequests = await FriendRequestsModel.findAll({
						where: {
							userId: req.params.id
						},
						attributes: ["receiverId"]
					});
				}
				else if (req.query.side == 'received')
				{
					friendRequests = await FriendRequestsModel.findAll({
						where: {
							receiverId: req.params.id
						},
						attributes: ["userId"]
					});
				}
				else {
					res.status(400).send({message: "Request must be sent with a 'side' query. It can be 'sent' or 'received'"});
					return;
				}
				const requests = [];
				for (let i in friendRequests)
				{
					const friendUserModel = await get_entry({id: friendRequests[i].receiverId || friendRequests[i].userId})
					requests.push(friendUserModel);
				}
				res.status(200).send({requests});
			}
		} catch (err) {
			res.status(500).send(
				{message: err.message || 'error at UsersController.get_friend_request'}
			)
		}
	}

	async add_friend_request(req, res) {

		try {
			if (!req.body.receiver) {
				return res.status(400).send({message: "Body must contain receiver"});
			}
			if (req.body.receiver == "amaia") {
				const friendshipModel = await FriendshipsModel.create({
					userId: req.params.id,
					friendId: "amaia"
				});
				if (!friendshipModel)
					throw new Error("Error creating register");
				res.status(201).send({
					status: true,
				});

			}

			const receiverModel = await get_entry({username: req.body.receiver}, ["id"])
			if (!receiverModel) {
				res.status(404).send({message: "User not found"});
			}
			const receiverId = receiverModel.id;
			if (req.params.id == receiverId)
			{
				res.status(409).send({message: "Can't send yourslef a friend request"});
				return;
			}
			const userModel = await get_entry({id: req.params.id}, ["id"]);
			if (!userModel) {
				res.status(404).send({message: 'Not logged'});
			}
			else if (await get_entry({userId: receiverId, receiverId: req.params.id}, null, FriendRequestsModel))
			{
				res.status(409).send({message: "You are already awaiting a friend request from the specified user"});
			}
			else if (await get_entry({[Op.or]:[{userId: req.params.id, friendId: receiverId}, {userId: receiverId, friendId: req.params.id}]}, null, FriendshipsModel))
			{
				res.status(409).send({message: "You are already friends with this user"});
			}
			else {
				const friendRequestModel = await FriendRequestsModel.create({
					userId: req.params.id,
					receiverId: receiverId
				});
				if (!friendRequestModel)
				{
					throw new Error("Error creating register");
				}
				res.status(201).send({
					status: true,
				});
			}
		} catch (err) {
			if (err.message == "Validation error") {
				res.status(409).send({message: "Friend request already exists"});
			}
			else if (err.message.includes("SQLITE_CONSTRAINT: FOREIGN KEY")) {
				res.status(500).send({message: "not logged"})
			} else {
				res.status(500).send({message: err.message || 'error at UsersController.add_friend_request'});
			}
		}
	}

	async delete_friend_request(req, res) {
		try {
			const friendRequestModel = await FriendRequestsModel.destroy({
				where: {
					userId: req.params.id,
					receiverId: req.query.receiverId
				}
			});
			if (friendRequestModel) {
				res.status(200).send({
				status: true,
				});
			} else {
				res.status(404).send(
					{message: 'Friend request not found'},
				);
			}
			} catch (err) {
			res.status(500).send(
				{message: err.message || 'Error at UsersController.delete_friend_request'},
			);
		}
  	}

	async get_all_friend_requests(req, res) {
		try {
			const friendRequestsModel = await FriendRequestsModel.findAll();
			res.status(200).send({friend_requests: friendRequestsModel});
		} catch (err) {
			res.status(500).send(
				{message: err.message || 'error at UsersController.add_win'}
			);
		}
	}
}

export default new UsersController();
