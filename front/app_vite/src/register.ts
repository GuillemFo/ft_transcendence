import { navTo } from "./navigation";
import { getAppElement } from "./dom";
import { eventListeners } from "./listeners";
import {createDiv,createForm,createInp,createLab,createSpan,createListItem,createUl, createBut, createMain, showError} from "./cssTools";
import { getUser } from "./apiCall";
import { checkValidEmail, checkValidPass, checkValidUser } from "./protectionsForms";
import { renderGoogleAuth } from "./authGoogle";

export function renderRegister() {
	const appElement = getAppElement();
	if (!appElement) return;

	appElement.innerHTML = `
	<div class="flex justify-end space-x-4 pb-4">
		<div>
			<button id="loginBtn" class=" p-1 btn-neon-blue-clip hover-line-all text-center text-sm">Log In</button>
		</div>
	</div>
	<div class="flex flex-col items-center justify-center">
		<div id="regExpand"></div>
		<div id="expandAuth"></div>
	</div>
	`;

	createRegister("regExpand");
	renderGoogleAuth("expandAuth");
	setupRegisterForm();
	eventListeners();
}

export function setupRegisterForm() {
	const regForm = document.getElementById("regForm") as HTMLFormElement | null;
	if (!regForm) return;

   

	regForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		
		const formData = new FormData(regForm);
		const username = (formData.get("user") as string)?.trim();
		const password = (formData.get("pass") as string) ?? "";
		const email = (formData.get("email") as string)?.trim();
		
		//
		document.getElementById("userfail")?.classList.add("hidden");
		document.getElementById("email-error-check")?.classList.add("hidden");
		document.getElementById("pass-error-check")?.classList.add("hidden");
		document.getElementById("user-error-check")?.classList.add("hidden");
		
		let hasError = false;
		
		//
		if (!email) {
			showError("email-error-check", "Email is required");
			hasError = true;
		} else if (!checkValidEmail(email)) {
			showError("email-error-check", "Please enter a valid email address");
			hasError = true;
		}
		
		//
		if (!username) {
			showError("user-error-check", "Username is required");
			hasError = true;
		} else if (!checkValidUser(username)) {
			showError("user-error-check", "Username must be 2-16 characters long");
			hasError = true;
		}
		
		//
		if (!password) {
			showError("pass-error-check", "Password is required");
			hasError = true;
		} else if (!checkValidPass(password)) {
			showError("pass-error-check", "Password does not meet requirements");
			hasError = true;
		}
		
		if (hasError) return;
		
		try {
			const res = await fetch(`/api/users`, {
				method: "POST",
				body: JSON.stringify({
					username,
					password,
					email,
				}),
				headers: {
					"Content-Type": "application/json",
				},
				credentials: 'include',
			});
			
			if (!res.ok) {
				showError("userfail", "Email or Username already in use");
				throw new Error(`Request failed: ${res.status}`);
			}
			const data = await res.json();
			localStorage.setItem("user_id", data.id);
			//console.log("Success:", data);
			
			const user_info = await getUser(data.id);
			//console.log('Cookies:', document.cookie);  // print de cookies 
			navTo("profile", user_info.id);
		} catch (err) {
			console.error("Error during registration:", err);
			showError("userfail", "Username or email is already in use");
		}
	});
}

export function createRegister(name: string)
{
	const body = document.getElementById(name);
	if (!body) return;

	body.innerHTML = ``;

	const main = createMain("flex flex-grow items-center justify-center p-2");
	const main_div = createDiv("w-full max-w-xs");
	const form = createForm("regForm", "bg-gradient-border px-8 pt-6 pb-8 mb-4");
	form.setAttribute("novalidate", "");
	
	//
	const general_error = createDiv("text-red-500 text-xs italic animate-fade-in mb-2 hidden");
	general_error.setAttribute("id", "userfail");
	form.appendChild(general_error);
	
	//
	const email_div = createDiv("mb-4 mt-2");
	const email_label = createLab("Email", "email", "block text-neonBlue font-bold mb-2");
	const email_input = createInp("example@email.com", "text", "email", "email", "neon-box-blue text-white border rounded w-full py-2 px-3 leading-tight focus:outline-none");
	email_input.setAttribute("required", "");
	
	const email_error_wrapper = createDiv("mb-1 h-4");
	const email_error = createSpan("", "email-error-check", "text-red-500 animate-fade-in text-xs italic hidden");
	
	//
	const user_div = createDiv("mb-4");
	const user_label = createLab("Username", "username", "block text-neonBlue font-bold mb-2");
	const user_input = createInp("example name", "text", "user", "username", "neon-box-blue text-white border rounded w-full py-2 px-3 leading-tight focus:outline-none");
	user_input.setAttribute("required", "");
	
	const user_error_wrapper = createDiv("mb-1 h-4");
	const user_error = createSpan("", "user-error-check", "text-red-500 text-xs animate-fade-in italic hidden");
	
	//
	const pass_div = createDiv("");
	const pass_label = createLab("Password", "password", "block text-neonBlue font-bold");
	const pass_input = createInp("", "password", "pass", "password", "neon-box-blue text-white shadow border rounded w-full py-2 px-3 leading-tight focus:outline-none");
	pass_input.setAttribute("required", "");
	
	const pass_error_wrapper = createDiv("h-2");
	const pass_error = createSpan("", "pass-error-check", "text-red-500 animate-fade-in text-xs italic hidden");
	
	const pass_rules_div = createDiv("mt-4 text-sm font-medium text-neonBlue");
	pass_rules_div.textContent = "Password must contain:";
	const pass_ul = createUl("list-disc list-inside text-xs text-neonBlue");
	const pass_li1 = createListItem("At least 7 characters", "");
	const pass_li2 = createListItem("One letter", "");
	const pass_li3 = createListItem("One number", "");
	const pass_li4 = createListItem("One special character (!@#$%^&*)", "");
	
	//
	const butt_div = createDiv("flex items-center justify-between mt-6 mb-2");
	const register_button = createBut("Register", "regBtnConfirm", "btn-neon-pink2 hover-underline-animation border-t-2 border-l-2 border-r-2 py-0 px-0");
	register_button.setAttribute("type", "submit");
	
	//
	email_div.appendChild(email_label);
	email_div.appendChild(email_input);
	email_div.appendChild(email_error_wrapper);
	email_error_wrapper.appendChild(email_error);
	
	user_div.appendChild(user_label);
	user_div.appendChild(user_input);
	user_div.appendChild(user_error_wrapper);
	user_error_wrapper.appendChild(user_error);
	
	pass_div.appendChild(pass_label);
	pass_div.appendChild(pass_input);
	pass_div.appendChild(pass_error_wrapper);
	pass_error_wrapper.appendChild(pass_error);
	pass_div.appendChild(pass_rules_div);
	pass_rules_div.appendChild(pass_ul);
	pass_ul.appendChild(pass_li1);
	pass_ul.appendChild(pass_li2);
	pass_ul.appendChild(pass_li3);
	pass_ul.appendChild(pass_li4);
	
	butt_div.appendChild(register_button);
	
	form.appendChild(email_div);
	form.appendChild(user_div);
	form.appendChild(pass_div);
	form.appendChild(butt_div);
	
	main_div.appendChild(form);
	main.appendChild(main_div);
	body.appendChild(main);
}


