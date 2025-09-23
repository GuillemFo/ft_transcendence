import { createMain, createDiv, createSpan, createBut } from "./cssTools";
import { getAppElement } from "./dom";
import { navTo } from "./navigation";

export function renderSignOut()
{
	const appElement = getAppElement();
	if (!appElement) return;
	appElement.innerHTML = '';
	appElement.innerHTML = `
		<div class="flex justify-end space-x-4 pb-4">
			<div>
			</div>
		</div>
			<div id="expandSignOut"></div>
		</div>
	</div>
	`;
	

	logout();
	createSignedOutPage("expandSignOut");
	const loginBtn = document.getElementById("loginBtn");
		loginBtn?.addEventListener("click", () => {
			navTo("login");
		});
}

export function createSignedOutPage(name: string)
{
	const body = document.getElementById(name);
	if (!body) return;
	body.innerHTML = ``;

	///
	const main = createMain("flex flex-grow items-center justify-center min-h-screen");
	const card = createDiv("bg-gradient-border max-w-md mx-auto p-8 rounded-lg text-white shadow-lg text-center");

	///
	const titleWrap = createDiv("mt-4");
	const title = createSpan("You’ve been signed out", "", "text-neonBlue text-3xl font-bold block");
	titleWrap.appendChild(title);

	///
	const messageWrap = createDiv("mb-6");
	const message1 = createSpan(
		"It seems you’ve logged out or signed in with a different account in another window",
		"",
		"text-white block mb-4"
	);
	const message2 = createSpan(
		"Please log in again to continue.",
		"",
		"text-white"
	);
	messageWrap.appendChild(message1);
	messageWrap.appendChild(message2);

	///
	const buttonWrap = createDiv("pt-4");
	const loginButton = createBut(
		"Log In Again",
		"loginBtn",
		"btn-neon-pink2 w-full hover-underline-animation mb-4"
	);
	buttonWrap.appendChild(loginButton);

	///
	card.appendChild(titleWrap);
	card.appendChild(messageWrap);
	card.appendChild(buttonWrap);

	///
	main.appendChild(card);
	body.appendChild(main);
}

function logout()
{
	globalThis.online_status?.close();
	delete globalThis.online_status;
	delete globalThis.oStatus_list;

	localStorage.clear();

	history.replaceState({ page: 'signed-out' }, '', '/signed-out');
}
