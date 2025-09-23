import { replState, setupHistoryListener } from "./navigation";
import { render } from "./render";
import { initializeSocket } from "./socketEvent";
import { AppState } from "./state";
import './tailwind.css';

declare global
{
	interface Window
	{
		handleCredentialResponse: (response: { credential: string }) => void;
	}
}


const protectedPages = new Set(['profile','edit','game','tournament','match-settings','tournament-settings','match-history',]);

function isLoggedIn(): boolean
{
	return Boolean(localStorage.getItem('user_id'));
}

function parsePath(path: string): AppState
{
	const segments = path.split('/').filter(Boolean);
	const storedId = localStorage.getItem("user_id");
	if (segments.length === 0)
		return { page: 'home' };

	switch (segments[0])
	{
		case 'profile':
			return { page: 'profile', id: storedId ?? undefined };
		case 'edit':
			return { page: 'edit', id: storedId ?? undefined };
		case 'game':
			return { page: 'game', id: storedId ?? undefined };
		case 'tournament':
			return { page: 'tournament', id: storedId ?? undefined };
		case 'match-settings':
			return { page: 'match-settings', id: storedId ?? undefined };
		case 'tournament-settings':
			return { page: 'tournament-settings', id: storedId ?? undefined };
		case 'match-history':
			return { page: 'match-history', id: storedId ?? undefined };
		case 'login':
			return { page: 'login' };
		case 'reg':
			return { page: 'reg' };
		case 'signed-out':
  			return { page: 'signed-out' };
		case 'home':
		case undefined:
			return { page: 'home' };
		default:
			return { page: '404' };
	}
}


function init()
{
	setupHistoryListener();

	if (!history.state)
	{
		const initialState = parsePath(window.location.pathname);

		if (protectedPages.has(initialState.page) && !isLoggedIn())
		{
			history.replaceState({ page: 'signed-out' }, '', '/signed-out');
			render({ page: 'signed-out' });
			//console.log(history.state);
		}
		else
		{
			history.replaceState(initialState, '', window.location.href);
			render(initialState);
		}
	}
	else
	{
		if (protectedPages.has(history.state.page) && !isLoggedIn())
		{
			history.replaceState({ page: 'signed-out' }, '', '/signed-out');
			render({ page: 'signed-out' });
			//console.log(history.state);
		}
		else
		{
			render(history.state);
		}
	}
}

init();
