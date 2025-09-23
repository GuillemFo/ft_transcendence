import { createBut, createDiv, createImage, createListItem, createSpan, createUl } from "./cssTools";


export function createFriends(name:string)
{
	const body = document.getElementById(name);
	if (!body) return;

	body.innerHTML = ``;

	const main = createDiv("flex flex-grow items-center  max-w-3xl justify-center");
	const container = createDiv("bg-gradient-border w-full overflow-hidden");
	
	//
	const tabContainer = createDiv("flex justify-between sticky top-0 z-10 bg-opacity-90 px-4 pt-3 pb-2");
	const friendsTab = createBut("Friends", "friends", "btn-neon-pink2 flex-1 mx-1 hover-underline-animation");
	const invitesTab = createBut("Invites", "invites", "btn-neon-pink2 flex-1 mx-1 hover-underline-animation");
	
	//
	const friendsList = createUl("divide-y divide-neonPink min-h-25 divide-opacity-30 max-h-96 overflow-y-auto px-4");
	friendsList.setAttribute("id", "friend-list");

	//
	body.appendChild(main);
	main.appendChild(container);
	
	//
	container.appendChild(tabContainer);
	tabContainer.appendChild(friendsTab);
	tabContainer.appendChild(invitesTab);
	
	container.appendChild(friendsList);

	friendsTab.addEventListener("click", (e) => {
		e.preventDefault();
		friendsTab.classList.add("border-b-2", "border-neonBlue");
		invitesTab.classList.remove("border-b-2", "border-neonBlue");

	});

	invitesTab.addEventListener("click", (e) => {
		e.preventDefault();
		invitesTab.classList.add("border-b-2", "border-neonBlue");
		friendsTab.classList.remove("border-b-2", "border-neonBlue");

	});

	friendsTab.classList.add("border-b-2", "border-neonBlue");
}
