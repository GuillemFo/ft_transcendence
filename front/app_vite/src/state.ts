import { User } from "./userInterface";

export interface AppState
{
	page: 'home' | 'login' | 'reg' | 'game' | 'profile' | 'edit' | 'user' | 'tournament' | 'match-settings' | 'match-history' | '404' | string; // Explicit union helps with type safety
	id?: string;
	userInfo?: User;
}