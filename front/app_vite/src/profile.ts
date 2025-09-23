import { getAppElement } from "./dom";
import { eventListeners } from "./listeners";
import { getFriendList, getFriendPetitions, rejectFriendPetition , acceptFriendPetition } from "./apiCall";
import { createProfileCard } from "./profileCard";
import { createFriends } from "./loadFriends";
import { createAddFriends } from "./addFriends";
import { User } from "./userInterface";
import { createDiv, createH3, createImage, createListItem, createP, createSpan, showError } from "./cssTools";
import { initializeSocket, listenSocketMsg, updateStatusDots } from "./socketEvent";

export function renderProfile(user_info:User)
{
	const appElement = getAppElement();
	if (!appElement) return;
	appElement.innerHTML = '';
	appElement.innerHTML = `
		<div class="flex justify-between space-x-4 pb-4">
			<button id="logOutBtn" class="p-1 btn-neon-pink-clip hover-line-all text-center text-sm ">Log Out</button>

			<div>
				<button id="editBtn" class=" p-1 btn-neon-blue-clip hover-line-all text-center text-sm ">Edit Profile</button>
			</div>
		</div>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 p-2">
			<div id="expandCard" class="overflow-hidden order-1"></div>
			<div id="expandFriends" class=" overflow-hidden order-2 md:order-3 lg:order-2"></div>
			<div id="expandAddFriends" class="overflow-hidden order-3 md:order-2 lg:order-3"></div>
		</div>
	</div>
	`;
	
	initializeSocket();
	createProfileCard("expandCard", user_info);
	createFriends("expandFriends");
	createAddFriends("expandAddFriends");
	load_friends(user_info.id);
	add_friend_form_check(user_info.id);
	
	const friends = document.getElementById("friends");
	friends?.addEventListener("click", () => {
		load_friends(user_info.id);
		friends.classList.add("ring-2");
		const petition = document.getElementById("invites");
		petition.classList.remove("ring-2");
	});
	
	const petition = document.getElementById("invites");
	petition?.addEventListener("click", () => {
		load_petitions(user_info.id);
		petition.classList.add("ring-2");
		const friends = document.getElementById("friends");
		friends.classList.remove("ring-2");
	});

	
	eventListeners(user_info.id);
}





function load_friends(id: string) {
	getFriendList(id).then((friends: User[]) => {
		const listElement = document.getElementById("friend-list");
		if (!listElement) return;

		listElement.innerHTML = ``;
		if (friends.length === 0) {
			const div = createDiv("text-neonBlue text-center py-8 text-lg");
			div.textContent = "No friends yet";
			listElement.appendChild(div);
			return;
		}

		friends.forEach((friend, index) => {
			///
			const wins = parseInt(friend.wins || "0");
			const losses = parseInt(friend.losses || "0");
			const totalGames = wins + losses;
			const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

			//
			const li = createListItem("", "flex items-center px-4 py-3 hover:bg-bgDark hover:bg-opacity-50");
			li.setAttribute('data-user', friend.id);
			
			//
			const indexSpan = createSpan(`${index + 1}.`, "", "mr-3 text-neonPink font-medium w-6 text-right");
			
			//
			const av_div = createDiv("relative");
			const avatarUrl = friend.avatar || "/default.jpg";
			const avatarImg = createImage(avatarUrl, "avatar", "mr-3 h-10 w-10 rounded-full object-cover border-2 border-neonBlue");
			
			//
			const online = createSpan("", "", "ml-7 -mt-2 w-2 h-2 rounded-full bg-red-500");
			online.setAttribute('data-status-indicator', 'true');
			
			//
			const infoDiv = createDiv("flex-1 min-w-0");
			
			//
			const usernameH3 = createH3(friend.username || "", "text-neonBlue font-medium truncate");
			usernameH3.setAttribute("title", friend.username || "");
			
			//
			const statsP = createP(`${wins} wins    ${winRate}% win rate`, "text-white text-sm");
			
			//
			infoDiv.appendChild(usernameH3);
			infoDiv.appendChild(statsP);
			
			li.appendChild(indexSpan);
			li.appendChild(av_div);
			av_div.appendChild(avatarImg);
			av_div.appendChild(online);
			li.appendChild(infoDiv);
			
			listElement.appendChild(li);
		});
		updateStatusDots();
	});
}

async function load_petitions(id: string)
{
	try
	{
		const petition = await getFriendPetitions(id);
		const listElement = document.getElementById("friend-list");
		if (!listElement) return;
		
		listElement.innerHTML = ``;
		
		if (petition.length === 0)
		{
			const div = createDiv("text-neonBlue text-center py-8 text-lg");
			div.textContent = "No pending invites";
			listElement.appendChild(div);
			return;
		}
		
		petition.forEach((petition, index) =>
		{
			const li = document.createElement("li");
			li.className = "flex items-center px-4 py-3 hover:bg-bgDark hover:bg-opacity-50";
			const avatarUrl = petition.avatar || "/default.jpg";
			
			const acceptButton = document.createElement("button");
			acceptButton.textContent = "Accept";
			acceptButton.className = "btn-neon-blue2 btn-neon-blue:hover text-xs mb-1 px-3 py-1 mr-2";
			acceptButton.addEventListener("click", async () =>    
			{
				try
				{
					await acceptFriendPetition(id, petition.id);
					await load_petitions(id);
				}
				catch (error)
				{
					console.error("Error accepting petition:", error);
				}
			});
			
			const denyButton = document.createElement("button");
			denyButton.textContent = "Decline";
			denyButton.className = "btn-neon-pink2 btn-neon-pink:hover text-xs mt-1 px-3 py-1";
			denyButton.addEventListener("click", async () =>
			{
				try
				{
					await rejectFriendPetition(id, petition.id);
					await load_petitions(id);
				}
				catch (error)
				{
					console.error("Error rejecting petition:", error);
				}
			});
			
			li.innerHTML = `
			<span class="mr-3 text-neonPink font-medium w-6 text-right">${index + 1}.</span>
			<img class="mr-3 h-10 w-10 rounded-full object-cover border-2 border-neonBlue" src="${avatarUrl}" alt="avatar" />
			<div class="flex-1 min-w-0 mr-2">
				<h3 class="text-neonBlue font-medium truncate" title="${petition.username}">${petition.username}</h3>
				<p class="text-white text-sm">Pending request</p>
			</div>
			`;
			
			const buttonContainer = li.querySelector("div:last-child");
			if (buttonContainer) {
				buttonContainer.appendChild(acceptButton);
				buttonContainer.appendChild(denyButton);
			}
			listElement.appendChild(li);
		});
	}
	catch (error)
	{
		console.error("Error loading petitions:", error);
	}
}


function add_friend_form_check(id: string)
{
	const addFriendForm = document.getElementById("addFriendForm") as HTMLFormElement | null;
	const fail = document.getElementById("userfail");
	fail.classList.add("hidden");
	if (addFriendForm)
	{
		addFriendForm.addEventListener("submit", async (e) =>
		{
			e.preventDefault();


			try
			{
				fail.classList.add("hidden");
				const formData = new FormData(addFriendForm);
				const res = await fetch(`/api/users/` + id + "/friend_request",
				{
					method: "POST",
					body: JSON.stringify(
					{
						receiver: (formData.get("friend-name") as string)?.trim(),
					}),
					headers:
					{
						"Content-Type": "application/json",
					},
					credentials: 'include',
				});

				const data = await res.json();
				const userok = document.getElementById("userok");
				fail.classList.add("hidden");
				userok.classList.add("hidden");
				if (!res.ok)
				{
					showError("userfail", data.message);
					// fail.textContent = data.message;
					// fail.classList.remove("hidden");
					throw new Error(` - status ${res.status}`);
				}
				fail.classList.add("hiden");
				userok.classList.remove("hidden");
				//console.log("Success:", data);
			}
			catch (err)
			{
				console.error("Error adding friend", err);
			}
		});
	}
}




