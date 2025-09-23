import { navTo } from "./navigation";

export function eventListeners(id?:string)
{

	const loginBtn = document.getElementById("loginBtn");
	loginBtn?.addEventListener("click", () => {
		navTo("login", id);
	});

	const homeBtn = document.getElementById("homeBtn");
	homeBtn?.addEventListener("click", () => {
		navTo("home", id);
	});

	const regBtn = document.getElementById("regBtn");
	regBtn?.addEventListener("click", () => {
		navTo("reg", id);
	});
	
	const playbtn = document.getElementById("playBtn");
	playbtn?.addEventListener("click", () => {
		navTo("game", id);
	});

	const editBtn = document.getElementById("editBtn");
	editBtn?.addEventListener("click", () => {
		navTo("edit", id);
	});

	const profileBtn = document.getElementById("profileBtn");
	profileBtn?.addEventListener("click", () => {
		navTo("profile", id);
	});
	
	const tournament = document.getElementById("tournament-settings");
	tournament?.addEventListener("click", () => {
		navTo("tournament-settings", id);
	});
	
	const matchSettings = document.getElementById("match-settings");
	matchSettings?.addEventListener("click", () => {
		navTo("match-settings", id);
	});

	const matchHistory = document.getElementById("match-history");
	matchHistory?.addEventListener("click", () => {
		navTo("match-history", id);
	});

	const logOut = document.getElementById("logOutBtn");
	logOut?.addEventListener("click", () => {
		globalThis.online_status.close();
		delete(globalThis.online_status);
		delete(globalThis.oStatus_list);
		localStorage.removeItem("user_id");
		localStorage.clear();
		navTo("home");
	});

	
}