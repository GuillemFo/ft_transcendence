import jwt from 'jsonwebtoken'
import fs from 'fs'
const url = "http://back_match_history:3012"

class MatchHistoryController {
	constructor(){
	}

	static isAllowed(req, res) {
		try {
			// console.log("check: ", jwt.verify(req.cookies.Authorization, fs.readFileSync("/run/secrets/password-jwt")).id , " =? ", req.params.userId);//debug
			if ((jwt.verify(req.cookies.Authorization, fs.readFileSync("/run/secrets/password-jwt")).id == req.params.userId)) {
				return (true);
			}
			else {
				// console.log("Debug: Wrong credential used ", jwt.verify(req.cookies.Authorization, fs.readFileSync("/run/secrets/password-jwt")).id);//dev
				return (false);
			}
		}
		catch (err) {
			// console.log("Debug: error catched in isAllowed() (api.js): ", err);
			return (false);
		}
	}
	async get_all(req, res) {
		const response = await fetch(url + "/match_history", {
			method: "GET",
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async get_one(req, res) {
		const response = await fetch(url + "/match_history/" + req.params.id, {
			method: "GET",
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async get_matches_by_user(req, res) {
		if (!MatchHistoryController.isAllowed(req, res)) {
			res.status(401).send({message: "You lack proper credentials"});
			return;
		}
		const response = await fetch(url + "/match_history/get_by_userId/" + req.params.userId, {
			method: "GET",
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async create(req, res) {
		const response = await fetch(url + "/match_history", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(req.body)
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}
}

export default new MatchHistoryController();
