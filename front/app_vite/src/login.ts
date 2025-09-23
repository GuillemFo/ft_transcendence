import { navTo } from "./navigation";
import { getAppElement } from "./dom";
import { eventListeners } from "./listeners";
import { createBut, createDiv, createForm, createInp, createLab, createMain, createSpan } from "./cssTools";
import { getUser } from "./apiCall";
import { initializeSocket, listenSocketMsg } from "./socketEvent";
import { renderGoogleAuth } from "./authGoogle";

export function renderLogin()
{
	const appElement = getAppElement();
	if (!appElement) return;
	appElement.innerHTML = `
	<div class="flex justify-end space-x-4 pb-4">
		<div>
			<button id="regBtn" class=" p-1 btn-neon-blue-clip hover-line-all text-center text-sm">Register</button>
			
		</div>
	</div>
	<div class="flex flex-col items-center justify-center">
		<div id="expandLogin"></div>
		<div id="expandAuth"></div>
	</div>
	`;
	createLogin("expandLogin");
	renderGoogleAuth("expandAuth");
	exportLoginFormData();
	eventListeners();
}

function exportLoginFormData()
{
	const loginForm = document.getElementById("loginForm") as HTMLFormElement | null; 
	const fail = document.getElementById("userfail");
	fail.classList.add("hidden");
	if (loginForm)
	{
		loginForm.addEventListener("submit", async e =>
		{
			e.preventDefault();
			try
			{
				fail.classList.add("hidden");
				const formData = new FormData(loginForm);
				const res = await fetch('/api/users/login',
				{
					method: 'POST',
					body: JSON.stringify(
					{
						username: (formData.get("user") as string | null)?.trim(),
						password: (formData.get("pass") as string | null) ?? "",
					}),
					headers:
					{
						"Content-Type": "application/json",
					},
					credentials: 'include'

				});
				
				if (!res.ok)
				{
					fail.classList.remove("hidden");
						throw new Error(`Login failed - status ${res.status}`);
				}

				const data = await res.json();
				//console.log("Success:", data);
				const user_info = await getUser(data.user.id);

				localStorage.setItem("user_id", user_info.id); 
				
				initializeSocket();
				navTo("profile", user_info.id);
			}
			catch (err)
			{
				console.error("Error during login:", err);
			}
		});
	}
}


export function createLogin(name:string)
{
	const body = document.getElementById(name);
	if (!body) return;

	body.innerHTML = ``;

	const main = createMain("flex flex-grow items-center justify-center p-2");
	const main_div = createDiv("w-full max-w-xs");
	const form = createForm("loginForm", "bg-gradient-border px-8 pt-6 pb-8 mb-4");
	
	///
	const user_div = createDiv("mb-4 mt-2");
	const user_label = createLab("Username", "user", "block text-neonBlue font-bold mb-2");
	const user_input = createInp("Username","text", "user", "user","neon-box-blue text-white  border rounded w-full py-2 px-3 leading-tight focus:outline-none");
	user_input.setAttribute("required", "");
	
	///
	const pass_div = createDiv("mb-1");
	const pass_label = createLab("Password", "pass", "block text-neonBlue font-bold mb-2");
	const pass_input = createInp("******************", "password", "pass", "pass", "neon-box-blue text-white shadow border rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none");
	pass_input.setAttribute("required", "");
	const pass_span = createSpan("Enter your password","span_pass","text-red-500 text-xs italic hidden");
	
	///
	const div_userfail_wrap = createDiv("mb-6 h-2 w-45 text-sm font-medium");
	const div_userfail = createDiv("text-red-500 text-sm hidden animate-fade-in");
	div_userfail.setAttribute("id", "userfail");
	div_userfail.textContent = "Username or password incorrect";
	
	///
	const butt_div = createDiv("flex items-center justify-between mt-6 mb-2");
	const login_button = createBut("Log in", "loginBtnConfirm", " btn-neon-pink2 hover-underline-animation border-t-2 border-l-2 border-r-2 py-0 px-0");
	login_button.setAttribute("type", "submit");
	
	///
	form.appendChild(user_div);
	user_div.appendChild(user_label);
	user_div.appendChild(user_input);
	
	///	
	form.appendChild(pass_div);
	pass_div.appendChild(pass_label);
	pass_div.appendChild(pass_input);
	pass_div.appendChild(pass_span);

	///
	form.appendChild(div_userfail_wrap);
	div_userfail_wrap.appendChild(div_userfail);
	
	form.appendChild(butt_div);
	butt_div.appendChild(login_button);


	main_div.appendChild(form);
	main.appendChild(main_div);
	body.appendChild(main);

}

