import db from './db.js';

const MatchHistoryModel = db.define("match_history", {
	id : {
		type: "TEXT",
		allowNull: false,
		primaryKey: true,
		unique: true
	},
	duration: {
		type: "TEXT",
		allowNull: true
	},
	parry_streak: {
		type: "TEXT",
		allowNull: true,
	},
	bounce_streak: {
		type: "TEXT",
		allowNull: true
	},
	player1: {
		type: "TEXT",
		allowNull: true,
	},
	player1_score: {
		type: "TEXT",
		allowNull: true,
	},
    player1_bounce_count: {
		type: "TEXT",
		allowNull: true
	},
	player1_parry_attempts: {
		type: "TEXT",
		allowNull: true
	},
	player1_parry_count: {
		type: "TEXT",
		allowNull: true
	},
	player2: {
		type: "TEXT",
		allowNull: true,
	},
	player2_score: {
		type: "TEXT",
		allowNull: true,
	},
    player2_bounce_count: {
		type: "TEXT",
		allowNull: true
	},
	player2_parry_attempts: {
		type: "TEXT",
		allowNull: true
	},
	player2_parry_count: {
		type: "TEXT",
		allowNull: true
	},
}, {
	timestamps: true,
})

export default MatchHistoryModel;
