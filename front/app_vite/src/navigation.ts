import { AppState } from './state';
import { render } from './render';
import { MatchRuleset } from './game/MatchRuleset';
import { Tournament, User } from './userInterface';


const protectedPages = new Set(['profile','edit','game','tournament','match-settings','tournament-settings','match-history',]);

function isLoggedIn(): boolean
{
	return Boolean(localStorage.getItem('user_id'));
}

export function navTo(page: string,id?: string,	MatchRuleset?: MatchRuleset,player2?: User,	tournamentData?: Tournament): void
{
	//console.log('navTo called with page:', page);
	if (protectedPages.has(page) && !isLoggedIn())
	{
		history.replaceState({ page: 'signed-out' }, '', '/signed-out');
		render({ page: 'signed-out' });
		return;
	}

	const state: AppState = { page, id };
	history.pushState(state, '', `/${page}`);
	render(state, MatchRuleset, player2, tournamentData);
}

export function replState(page: string, id?: string): void
{
	//console.log('replState called with page:', page);
	if (protectedPages.has(page) && !isLoggedIn())
	{
		history.replaceState({ page: 'signed-out' }, '', '/signed-out');
		render({ page: 'signed-out' });
		//console.log(history.state);
		return;
	}

	const state: AppState = { page, id };
	history.replaceState(state, '', `/${page}`);
	render(state);
}

export function setupHistoryListener()
{
	window.addEventListener('popstate', (event: PopStateEvent) => {
		const state = event.state as AppState | null;

		if (!state)
		{
			render({ page: 'home' });
			return;
		}
		if (protectedPages.has(state.page) && !isLoggedIn())
		{
			history.replaceState({ page: 'signed-out' }, '', '/signed-out');
			render({ page: 'signed-out' });
			//console.log(history.state);
			return;
		}

		render(state);
	});
}
