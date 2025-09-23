import { createBut, createDiv, createListItem, createMain, createSpan, createUl } from "./cssTools";
import { getAppElement } from "./dom";
import { eventListeners } from "./listeners";

export function render404(error?:string)
{
	const appElement = getAppElement();
	if (!appElement) return;
	appElement.innerHTML = '';
	appElement.innerHTML = `
		<div class="flex justify-end space-x-4 pb-4">
			<div>
				<button id="loginBtn" class=" p-1 btn-neon-blue-clip hover-line-all text-center text-sm ">Login</button>
			</div>
		</div>
			<div id="expandError"></div>
		</div>
	</div>
	`;

	void(error);
	create404Page("expandError", error);
	eventListeners();
}


export function create404Page(name: string, error?:string)
{
	const body = document.getElementById(name);
	if (!body) return;
	body.innerHTML = ``;

	////
	const main = createMain("flex flex-grow items-center justify-center min-h-screen");
	const card_div = createDiv("bg-gradient-border max-w-md mx-auto p-8 rounded-lg text-white shadow-lg text-center");

	////
	const error_div = createDiv("");
	const error_code = createSpan("404", "", "text-neonBlue text-9xl font-bold block");
	const error_message = createSpan("Page Not Found", "", "text-neonPink text-2xl font-bold");

	////
	const desc_div = createDiv("mb-8");
	const desc_text = createSpan(
		error ?? "Oops! The page you're looking for doesn't exist or has been moved.",
		"",
		"text-white"
	);

	////
	const stats = createUl("py-4 border-t border-b border-neonPink border-opacity-30 flex items-center justify-around mb-8");

	const suggestion_li = createListItem("", "flex flex-col items-center px-2");
	const suggestion_title = createSpan("Help?", "", "text-neonPink2 font-bold mb-1");
	const suggestion_val = createSpan("Going back home", "", "text-white");

	const help_li = createListItem("", "flex flex-col items-center px-2");
	const help_title = createSpan("Need", "", "text-neonPink2 font-bold mb-1");
	const help_val = createSpan("Try", "", "text-white");

	////
	const button_div = createDiv("pt-4");
	const home_button = createBut(
		"Return Home",
		"homeBtn",
		"btn-neon-pink2 w-full hover-underline-animation mb-4"
	);

	////
	error_div.appendChild(error_code);
	error_div.appendChild(error_message);

	desc_div.appendChild(desc_text);

	suggestion_li.appendChild(suggestion_title);
	suggestion_li.appendChild(suggestion_val);

	help_li.appendChild(help_title);
	help_li.appendChild(help_val);

	stats.appendChild(help_li);
	stats.appendChild(suggestion_li);

	button_div.appendChild(home_button);

	card_div.appendChild(error_div);
	card_div.appendChild(desc_div);
	card_div.appendChild(stats);
	card_div.appendChild(button_div);

	main.appendChild(card_div);
	body.appendChild(main);
}
