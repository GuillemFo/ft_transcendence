// import sequelize from "sequelizer";
import db from '../db.js';

const UserModel = db.define("users", {
	id : {
		type: "TEXT",
		allowNull: false,
		primaryKey: true,
		unique: true
	},
	username : {
		type: "TEXT",
		allowNull: false,
		unique: true
	},
	password: {
		type: "TEXT",
		allowNull: false
	},
	email: {
		type: "TEXT",
		allowNull: false,
		unique: true
	},
	avatar: {
		type: "TEXT",
		allowNull: true
	},
	wins: {
		type: "TEXT",
		allowNull: false,
		defaultValue: '0',
	},
	losses: {
		type: "TEXT",
		allowNull: false,
		defaultValue: '0',
	},
	parryAttempts: {
		type: "TEXT",
		allowNull: false,
		defaultValue: '0'
	},
	parryCount: {
		type: "TEXT",
		allowNull: false,
		defaultValue: '0'
	},
	longestRally: {
		type: "TEXT",
		allowNull: false,
		defaultValue: '0'
	},
	longestParryChain: {
		type: "TEXT",
		allowNull: false,
		defaultValue: '0'
	},
	timesScoredAgainst: {
		type: "TEXT",
		allowNull: false,
		defaultValue: '0'
	},
	timesScored: {
		type: "TEXT",
		allowNull: false,
		defaultValue: '0'
	},
}, {
	timestamps: false,
})

UserModel.belongsToMany(UserModel,{as: "friends", through: 'friendships', timestamps: false});
UserModel.belongsToMany(UserModel,{as: "receiver", through: 'friendRequests', timestamps: false});

export default UserModel;
