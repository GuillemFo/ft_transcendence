import { getUser } from "./apiCall";
import { createDiv, createMain, showError } from "./cssTools";
import { getAppElement } from "./dom";
import { eventListeners } from "./listeners";
import { navTo } from "./navigation";
import { initializeSocket } from "./socketEvent";

window.handleCredentialResponse = async (response: { credential: string }) => {
	//console.log("JWT token:", response.credential);

	const res = await fetch("/api/users/google_login",
	{
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({token: response.credential})
	});
	const data = await res.json();
	if (!res.ok)
	{
		if (res.status == 400 || res.status == 500)	// test
			showError("fallback", (await res.json()).message); // test
		else
			showError("fallback", "Google Sign in failed");
		return console.log(`Login failed - status ${res.status}`);
	}
	const user_info = await getUser(data.user.id);

	localStorage.setItem("user_id", user_info.id); 

	initializeSocket();
	navTo("profile", user_info.id);
};

export function renderGoogleAuth(containerId: string) {
	const container = document.getElementById(containerId);
	if (!container) return;

	///
	container.innerHTML = '';

	///
	const expandAuthDiv = createDiv("flex flex-grow items-center p-5");
	const main_div = createDiv("w-full max-w-xs bg-gradient-border");

	///
	const gOnloadDiv = createDiv('');
	gOnloadDiv.id = "g_id_onload";
	gOnloadDiv.setAttribute("data-client_id", "534580929645-65j5664mb7mo6926ndl3f63fhpiflog2.apps.googleusercontent.com");
	gOnloadDiv.setAttribute("data-callback", "handleCredentialResponse");

	///
	const gSigninDiv = createDiv("g_id_signin");
	gSigninDiv.setAttribute("data-type", "standard");

	const fallback = createDiv("text-red-500 text-sm text-center  mt-2 animate-fade-in")
	fallback.id = "fallback";

	///
	expandAuthDiv.appendChild(gOnloadDiv);
	expandAuthDiv.appendChild(gSigninDiv);

	///
	main_div.appendChild(expandAuthDiv);
	main_div.appendChild(fallback);
	container.appendChild(main_div);

	///
	const script = document.createElement("script");
	script.src = "https://accounts.google.com/gsi/client";
	script.async = true;
	script.defer = true;
	document.body.appendChild(script);
}
