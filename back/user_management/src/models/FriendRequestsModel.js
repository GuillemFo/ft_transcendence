import db from '../db.js';

const FriendRequestsModel = db.define("friendRequests", {
}, {
	timestamps: false,
})

export default FriendRequestsModel;
