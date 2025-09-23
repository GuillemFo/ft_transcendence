import { navTo } from './navigation';
import { getAppElement } from './dom';
import { eventListeners } from './listeners';
import { createBut, createDiv, createForm, createImage, createInp, createLab, createListItem, createSpan, createUl, showError, truncateText } from './cssTools';
import { User } from './userInterface';
import { fetchAndDownload, fetchDelete, getUser } from './apiCall';
import { checkValidEmail, checkValidPass, checkValidUser } from './protectionsForms';
import { initializeSocket } from './socketEvent';

export function renderEditProfile(user_info:User)
{
	const appElement = getAppElement();
	if (!appElement) return;
	appElement.innerHTML = '';
	appElement.innerHTML = `
		<div class="flex justify-end space-x-4 pb-4">
			<div>
				<button id="profileBtn" class="p-1 btn-neon-blue-clip hover-line-all text-center text-sm">Profile</button>
			</div>
		</div>
		<div class="flex-1 grid place-items-center">
  			<div id="formEditExpand" class="w-full max-w-xs"></div>
		<div class="flex justify-end space-x-4 mt-4">
			<button id="download-btn" class="btn-neon-blue-clip hover-line-all text-white font-bold py-2 px-4  rounded">Request Data</button>
			<button id="delete-btn" class="btn-neon-blue-clip hover-line-all text-white font-bold py-2 px-4  rounded">Delete Account</button>
			</div>
			<div id="fallbackex" class="text-red-500 text-sm  mt-2 animate-fade-in"></div>
		</div>
		`;
		initializeSocket();
		loadFormEditProfile(user_info);
		setupEditUserForm(user_info);
		setupEditEmailForm(user_info);
		setupEditPassForm(user_info);
		eventListeners(user_info.id);
		const download = document.getElementById('download-btn');
		download?.addEventListener('click', () => {fetchAndDownload(user_info)});
		const del = document.getElementById('delete-btn');
		del?.addEventListener('click', () => {fetchDelete(user_info)});
	}

	
export function loadFormEditProfile(user:User)
{
	const body = document.getElementById("formEditExpand");
	if (!body) return;

	body.innerHTML = ``;

	const container = createDiv("bg-gradient-border max-w-xs mx-auto overflow-hidden");
	
	//
	const avatarDiv = createDiv("mx-auto w-32 h-32 relative border-4 border-neonBlue rounded-full overflow-hidden bg-bgDark mt-2");
	const avatarImg = createImage(user?.avatar || "/default.jpg", "profile picture", "object-cover w-full h-full");

	//
	const formsContainer = createDiv("px-6 py-4");

	//
	const imgForm = createForm("edit-img-form", "space-x-2");
	imgForm.enctype = "multipart/form-data";
	
	const fileInput = createInp("","file","image", "image-upload", "hidden");
	fileInput.type = "file";
	fileInput.accept = "image/*";

	const label = document.createElement("label");
	label.htmlFor = "image-upload";
	label.textContent = "Choose Image";
	label.className = "cursor-pointer btn-neon-pink2 hover-underline-animation px-4 py-2 inline-block";

	//
	const uploadError = createSpan("", "upload-error", "text-red-500 text-xs italic hidden mb-4 animate-fade-in");

	const uploadBtn = createBut("Upload", "upload-image", "btn-neon-blue2 hover-underline-animation px-4 py-2 mt-4");
	uploadBtn.setAttribute("type", "submit");

	//
	const userForm = createForm("edit-user-form", "mb-6 mt-4");
	userForm.setAttribute("novalidate", "");
	
	const userLabel = createLab(`Username: ${user.username}`, "new-user", "block text-neonBlue font-bold mb-2");
	const userInput = createInp("Enter new username", "text", "new-user", "username", "neon-box-blue text-white w-full py-2 px-3 mb-1 focus:outline-none");
	userInput.setAttribute("required", "");
	
	const userErrorDb = createSpan("", "userfail", "text-red-500 text-xs italic hidden mb-2 animate-fade-in");
	const userError = createSpan("", "user-error-check", "text-red-500 text-xs italic hidden mb-2 animate-fade-in");
	
	const saveUserBtn = createBut("Update Username", "save-username-btn", "hover-underline-animation btn-neon-blue2 mt-2 w-full");
	saveUserBtn.setAttribute("type", "submit");

	//
	const emailForm = createForm("edit-email-form", "mb-6");
	emailForm.setAttribute("novalidate", "");
	
	const tmp_email = truncateText(user?.email,13);
	const emailLabel = createLab(`Email: ${tmp_email}`, "new-email", "block text-neonBlue font-bold mb-2");
	emailLabel.title = user?.email;
	const emailInput = createInp("Enter new email", "email", "new-email", "email", "neon-box-blue text-white w-full py-2 px-3 mb-1 focus:outline-none");
	emailInput.setAttribute("required", "");
	
	const emailErrorDb = createSpan("", "emailfail", "text-red-500 text-xs italic hidden mb-2 animate-fade-in");
	const emailError = createSpan("", "email-error-check", "text-red-500 text-xs italic hidden mb-2 animate-fade-in");
	
	const saveEmailBtn = createBut("Update Email", "save-email-btn", "hover-underline-animation btn-neon-blue2 mt-2 w-full");
	saveEmailBtn.setAttribute("type", "submit");

	//
	const passForm = createForm("edit-pass-form", "mb-4");
	passForm.setAttribute("novalidate", "");
	
	const passLabel = createLab("New Password", "new-pass", "block text-neonBlue font-bold mb-2");
	const passInput = createInp("Enter new password", "password", "new-pass", "new-pass", "neon-box-blue text-white w-full py-2 px-3 mb-1 focus:outline-none");
	passInput.setAttribute("required", "");
	
	const passError = createSpan("", "pass-error-check", "text-red-500 text-xs italic hidden mb-2 animate-fade-in");
	
	const savePassBtn = createBut("Update Password", "save-pass-btn", "hover-underline-animation btn-neon-blue2 mt-2 w-full");
	savePassBtn.setAttribute("type", "submit");
	
	const passRulesDiv = createDiv("mt-3 text-sm text-neonBlue");
	passRulesDiv.textContent = "Password requirements:";
	
	const passRulesList = createUl("list-disc list-inside pl-5 mt-1 text-xs");
	const rule1 = createListItem("At least 7 characters", "");
	const rule2 = createListItem("One letter", "");
	const rule3 = createListItem("One number", "");
	const rule4 = createListItem("One special character (!@#$%^&*)", "");

	//
	body.appendChild(container);
	container.appendChild(avatarDiv);
	avatarDiv.appendChild(avatarImg);
	container.appendChild(formsContainer);
	
	//
	imgForm.appendChild(uploadError);
	formsContainer.appendChild(imgForm);
	imgForm.appendChild(fileInput);
	imgForm.appendChild(label);
	imgForm.appendChild(uploadBtn);
	
	//
	formsContainer.appendChild(userForm);
	userForm.appendChild(userLabel);
	userForm.appendChild(userInput);
	userForm.appendChild(userErrorDb);
	userForm.appendChild(userError);
	userForm.appendChild(saveUserBtn);
	
	//
	formsContainer.appendChild(emailForm);
	emailForm.appendChild(emailLabel);
	emailForm.appendChild(emailInput);
	emailForm.appendChild(emailErrorDb);
	emailForm.appendChild(emailError);
	emailForm.appendChild(saveEmailBtn);
	
	//
	formsContainer.appendChild(passForm);
	passForm.appendChild(passLabel);
	passForm.appendChild(passInput);
	passForm.appendChild(passError);
	passForm.appendChild(savePassBtn);
	passForm.appendChild(passRulesDiv);
	passRulesDiv.appendChild(passRulesList);
	passRulesList.appendChild(rule1);
	passRulesList.appendChild(rule2);
	passRulesList.appendChild(rule3);
	passRulesList.appendChild(rule4);

	imgForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		uploadError.classList.add("hidden");

		const file = fileInput.files?.[0];
		if (!file) {
			showError("upload-error", "Please choose a file first");
			return;
		}

		const formData = new FormData();
		formData.append("image", file);

		try {
			const res = await fetch("/avatars/" + user.id + "/update", {
				method: "PUT",
				headers: { "accept": "*/*.png *.jpg" },
				credentials: "include",
				body: formData
			});

			if (!res.ok) {
				showError("upload-error", "Upload failed: " + res.statusText);
				throw new Error(`Upload failed: ${res.statusText}`);
			}
			navTo("edit", user.id);
		} catch (err) {
			console.error(err);
			showError("upload-error", "Upload failed. Only .png or .jpg and not more than 2MB");
		}
	});
}


	

function setupEditUserForm(user: User) {
	const editUserForm = document.getElementById("edit-user-form") as HTMLFormElement | null;
	if (!editUserForm) return;

	editUserForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		document.getElementById("user-error-check")?.classList.add("hidden");
		document.getElementById("userfail")?.classList.add("hidden");

		const formData = new FormData(editUserForm);
		const newUser = (formData.get("new-user") as string)?.trim();

		if (!newUser) {
			showError("user-error-check", "Username is required");
			return;
		}

		if (!checkValidUser(newUser)) {
			showError("user-error-check", "Username must be 2-16 characters (letters/numbers only)");
			return;
		}

		try {
			const res = await fetch(`/api/users/${user.id}/username`, {
				method: "PUT",
				body: JSON.stringify({ username: newUser }),
				headers: { "Content-Type": "application/json" },
				credentials: 'include',
			});

			if (!res.ok) {
				showError("userfail", "Username already in use: " + newUser);
				throw new Error(`Request failed: ${res.status}`);
			}

			const data = await res.json();
			//console.log("Success:", data);

			const user_info = await getUser(user.id);
			navTo("edit", user_info.id);
		} catch (err) {
			console.error("Error:", err);
		}
	});
}

function setupEditEmailForm(user: User) {
	const editEmailForm = document.getElementById("edit-email-form") as HTMLFormElement | null;
	if (!editEmailForm) return;

	editEmailForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		document.getElementById("email-error-check")?.classList.add("hidden");
		document.getElementById("emailfail")?.classList.add("hidden");

		const formData = new FormData(editEmailForm);
		const newEmail = (formData.get("new-email") as string)?.trim();

		if (!newEmail) {
			showError("email-error-check", "Email is required");
			return;
		}

		if (!checkValidEmail(newEmail)) {
			showError("email-error-check", "Please enter a valid email address");
			return;
		}

		try {
			const res = await fetch(`/api/users/${user.id}/email`, {
				method: "PUT",
				body: JSON.stringify({ email: newEmail }),
				headers: { "Content-Type": "application/json" },
				credentials: 'include',
			});

			const data = await res.json();
			if (!res.ok) {
				showError("emailfail", `${data.message}`)
				throw new Error(`Request failed: ${res.status}`);
			}

			//console.log("Success:", data);

			const updatedUser = await getUser(user.id);
			navTo("edit", updatedUser.id);
		} catch (err) {
			console.error("Error:", err);
		}
	});
}

function setupEditPassForm(user: User) {
	const editPassForm = document.getElementById("edit-pass-form") as HTMLFormElement | null;
	if (!editPassForm) return;

	editPassForm.addEventListener("submit", async (e) => {
		e.preventDefault();

		document.getElementById("pass-error-check")?.classList.add("hidden");

		const formData = new FormData(editPassForm);
		const newPass = (formData.get("new-pass") as string)?.trim();

		if (!newPass)
		{
			showError("pass-error-check", "Password is required");
			return;
		}

		if (!checkValidPass(newPass)) {
			showError("pass-error-check", "Password does not meet requirements");
			return;
		}

		try {
			const res = await fetch(`/api/users/${user.id}/password`, {
				method: "PUT",
				body: JSON.stringify({ password: newPass }),
				headers: { "Content-Type": "application/json" },
				credentials: 'include',
			});
			
			const data = await res.json();
			if (!res.ok) {
				showError("pass-error-check", `${data.message}`);
				throw new Error(`Request failed: ${res.status}`);
			}

			//console.log("Success:", data);

			const updatedUser = await getUser(user.id);
			navTo("edit", updatedUser.id);
		} catch (err) {
			console.error("Error:", err);
		}
	});
}

