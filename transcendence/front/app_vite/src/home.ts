import { getAppElement } from './dom';
import { eventListeners } from './listeners';
import { createDiv, createImage, createMain } from './cssTools';
import { navTo } from './navigation';
import { User } from './userInterface';

export function renderHome(user_info?:User)
{
	const appElement = getAppElement();
	if (!appElement) return;

	appElement.innerHTML = `
		<div class="flex justify-end space-x-4 pb-4">
			<button id="profileBtn2" class="p-1 btn-neon-blue-clip hover-line-all text-sm">Profile</button>
			<button id="loginBtn" class="p-1 btn-neon-blue-clip hover-line-all  text-sm">Log In</button>
		</div>
		<div id="expandHome"></div>
	`;

	createHome("expandHome");
	eventListeners();
	const profileBtn2 = document.getElementById("profileBtn2");
	profileBtn2?.addEventListener("click", () => {
		if (user_info != null)
			navTo("profile", user_info.id);
		else
			navTo("login")
	});
}

export function createHome(name: string)
{
	const body = document.getElementById(name);
	if (!body) return;

	body.innerHTML = ``;

	////
	const main = createMain("relative flex flex-grow items-center justify-center pt-6 pb-20");

	////
	const div2 = createDiv(
		"relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl 2xl:max-w-4xl overflow-hidden clip-custom"
	);

	////
	const img = createImage("/Pong.png","Preview of Pong game","h-auto w-full object-cover aspect-video");

	const div1 = createDiv("absolute inset-0 flex items-center justify-center font-['Bitcount_Prop_Single'] text-neon text-white animate-slide-side will-change-transform" + " text-xs sm:text-sm md:text-lg lg:text-2xl xl:text-4xl 2xl:text-6xl");
	div1.textContent = "TRANSCENDENCE";

	////
	div2.appendChild(img);
	div2.appendChild(div1);
	main.appendChild(div2);
	body.appendChild(main);
}
