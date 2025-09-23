export interface User
{
	id?: string;
	username?: string;
	email?: string;
	avatar?: string;
	wins?: string;
	losses?: string;
	parryAttempts?: string;
	parryCount?: string;
	longestRally?: string;
	longestParryChain?: string;
	timesScoredAgainst?: string;
	timesScored?: string;
}


export interface MatchHistory
{
	id?: string;
	duration?: string;
	parry_streak?: string;
	bounce_streak?: string;
	
	player1?: string;
	player1_username?: string;
	player1_score?: string;
	player1_bounce_count?: string;
	player1_parry_attempts?: string;
	player1_parry_count?: string;
	
	player2?: string;
	player2_username?: string;
	player2_score?: string;
	player2_bounce_count?: string;
	player2_parry_attempts?: string;
	player2_parry_count?: string;
	
	createdAt?: string;
	updatedAt?: string;
}



export interface Tournament
{
	player1?: string;
	player1_score?: string;
	
	player2?: string;
	player2_score?: string;
	
	player3?: string;
	player3_score?: string;
	
	player4?: string;
	player4_score?: string;


	winner1?: string;
	winner1_score?: string;
	game_1?: string;
	
	winner2?: string;
	winner2_score?: string;
	game_2?: string;

	finalWinner?: string;
	game_3?: string;
}
