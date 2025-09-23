import {createDiv,createForm,createInp,createLab,createSpan,createListItem,createUl, createBut, createMain} from "./cssTools";

export function createAddFriends(name:string)
{
	const body = document.getElementById(name);
	if (!body) return;

	body.innerHTML = ``;

	const main = createDiv("flex flex-grow items-center max-w-3xl justify-center");
	const main_div = createDiv("bg-gradient-border w-full min-w-64 mx-auto rounded-lg text-white shadow-lg");
	const form = createForm("addFriendForm", "px-8  mb-4");
	
	//
	const user_div = createDiv("mt-2");
	const user_label = createLab("Add Friend", "friend-name", "block text-neonBlue font-bold mb-2");
	const user_input = createInp("Username", "text", "friend-name", "friend-name", "neon-box-blue text-white border rounded w-full py-2 px-3 leading-tight focus:outline-none");
	user_input.setAttribute("required", "");
	

	//
	const div_err =createDiv("h-6");

	const userok_div = createDiv("text-green-400 text-sm font-medium hidden animate-fade-in");
	userok_div.setAttribute("id", "userok");
	userok_div.textContent = "Friend request sent!";
	
	const userfail_div = createDiv("text-red-500 text-sm font-medium hidden animate-fade-in");
	userfail_div.setAttribute("id", "userfail");
	
	//
	const button_div = createDiv("flex items-center justify-between");
	const button_add = createBut("Send Request", "addFriendBtn", "btn-neon-pink2 hover-underline-animation border-t-2 border-l-2 border-r-2 py-0 px-0");
	button_add.setAttribute("type", "submit");


	const buttonsContainer = createDiv("flex flex-col items-center justify-center space-y-4 mt-8");

	const playBt = createBut("Create Match", "match-settings", "p-1 btn-neon-blue3 hover-underline-animation w-3xs");
	const trnmt = createBut("Create Tournament", "tournament-settings", "p-1 btn-neon-blue3 hover-underline-animation w-3xs");
	const matchHist = createBut("Match History", "match-history", "p-1 btn-neon-blue3 hover-underline-animation w-3xs");
	
	//
	body.appendChild(main);
	body.appendChild(buttonsContainer);
	main.appendChild(main_div);
	main_div.appendChild(form);
	

	buttonsContainer.appendChild(playBt);
	buttonsContainer.appendChild(trnmt);
	buttonsContainer.appendChild(matchHist);

	form.appendChild(user_div);
	user_div.appendChild(user_label);
	user_div.appendChild(user_input);
	

	form.appendChild(div_err);
	div_err.appendChild(userok_div);
	div_err.appendChild(userfail_div);
	
	form.appendChild(button_div);
	button_div.appendChild(button_add);
}

