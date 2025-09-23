export function initializeSocket()
{
	if (globalThis.online_status) return;

    globalThis.online_status = new WebSocket(`/sockets/`);
	globalThis.oStatus_list = new Set();
	
	listenSocketMsg();
}

export function listenSocketMsg() {
	globalThis.online_status.addEventListener("message", (event) => {
		//console.log("received", event.data);
		
		if (event.data === 'PING') {
			globalThis.online_status.send('PONG');
			return;
		}

		try {
			const data = JSON.parse(event.data);
			
			if (Array.isArray(data)) {
				// Initial package - array of connected users
				//console.log("Initial connected users:", data);
				globalThis.oStatus_list = new Set(data);
				updateStatusDots();
				return;
			}

			// Handle individual status updates
			//console.log("Received task:", data);
			if (!data.type || !data.who) return;
			
			switch (data.type) {
				case "connected":
					//console.log("connected", data.who);
					globalThis.oStatus_list.add(data.who);
					updateStatusDots();
					break;
				case "disconnected":
					//console.log("disconnected", data.who);
					globalThis.oStatus_list.delete(data.who);
					updateStatusDots();
					break;
			}
		} catch (e) {
			console.error("Error parsing WebSocket message:", e);
		}
	});
}

export function updateStatusDots() {
	document.querySelectorAll('[data-user]').forEach(item => {
		const userId = item.getAttribute('data-user');
		if (!userId) return;
		
		const statusDot = item.querySelector('[data-status-indicator]');
		if (!statusDot) return;
		
		const isOnline = globalThis.oStatus_list?.has(userId);
		statusDot.className = `status-dot ml-7 -mt-2 w-2 h-2 absolute rounded-full ${
			isOnline ? 'bg-green-500' : 'bg-red-500'
		}`;
	});
}
