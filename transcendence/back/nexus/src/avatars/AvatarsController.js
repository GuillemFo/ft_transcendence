const url = "http://avatars:3002"

class AvatarsController {
	async generate_avatar(req, res) {
		const response = await fetch(url + "/avatars/generate", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(req.body)
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}

	async delete_avatar(req, res) {
		const response = await fetch(url + "/avatars/delete/" + req.params.id + "?filetype=" + req.query.filetype, {
			method: "DELETE",
		});
		const body = await response.json();
		res.status(response.status).send(body);
	}
}

export default new AvatarsController();
