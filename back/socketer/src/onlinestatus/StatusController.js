import jwt from 'jsonwebtoken'
import fs from 'fs'

const PING_TIME = 4000;
let count = 0;
const connectedUsers = {"amaia": {socket: null, ponged: 0}};
/*
	keyed with users' IDs
	value is an object,
		socket: (the object, plus a few things),
		ponged: (time of last pong)
*/

async function check_status(socket, momento_mori) {//my comedic genius knows no match
	if (!(socket && connectedUsers[socket.id]))
		return;
	// console.log("Checking", connectedUsers[socket.id].ponged);
	if (momento_mori - connectedUsers[socket.id].ponged > PING_TIME){
		// console.log("Timed out ", socket.id);
		socket.close();
	}
	else {
		socket.send('PING');
		socket.timeout = setTimeout(check_status, PING_TIME, socket, Date.now()+PING_TIME);
	}
}

class StatusController {
	constructor(){
	}
	nop(req, res) {
		res.send("You shouldn't be using this");
	}

	async get_all(socket, req) {//basically on_connect()
		let id;
		// console.log(req.cookies.Authorization);
		try {
			id = (jwt.verify(req.cookies.Authorization, fs.readFileSync('/run/secrets/password-jwt'))).id;
		}
		catch (err){
			// console.log(err);
			socket.send('No credential or invalid credential given');
			socket.close();
			return;
		}
		count++;
		if (id in connectedUsers){
			connectedUsers[id].socket.close();
		}

		connectedUsers[id] = {
			"socket": socket,
			"ponged": Date.now()
			};
		socket.id = id;
		socket.count = count;

		socket.on('close', happenstance => {//"event" is a keyword
			// console.log("DELETING", socket.count);
			clearTimeout(socket.timeout);
			if(connectedUsers[socket.id].socket.count === socket.count) {
			//if we are not in a reconnection
				delete(connectedUsers[socket.id]);
				const payload = JSON.stringify({
							type: "disconnected",
							who: id});
				for (let dude in connectedUsers) {
					if (dude == "amaia") continue;
					if (connectedUsers[dude].socket.id != id)
						connectedUsers[dude].socket.send(payload);
				}
			}
			// console.log("Closed ", socket.id);
		});

		socket.on('message', message => {//it seems like it is forced to be a lambda
			// console.log("Message received: ", message);
			if(message == 'PONG') {
				// console.log("Ponged by ", socket.id);
				connectedUsers[socket.id].ponged = Date.now();
			}
		});

		socket.send('PING');
		// console.log("Sending new the previous", Object.keys(connectedUsers));
		socket.send(JSON.stringify(Object.keys(connectedUsers)));
		// console.log("Sending new to the previous");
		const payload = JSON.stringify({
					type: "connected",
					who: id});
		for (let client in connectedUsers) {
			// console.log("Sending to ", client);
			if (client == "amaia") continue;
			if (connectedUsers[client].socket.id != id)
				connectedUsers[client].socket.send(payload);

		}

		socket.timeout = setTimeout(check_status, 6000, socket, Date.now()+PING_TIME);
		// console.log("Debug: finished on_connect", count);
	}
}

export default new StatusController();
