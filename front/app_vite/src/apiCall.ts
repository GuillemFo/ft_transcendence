import { showError } from "./cssTools";
import { navTo } from "./navigation";
import { MatchHistory, User } from "./userInterface";

export async function getUser(id)
{
	let user: User;
	try
	{
		const response = await fetch("/api/users/" + id,
		{
			method:"GET",
			credentials: 'include'
		});
		if (!response.ok) {
			console.warn(`User fetch failed: ${response.status}`);
			return null;
		}
		const data: User = await response.json();
		user = data;
		//console.log('User loaded:', user);
	}
	catch (error)
	{
		console.error('Error fetching user:', error);
	}
	return user;
}

export async function getUserByName(name:string)
{
	let user: User;
	try
	{
		const response = await fetch("/api/users/get_by_username/" + name,
		{
			method:"GET",
			credentials: 'include'
		});
		if (!response.ok) {
			console.warn(`User fetch failed: ${response.status}`);
			return null;
		}
		const data: User = await response.json();
		user = data;
		//console.log('User loaded:', user);
	}
	catch (error)
	{
		console.error('Error fetching user:', error);
	}
	return user;
}

export async function getFriendList(id)
{
	try
	{
		const response = await fetch("/api/users/" + id + "/friendships",
		{
			method:"GET",
			credentials: 'include'
		});
		const data = await response.json();
		const friendlist: User[] = data.friend_list ?? [];
		return friendlist;
	}
	catch (error)
	{
		console.error('Error fetching friendlist:', error);
		return[];
	}
}


export async function getFriendPetitions(id)
{
	try
	{
		const response = await fetch("/api/users/" + id + "/friend_requests?side=received",
		{
			method:"GET",
			credentials: 'include',
		});
		const data = await response.json();
		const friendlistpet: User[] = data.requests ?? [];
		return friendlistpet;
	}
	catch (error)
	{
		console.error('Error fetching friendlist petitions:', error);
		return[];
	}
}

export async function rejectFriendPetition(id, petitionid)
{
	try
	{
		const response = await fetch("/api/users/" + petitionid + "/friend_request?receiverId=" + id,
		{
			method: "DELETE",
			credentials: 'include'
		});
		const data = await response.json();
		//console.log(data);
	}
	catch (error)
	{
		console.error('Error rejecting friend:', error);
	}
}

export async function acceptFriendPetition(id, petitionid)
{
	try
	{
		const response = await fetch("/api/users/" + id + "/friendship",
		{
			method: "POST",
			body: JSON.stringify(
			{			
				friendId : petitionid
			}),
			headers:
			{
				"Content-Type": "application/json",
			},
			credentials: 'include',
		});
		const data = await response.json();
		//console.log(data);
	}
	catch (error)
	{
		console.error('Error accepting friend:', error);
	}
}

export async function getMatchHistory(id)
{
	try
	{
		const response = await fetch("/api/match_history/get_by_userId/" + id,
		{
			method:"GET",
			credentials: 'include',
		});
		const data = await response.json();
		// console.table(data);
		const matchHist: MatchHistory[] = data.matches ?? [];
		return matchHist;
	}
	catch (error)
	{
		console.error('Error fetching match history:', error);
		return[];
	}
}

export async function fetchAndDownload(user:User)
{
	try
	{
		const response = await fetch("/api/users/" + user.id,
		{
			method:"GET",
			credentials: 'include'
		});
		if (!response.ok)
		{
			showError("fallbackex", (await response.json()).message);
			throw new Error('Network response was not ok');
		}
		const data = await response.json();

		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'data.json';

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(url);

	}
	catch (error)
	{
		console.error('Error fetching data:', error);
	}
}


export async function fetchDelete(user:User)
{
	try
	{
		const response = await fetch("/api/users/" + user.id,
		{
			method:"DELETE",
			credentials: 'include'
		});
		if (!response.ok)
		{
			showError("fallbackex", (await response.json()).message);
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		navTo("signed-out");
	}
	catch (error)
	{
		console.error('Error fetching data:', error);
	}
}