import jwt from 'jsonwebtoken'
import fs from 'fs'
const url = "http://back_user_management:3010"

class UsersController {
	constructor(){
	}

	static isFrenReqDelAllowed(req, res) {
    	try {
			if ((jwt.verify(req.cookies.Authorization, fs.readFileSync('/run/secrets/password-jwt'), {maxAge: '16h'}).id == req.query.receiverId)) {
				return (true);
			}
			else {
			//	console.log("Debug: Wrong credential used ", jwt.verify(req.cookies.Authorization, fs.readFileSync('/run/secrets/password-jwt')).id);
				return (false);
			}
		}
		catch (err) {
			//console.log("Debug: error catched in isAllowed() (api.js): ", err)
			return (false);
		}
	}

	static isAllowed(req, res) {
    	try {
			if ((jwt.verify(req.cookies.Authorization, fs.readFileSync('/run/secrets/password-jwt'), {maxAge: '16h'}).id == req.params.id)) {
				return (true);
			}
			else {
			//	console.log("Debug: Wrong credential used ", jwt.verify(req.cookies.Authorization, fs.readFileSync('/run/secrets/password-jwt')).id);
				return (false);
			}
		}
		catch (err) {
			//console.log("Debug: error catched in isAllowed() (api.js): ", err)
			return (false);
		}
	}

	//dev
	async get_all(req, res) {
		const response = await fetch(url + "/users", {
			method: "GET",
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async get_one(req, res) {
		if (!UsersController.isAllowed(req, res)) {
			res.status(403).send({message: "You lack proper credentials"});
			return;
		}
		const response = await fetch(url + "/users/" + req.params.id, {
			method: "GET",
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async get_by_username(req, res) {
		const response = await fetch(url + "/users/get_by_username/" + req.params.username, {
			method: "GET",
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}


	async create(req, res) {
        try {
            const response = await fetch(url + "/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(req.body)
            });
            const body = await response.json();
			if (body && body.id) {
            	const cred = jwt.sign({id: body.id}, fs.readFileSync('/run/secrets/password-jwt'), {expiresIn: '16h'});
            	res.setCookie("Authorization", cred, {
            	    secure:  true,
            	    sameSite: 'none',
					path: "/"
            	});
			}
           	res.status(response.status).send(body);
        }
        catch (err) {
			// console.log(err);
            res.status(500).send({message: err.message} || "Error at nexus -> create user")
        }
	}
	//dev
	async update(req, res) {
		const response = await fetch(url + "/users/" + req.params.id, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(req.body)
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async delete(req, res) {
		if (!UsersController.isAllowed(req, res)) {
			res.status(403).send({message: "You lack proper credentials"});
			return;
		}
		const response = await fetch(url + "/users/" + req.params.id, {
			method: "DELETE",
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async login(req, res) {
		const response = await fetch(url + "/users/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: req.body.username,
				password: req.body.password
			})
		});
		const body = await response.json();
		if (response.status == 200 && body.user && body.user.id){
			const cred = jwt.sign({id: body.user.id}, fs.readFileSync('/run/secrets/password-jwt'), {expiresIn: '16h'});
			res.setCookie("Authorization", cred, {
				secure:  true,
				sameSite: 'none',
				path: "/"
			});
		}
		res.status(response.status).send(body);
	}

	async google_login(req, res) {
		const response = await fetch(url + "/users/google_login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(req.body)
		});
		const body = await response.json();
		if (response.ok) {
			const cred = jwt.sign({id: body.user.id},
				fs.readFileSync('/run/secrets/password-jwt'), {expiresIn: '16h'});
			res.setCookie("Authorization", cred, {
				secure:  true,
				sameSite: 'none',
				path: "/"
			});
		}
		res.status(response.status).send(body);
	}

	async update_username(req, res) {
		if (!UsersController.isAllowed(req, res)) {
			res.status(403).send({message: "You lack proper credentials"});
			return;
		}
		const response = await fetch(url + "/users/" + req.params.id + "/username", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(req.body)
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async update_password(req, res) {
		if (!UsersController.isAllowed(req, res)) {
			res.status(403).send({message: "You lack proper credentials"});
			return;
		}
		const response = await fetch(url + "/users/" + req.params.id + "/password", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(req.body)
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async update_email(req, res) {
		if (!UsersController.isAllowed(req, res)) {
			res.status(403).send({message: "You lack proper credentials"});
			return;
		}
		const response = await fetch(url + "/users/" + req.params.id + "/email", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(req.body)
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async update_avatar(req, res) {
		if (!UsersController.isAllowed(req, res)) {
			res.status(403).send({message: "You lack proper credentials"});
			return;
		}
		const response = await fetch(url + "/users/" + req.params.id + "/avatar", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(req.body)
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}


	async add_match_stats(req, res) {
		if (!UsersController.isAllowed(req, res)) {
			res.status(403).send({message: "You lack proper credentials"});
			return;
		}
		const response = await fetch(url + "/users/" + req.params.id + "/add_match_stats", {

			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(req.body)
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async get_friends(req, res) {
		if (!UsersController.isAllowed(req, res)) {
			res.status(403).send({message: "You lack proper credentials"});
			return;
		}
		const response = await fetch(url + "/users/" + req.params.id + "/friendships", {
			method: "GET",
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async add_friend(req, res) {
		if (!UsersController.isAllowed(req, res)) {
			res.status(403).send({message: "You lack proper credentials"});
			return;
		}
		const response = await fetch(url + "/users/" + req.params.id + "/friendship", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(req.body)
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async get_all_friendships(req, res) {
		const response = await fetch(url + "/users/friendships", {
			method: "GET",
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async delete_friendship(req, res) {
		if (!UsersController.isFrenReqDelAllowed(req, res)) {
			res.status(403).send({message: "You lack proper credentials"});
			return;
		}
		const response = await fetch(url + "/users/" + req.params.id + "/friendship?friendId=" + req.query.friendId, {
			method: "DELETE",
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async get_friend_requests(req, res) {
		if (!UsersController.isAllowed(req, res)) {
			res.status(403).send({message: "You lack proper credentials"});
			return;
		}
		const response = await fetch(url + "/users/" + req.params.id + "/friend_requests?side=" + req.query.side, {
			method: "GET",
		});
		const body = await response.json();
		res.
		status(response.status).send(body);
	}

	async add_friend_request(req, res) {
		if (!UsersController.isAllowed(req, res)) {
			res.status(401).send({message: "You lack proper credentials"});
			return;
		}
		const response = await fetch(url + "/users/" + req.params.id + "/friend_request", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(req.body)
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async delete_friend_request(req, res) {
		if (!UsersController.isFrenReqDelAllowed(req, res)) {
			res.status(403).send({message: "You lack proper credentials"});
			return;
		}
		const response = await fetch(url + "/users/" + req.params.id + "/friend_request?receiverId=" + req.query.receiverId, {
			method: "DELETE",
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async get_all_friend_requests(req, res) {
		if (!UsersController.isAllowed(req, res)) {
			res.status(403).send({message: "You lack proper credentials"});
			return;
		}
		const response = await fetch(url + "/users/friend_requests", {
			method: "GET",
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}
}

export default new UsersController();
