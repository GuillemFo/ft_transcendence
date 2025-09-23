import { AppState } from './state';
import { navTo, replState } from './navigation';
import { getUser } from './apiCall';
import { render404 } from './404';
import { renderHome } from './home';
import { MatchRuleset } from './game/MatchRuleset';
import { Tournament, User } from './userInterface';
import { renderSignOut } from './signedOut';




export async function render(state: AppState,matchSettings?: MatchRuleset,player2?: User,tournamentData?: Tournament)
{

	try
	{
		function ensureId(): string | undefined
		{
			if (!state.id)
			{
				const storedId = localStorage.getItem("user_id");
				if (storedId)
					state.id = storedId;
			}
			return state.id;
		}

		//console.log('Rendering page:', state.page);
		switch (state.page)
		{
			case 'home':
				if (!ensureId())
				{
					renderHome();
					break;
				}
				else
				{

					const userProfile = await getUser(state.id);
					if (!userProfile) renderSignOut();
					else renderHome(userProfile);
				}
				
				break;

			case 'login':
			{
				const { renderLogin } = await import('./login');
				renderLogin();
				break;
			}

			case 'reg':
			{
				const { renderRegister } = await import('./register');
				renderRegister();
				break;
			}

			case 'game':
				if (!ensureId())
				{
					render404('No user ID provided');
					break;
				}
				else
				{
					const { renderGame } = await import('./game');
					const userGame = await getUser(state.id);
					if (!userGame) renderSignOut();
					else renderGame(userGame, matchSettings, player2, tournamentData);
				}
				break;

			case 'profile':
				if (!ensureId())
				{
					render404('No user ID provided');
					break;
				}
				else
				{
					const { renderProfile } = await import('./profile');
					const userProfile = await getUser(state.id);
					if (!userProfile) renderSignOut();
					else renderProfile(userProfile);
				}
				break;

			case 'edit':
				if (!ensureId())
				{
					render404('No user ID provided');
					break;
				}
				else
				{
					const { renderEditProfile } = await import('./editProfile');
					const userEdit = await getUser(state.id);
					if (!userEdit) renderSignOut();
					else renderEditProfile(userEdit);
				}
				break;

			case 'tournament':
				if (!ensureId())
				{
					render404('No user ID provided');
					break;
				}
				else
				{
					const { renderTournament } = await import('./tournament');
					const userTournament = await getUser(state.id);
					if (!userTournament) {
						renderSignOut();
					} else if (!tournamentData) {
						navTo("tournament-settings", state.id);
					} else
					{
						renderTournament(userTournament, matchSettings, tournamentData);
					}
				}
				break;

			case 'match-settings':
				if (!ensureId())
				{
					render404('No user ID provided');
					break;
				}
				else
				{
					const { renderSettings } = await import('./matchSettings');
					const userSettings = await getUser(state.id);
					if (!userSettings) renderSignOut();
					else renderSettings(userSettings);
				}
				break;

			case 'tournament-settings':
				if (!ensureId())
				{
					render404('No user ID provided');
					break;
				}
				else
				{
					const { renderTournamentSettings } = await import('./tournamentSettings');
					const userTournamentS = await getUser(state.id);
					if (!userTournamentS) renderSignOut();
					else renderTournamentSettings(userTournamentS);
				}
				break;

			case 'match-history':
				if (!ensureId())
				{
					render404('No user ID provided');
					break;
				}
				else
				{
					const { renderHistory } = await import('./matchHistory');
					const userMatch = await getUser(state.id);
					if (!userMatch) renderSignOut();
					else renderHistory(userMatch);
				}
				break;

			case '404':
				render404("Oops! The page you’re looking for doesn’t exist, has been moved, or you may have logged out. Please check the URL or log in to continue.");
				break;

			case 'signed-out':
				//console.log('Rendering signed-out page');
				renderSignOut();
				break;

			default:
				replState('home');
				break;
		}
	}
	catch (error)
	{
		console.error('Render error:', error);
	}
}
