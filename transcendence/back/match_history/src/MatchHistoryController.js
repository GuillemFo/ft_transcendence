'use strict'
import MatchHistoryModel from './MatchHistoryModel.js'

import {Op} from '@sequelize/core';

async function get_entry(where, include = null, model = MatchHistoryModel)
{
	const Model = await model.findOne({
		where:
			where,
			attributes :  include || {
				exclude : []
			}
		});
	return Model;
}

async function get_username(id)
{
	const response = await fetch("http://back_user_management:3010/users/" + id, {
		method: "GET",
	});
	const body = await response.json();
	if (!response.ok || !body.username)
	{
		return "Deleted user"
	}
	return body.username
}

async function add_usernames(matches) {
	const username_buffer = {};
	const named_matches = [];

	for (let match of matches) {
		match = match.dataValues;
		const p1_id = match.player1;
		const p2_id = match.player2;
		if (username_buffer[p1_id]) {
			match["player1_username"] = username_buffer[p1_id];
		}
		else {
			const p1_username = await get_username(match.player1);
			username_buffer[p1_id] = p1_username;
			match["player1_username"] = p1_username;
		}
		if (username_buffer[p2_id]) {
			match["player2_username"] = username_buffer[p2_id];
		}
		else {
			const p2_username = await get_username(match.player2);
			username_buffer[p2_id] = p2_username;
			match["player2_username"] = p2_username;
		}
		named_matches.push(match);
	};
	return named_matches;
}

class MatchHistoryController {
	constructor(){
	}

	async get_all(req, res) {
		try {
			let matches = await MatchHistoryModel.findAll();
			matches = await add_usernames(matches);
			res.status(200).send(matches);
		} catch (err) {
			res.status(500).send(
				{message: err.message || 'Error at MatchHistoryController.get_all'},
			);
		}
	}

	async get_one(req, res) {
		try {
			let newMatchHistoryModel = await get_entry({id: req.params.id});
			if 	(newMatchHistoryModel) {
				newMatchHistoryModel = await add_usernames([newMatchHistoryModel])
				res.status(200).send(newMatchHistoryModel[[0]]);
			} else {
				res.status(404).send(
					{message: 'Match not found'},
				);
			}
		} catch (err) {
			res.status(500).send(
				{message: err.message || 'Error at MatchHistoryController.getOne'},
			);
		}
	}

	async create(req, res) {
		try {
			if (
				!req.body.duration ||
				!req.body.parry_streak ||
				!req.body.bounce_streak ||
				!req.body.player1 ||
				!req.body.player1_score ||
				!req.body.player1_bounce_count ||
				!req.body.player1_parry_attempts ||
				!req.body.player1_parry_count ||
				!req.body.player2 ||
				!req.body.player2_score ||
				!req.body.player2_bounce_count ||
				!req.body.player2_parry_attempts ||
				!req.body.player1_parry_count
			) {
				res.status(400).send({message: "missing attributes"})
			}
			const new_match = {
				duration: req.body.duration,
				parry_streak: req.body.parry_streak,
				bounce_streak: req.body.bounce_streak,
				player1: req.body.player1,
				player1_score: req.body.player1_score,
				player1_bounce_count: req.body.player1_bounce_count,
				player1_parry_attempts: req.body.player1_parry_attempts,
				player1_parry_count: req.body.player1_parry_count,
				player2: req.body.player2,
				player2_score: req.body.player2_score,
				player2_bounce_count: req.body.player2_bounce_count,
				player2_parry_attempts: req.body.player2_parry_attempts,
				player2_parry_count: req.body.player2_parry_count,
			}

			let winner = null;
			if (new_match.player1_score > new_match.player2_score)
				winner = 'p1';
			else if (new_match.player2_score > new_match.player1_score)
				winner = 'p2';

			const p1_data = {
				wins: winner == 'p1' && 1 || 0,
				losses: winner == 'p2' && 1 || 0,
				parryAttempts: new_match.player1_parry_attempts,
				parryCount: new_match.player1_parry_count,
				longestRally: new_match.bounce_streak,
				longestParryChain: new_match.parry_streak,
				timesScoredAgainst: new_match.player2_score,
				timesScored: new_match.player1_score,
			};

			const p2_data = {
				wins: winner == 'p2' && 1 || 0,
				losses: winner == 'p1' && 1 || 0,
				parryAttempts: new_match.player2_parry_attempts,
				parryCount: new_match.player2_parry_count,
				longestRally: new_match.bounce_streak,
				longestParryChain: new_match.parry_streak,
				timesScoredAgainst: new_match.player1_score,
				timesScored: new_match.player2_score,
			};
			const p1_response = await fetch("http://back_user_management:3010/users/" + new_match.player1 + "/add_match_stats", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(p1_data)
			});

			const p2_response = await fetch("http://back_user_management:3010/users/" + new_match.player2 + "/add_match_stats", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(p2_data)
			});

			new_match['id'] = crypto.randomUUID();
			const match = await MatchHistoryModel.create(new_match);
			if (match) {
				res.status(201).send({status: true, match, player1_updated: p1_response.status.ok, player2_updated: p2_response.status.ok});
			}
		} catch (e) {
            res.status(500).send( e || {error: "unknown error at MatchHistoryController.create"});
		}
	}

    async get_matches_by_user(req, res) {
        try {
            let matches = await MatchHistoryModel.findAll({
                where: {
                    [Op.or]:{player1: req.params.userId, player2: req.params.userId}
                },
            });

            if (!matches)
				return res.status(404).send({message: "This user has no registered matches"});
			matches = await add_usernames(matches);

            res.status(200).send({matches});
        } catch (err) {
            res.status(500).send(err || {message: "Error at MatchHistoryController.get_matches_by_user"})
        }
    }

	async forget_user(req, res) {
		try {
            let matches = await MatchHistoryModel.findAll({
                where: {
                    [Op.or]:{player1: req.params.userId, player2: req.params.userId}
                },
            });

			for (let match of matches) {
				if (match.player1 == req.params.userId){
					await match.update({player1: '0'});
				}
				if (match.player2 == req.params.userId) {
					await match.update({player2: '0'});
				}
			}
			return res.status(200).send({status: true});
		} catch (e) {
			res.status(500).send({error: e || "Error in match_history.forget_user"});
		}
	}
}

export default new MatchHistoryController();
