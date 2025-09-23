import db from '../db.js';

const Friendships = db.define("friendships", {

}, {
	timestamps: false,
})

export default Friendships;
