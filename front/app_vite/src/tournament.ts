import { getAppElement } from './dom';
import { eventListeners } from './listeners';
import { Tournament, User } from './userInterface';
import { createBut, createDiv, createLab } from './cssTools';
import { MatchRuleset } from './game/MatchRuleset';
import { navTo } from './navigation';
import { initializeSocket } from './socketEvent';

export function renderTournament(user_info:User, matchSettings:MatchRuleset, tournamentData:Tournament)
{
	const appElement = getAppElement();
	if (!appElement)
		return;
	appElement.innerHTML = '';
	appElement.innerHTML = `
	<div class="flex justify-end space-x-4 pb-4">
		<div>
			<button id="profileBtn" class=" p-1 btn-neon-blue-clip hover-line-all text-center text-sm ">Profile</button>
			<button id="tournament-settings" class="p-1 btn-neon-blue-clip hover-line-all text-center text-sm ">Edit Tournament</button>
		</div>
	</div>
	<div id="expandTournament"></div>
	`;
	initializeSocket();
	createTournament("expandTournament");
	checkTournamentStatus(tournamentData);
	populateTournament(tournamentData);
	eventListeners(user_info.id);
	const game_1 = document.getElementById("vs_block1");
	game_1?.addEventListener("click", () => {
		if (tournamentData.game_1 == "n/a")
		{
			matchSettings.amaiaRefreshRateOption = 0;
			tournamentData.game_1 = "playing";
			navTo("game", user_info.id, matchSettings, null, tournamentData);
		}
	});
	
	const game_2 = document.getElementById("vs_block2");
	game_2?.addEventListener("click", () => {
		if (tournamentData.game_2 == "n/a")
		{
			matchSettings.amaiaRefreshRateOption = 0;
			if (tournamentData.player4 == "Am[ai]a")
				matchSettings.amaiaRefreshRateOption = 1;
			tournamentData.game_2 = "playing";
			navTo("game", user_info.id, matchSettings, null, tournamentData);
		}
	});
	const game_3 = document.getElementById("vs_final");
	game_3?.addEventListener("click", () => {
		if (tournamentData.game_3 == "n/a" && (tournamentData.winner1 != "Pending" && tournamentData.winner2 != "Pending"))
		{
			matchSettings.amaiaRefreshRateOption = 0;
			if (tournamentData.winner2 == "Am[ai]a")
				matchSettings.amaiaRefreshRateOption = 1;
			tournamentData.game_3 = "playing";
			navTo("game", user_info.id, matchSettings, null, tournamentData);
		}
	});
	
}




export function createTournament(name: string)
{
	const body = document.getElementById(name);
	if (!body) return;

	body.innerHTML = "";

	///
	const t_div1 = createDiv("min-w-2xs p-2");
	const t_div2 = createDiv("flex flex-col items-center justify-center gap-4 lg:flex-row lg:items-stretch");

	///
	const blocksBox = createDiv("order-1 flex w-full flex-col gap-4 lg:order-1 lg:w-auto");

	///
	const block1 = createDiv("w-full min-w-3xs p-2 lg:w-64 xl:w-72 2xl:w-80 bg-gradient-border ");
	block1.id = "block1";

	const block1Label = createLab("Match 1", "", "text-center text-neonBlue font-bold");

	const block1Match = createDiv("min-h-20 overflow-auto p-2");

	const b1_row1 = createDiv("flex flex-row justify-between gap-2");
	const player1 = createDiv("truncate text-white");
	player1.id = "player1";
	player1.textContent = "Player 1";

	const player1score = createDiv("flex-shrink-0 text-white");
	player1score.id = "player1score";
	player1score.textContent = "n/a";

	const vs1 = createBut("vs", "vs_block1", "p-1 btn-neon-pink-clip text-center text-base mt-2 mb-2 hover-line-all");

	const b1_row2 = createDiv("flex flex-row justify-between gap-2");
	const player2 = createDiv("truncate text-white");
	player2.id = "player2";
	player2.textContent = "Player 2";

	const player2score = createDiv("flex-shrink-0 text-white");
	player2score.id = "player2score";
	player2score.textContent = "n/a";

	///
	const block2 = createDiv("w-full min-w-3xs p-2 lg:w-64 xl:w-72 2xl:w-80 bg-gradient-border ");
	block2.id = "block2";

	const block2Label = createLab("Match 2", "", "text-center text-neonBlue font-bold");

	const block2Match = createDiv("min-h-20 overflow-auto p-2");

	const b2_row1 = createDiv("flex flex-row justify-between gap-2");
	const player3 = createDiv("truncate text-white");
	player3.id = "player3";
	player3.textContent = "Player 3";

	const player3score = createDiv("flex-shrink-0 text-white");
	player3score.id = "player3score";
	player3score.textContent = "n/a";

	const vs2 = createBut("vs", "vs_block2", "p-1 btn-neon-pink-clip text-center text-base mt-2 mb-2 hover-line-all");

	const b2_row2 = createDiv("flex flex-row justify-between gap-2");
	const player4 = createDiv("truncate text-white");
	player4.id = "player4";
	player4.textContent = "Player 4";

	const player4score = createDiv("flex-shrink-0 text-white");
	player4score.id = "player4score";
	player4score.textContent = "n/a";

	///
	///
	const block3 = createDiv("order-3 w-full min-w-3xs p-2 lg:order-2 lg:w-64 lg:self-center xl:w-72 2xl:w-80 bg-gradient-border ");
	block3.id = "block3";

	///
	const block3Inner = createDiv("text-center ");

	const block3Label = createLab("Final match", "", "text-neonBlue font-bold");

	const block3Match = createDiv("min-h-20 overflow-auto p-2");

	const f_row1 = createDiv("flex flex-row justify-between gap-2");
	const box1win = createDiv("truncate text-white");
	box1win.id = "box1win";
	box1win.textContent = "Winner Block 1";

	const box1score = createDiv("flex-shrink-0 text-white");
	box1score.id = "box1score";
	box1score.textContent = "n/a";

	const vsFinal = createBut("vs", "vs_final", "p-1 btn-neon-pink-clip text-center text-base mt-2 mb-2 hover-line-all");

	const f_row2 = createDiv("flex flex-row justify-between gap-2");
	const box2win = createDiv("truncate text-white");
	box2win.id = "box2win";
	box2win.textContent = "Winner Block 2";

	const box2score = createDiv("flex-shrink-0 text-white");
	box2score.id = "box2score";
	box2score.textContent = "n/a";

	///
	
	const winnerBox = createDiv("hidden order-4 w-full min-w-3xs p-2 lg:w-64 lg:self-center xl:w-72 2xl:w-80 bg-gradient-border");
	winnerBox.id = "winnerBox";

	const winnerInner = createDiv("");

	const winnerLabel = createLab("Winner", "", "text-neonBlue font-bold");

	const winner = createDiv("truncate text-white text-center font-bold");
	winner.id = "winner";
	winner.textContent = "n/a";

	///
	body.appendChild(t_div1);
	t_div1.appendChild(t_div2);

	b1_row1.appendChild(player1);
	b1_row1.appendChild(player1score);
	b1_row2.appendChild(player2);
	b1_row2.appendChild(player2score);
	block1Match.appendChild(b1_row1);
	block1Match.appendChild(vs1);
	block1Match.appendChild(b1_row2);
	block1Label.appendChild(block1Match);
	block1.appendChild(block1Label);

	b2_row1.appendChild(player3);
	b2_row1.appendChild(player3score);
	b2_row2.appendChild(player4);
	b2_row2.appendChild(player4score);
	block2Match.appendChild(b2_row1);
	block2Match.appendChild(vs2);
	block2Match.appendChild(b2_row2);
	block2Label.appendChild(block2Match);
	block2.appendChild(block2Label);

	blocksBox.appendChild(block1);
	blocksBox.appendChild(block2);
	t_div2.appendChild(blocksBox);

	f_row1.appendChild(box1win);
	f_row1.appendChild(box1score);
	f_row2.appendChild(box2win);
	f_row2.appendChild(box2score);
	block3Match.appendChild(f_row1);
	block3Match.appendChild(vsFinal);
	block3Match.appendChild(f_row2);
	block3Label.appendChild(block3Match);
	block3Inner.appendChild(block3Label);
	block3.appendChild(block3Inner);
	t_div2.appendChild(block3);

	winnerInner.appendChild(winnerLabel);
	winnerInner.appendChild(winner);
	winnerBox.appendChild(winnerInner);
	t_div2.appendChild(winnerBox);
}



export function checkTournamentStatus(tournamentData: Tournament)
{
	if (tournamentData.game_1 != "n/a")
	{
		if (Number(tournamentData.player1_score) < Number(tournamentData.player2_score))
			tournamentData.winner1 = tournamentData.player2;
		else
			tournamentData.winner1 = tournamentData.player1;
	}
	if (tournamentData.game_2 != "n/a")
	{
		if (Number(tournamentData.player3_score) < Number(tournamentData.player4_score))
			tournamentData.winner2 = tournamentData.player4;
		else
			tournamentData.winner2 = tournamentData.player3;
	}
	if (tournamentData.game_3 != "n/a")
	{
		if (Number(tournamentData.winner1_score) < Number(tournamentData.winner2_score))
			tournamentData.finalWinner = tournamentData.winner2;
		else
			tournamentData.finalWinner = tournamentData.winner1;
	}
}





export function populateTournament(tournamentData: Tournament)
{
	if (!tournamentData)
		return;
	///
	const player1 = document.getElementById("player1");
	const player1score = document.getElementById("player1score");
	if (player1)
		player1.textContent = tournamentData.player1 ?? "player_1";
	if (player1score)
		player1score.textContent = tournamentData.player1_score ?? "n/a";

	///
	const player2 = document.getElementById("player2");
	const player2score = document.getElementById("player2score");
	if (player2)
		player2.textContent = tournamentData.player2 ?? "player_2";
	if (player2score)
		player2score.textContent = tournamentData.player2_score ?? "n/a";

	///
	const player3 = document.getElementById("player3");
	const player3score = document.getElementById("player3score");
	if (player3)
		player3.textContent = tournamentData.player3 ?? "player_3";
	if (player3score)
		player3score.textContent = tournamentData.player3_score ?? "n/a";

	///
	const player4 = document.getElementById("player4");
	const player4score = document.getElementById("player4score");
	if (player4)
		player4.textContent = tournamentData.player4 ?? "player_4";
	if (player4score)
		player4score.textContent = tournamentData.player4_score ?? "n/a";

	///
	const box1win = document.getElementById("box1win");
	const box1score = document.getElementById("box1score");
	if (box1win)
		box1win.textContent = tournamentData.winner1 ?? "Winner Block 1";
	if (box1score)
		box1score.textContent = tournamentData.winner1_score ?? "n/a";

	const box2win = document.getElementById("box2win");
	const box2score = document.getElementById("box2score");
	if (box2win)
		box2win.textContent = tournamentData.winner2 ?? "Winner Block 2";
	if (box2score)
		box2score.textContent = tournamentData.winner2_score ?? "n/a";

	///
	const winner = document.getElementById("winner");
	const winnerBox = document.getElementById("winnerBox");
	if (tournamentData.finalWinner != "n/a")
	{
		if (winner)
			winner.textContent = tournamentData.finalWinner;
		if (winnerBox)
			winnerBox.classList.remove("hidden");
	}
	else
	{
		if (winner)
			winner.textContent = "n/a";
		if (winnerBox)
			winnerBox.classList.add("hidden");
	}
}


