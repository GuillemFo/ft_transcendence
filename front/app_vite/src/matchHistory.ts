import { getMatchHistory } from "./apiCall";
import { createBut, createDiv, createH2, createH3, createListItem, createP, createSpan, createUl } from "./cssTools";
import { getAppElement } from "./dom";
import { eventListeners } from "./listeners";
import { initializeSocket, listenSocketMsg } from "./socketEvent";
import { MatchHistory, User } from "./userInterface";

export function renderHistory(user_info:User)
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
		<div class="justify-center">
			<div id="expandMatchHistory" class="order-1"></div>
		</div>
	</div>
	`;
	initializeSocket();
	listenSocketMsg();
	createMatchHistory(user_info.id, user_info);
	
	eventListeners(user_info.id);
}



function createMatchListItem(match: MatchHistory, user_info:User)
{
	const li = createListItem("","grid grid-cols-1 gap-4 bg-gradient-border m-4 p-4 hover:bg-gray-800 cursor-pointer transition-colors duration-150");

	const summaryDiv = createDiv("items-center text-white");
	const matchDate = new Date(match.createdAt || "").toLocaleString();

	let matchResult: string;

	if (user_info.id=== match.player1)
	{
		if (parseInt(match.player1_score || "0") > parseInt(match.player2_score || "0"))
		{
			matchResult = "Win";
		}
		else if (parseInt(match.player1_score || "0") < parseInt(match.player2_score || "0"))
		{
			matchResult = "Loss";
		}
		else
		{
			matchResult = "Draw";
		}
	} 
	else if (user_info.id === match.player2)
	{
		if (parseInt(match.player2_score || "0") > parseInt(match.player1_score || "0"))
		{
			matchResult = "Win";
		}
		else if (parseInt(match.player2_score || "0") < parseInt(match.player1_score || "0"))
		{
			matchResult = "Loss";
		}
		else
		{
			matchResult = "Draw";
		}
	}
	else
	{
		matchResult = "Unknown";
	}

	const div_game = createDiv("text-center");
	const game = createSpan(`${matchDate} • ${matchResult}`,"",	matchResult === "Win"? "text-green-400": matchResult === "Loss"	? "text-red-400" : matchResult === "Draw" ? "text-yellow-400": "text-gray-400");
	summaryDiv.appendChild(div_game);
	div_game.appendChild(game);

	li.appendChild(summaryDiv);

	li.addEventListener("click", () => {
		createMatchCard("expandMatchHistory", match, user_info);
	});

	return li;
}



function createMatchCard(name: string, match: MatchHistory, user_info: User)
{
	const body = document.getElementById(name);
	if (!body) return;
	body.innerHTML = "";

	const duration = `${parseFloat(match.duration).toFixed(2)}s`;

	const truncateId = (id: string | number) => {
		if (typeof id !== "string") return String(id);
		return id.length > 8 ? `${id.slice(0, 8)}…` : id;
	};

	const main = createDiv("flex flex-grow items-center justify-center p-4");
	const card = createDiv("bg-gradient-border max-w-md mx-auto p-6 rounded-lg text-white shadow-lg");

	//
	const header = createDiv("text-center mb-6");
	header.appendChild(
		createSpan(
			`Date: ${new Date(match.createdAt).toLocaleString()}`,
			"",
			"block text-xs text-gray-400 mt-4"
		)
	);

	const playersLine = createDiv("block text-xs mt-1 flex justify-center space-x-2 text-gray-500");
	const p1 = createSpan(`P1: ${truncateId(match.player1_username)}`, "", "text-neonGreen font-bold");
	p1.setAttribute("title", match.player1_username|| "");
	playersLine.appendChild(p1);
	playersLine.appendChild(createSpan("|", "", ""));
	const p2 = createSpan(`P2: ${truncateId(match.player2_username)}`, "", "text-neonYellow font-bold");
	p2.setAttribute("title", match.player2_username|| "");
	playersLine.appendChild(p2)
	header.appendChild(playersLine);
	card.appendChild(header);

	//
	const statsUl = createUl("py-4 border-b border-neonPink flex justify-around");

	//
	const durationLi = createListItem("", "flex flex-col items-center");
	durationLi.appendChild(createSpan("Duration", "", "text-neonPink2 font-bold mb-1"));
	durationLi.appendChild(createSpan(duration, "", "text-white"));
	statsUl.appendChild(durationLi);

	//
	const bounceLi = createListItem("", "flex flex-col items-center");
	bounceLi.appendChild(createSpan("Bounce Streak", "", "text-neonPink2 font-bold mb-1"));
	bounceLi.appendChild(createSpan(String(match.bounce_streak), "", "text-white"));
	statsUl.appendChild(bounceLi);

	//
	const parryLi = createListItem("", "flex flex-col items-center");
	parryLi.appendChild(createSpan("Parry Streak", "", "text-neonPink2 font-bold mb-1"));
	parryLi.appendChild(createSpan(String(match.parry_streak), "", "text-white"));
	statsUl.appendChild(parryLi);

	card.appendChild(statsUl);

	//
	const p1StatsUl = createUl("py-4 border-b border-neonPink flex justify-around");

	//
	const p1ScoreLi = createListItem("", "flex flex-col items-center");
	p1ScoreLi.appendChild(createSpan("P1 Score", "", "text-neonGreen font-bold mb-1"));
	p1ScoreLi.appendChild(createSpan(String(match.player1_score), "", "text-white"));
	p1StatsUl.appendChild(p1ScoreLi);

	//
	const p1BouncesLi = createListItem("", "flex flex-col items-center");
	p1BouncesLi.appendChild(createSpan("P1 Bounces", "", "text-neonGreen font-bold mb-1"));
	p1BouncesLi.appendChild(createSpan(String(match.player1_bounce_count), "", "text-white"));
	p1StatsUl.appendChild(p1BouncesLi);

	//
	const p1ParryLi = createListItem("", "flex flex-col items-center");
	p1ParryLi.appendChild(createSpan("P1 Parry Acc", "", "text-neonGreen font-bold mb-1"));
	let tmp_1 = (100* parseFloat(match.player1_parry_count) / parseFloat(match.player1_parry_attempts)).toFixed(2);
	if (parseFloat(match.player1_parry_attempts) == 0)
		tmp_1 = "0";
	p1ParryLi.appendChild(createSpan(`${tmp_1}%`, "", "text-white"));
	p1StatsUl.appendChild(p1ParryLi);

	card.appendChild(p1StatsUl);

	//
	const p2StatsUl = createUl("py-4 flex justify-around");

	//
	const p2ScoreLi = createListItem("", "flex flex-col items-center");
	p2ScoreLi.appendChild(createSpan("P2 Score", "", "text-neonYellow font-bold mb-1"));
	p2ScoreLi.appendChild(createSpan(String(match.player2_score), "", "text-white"));
	p2StatsUl.appendChild(p2ScoreLi);

	//
	const p2BouncesLi = createListItem("", "flex flex-col items-center");
	p2BouncesLi.appendChild(createSpan("P2 Bounces", "", "text-neonYellow font-bold mb-1"));
	p2BouncesLi.appendChild(createSpan(String(match.player2_bounce_count), "", "text-white"));
	p2StatsUl.appendChild(p2BouncesLi);

	//
	const p2ParryLi = createListItem("", "flex flex-col items-center");
	p2ParryLi.appendChild(createSpan("P2 Parry Acc", "", "text-neonYellow font-bold mb-1"));
	let tmp_2 = (100* parseFloat(match.player2_parry_count) / parseFloat(match.player2_parry_attempts)).toFixed(2);
	if (parseFloat(match.player2_parry_attempts) == 0)
		tmp_2 = "0";
	p2ParryLi.appendChild(createSpan(`${tmp_2}%`, "", "text-white"));
	p2StatsUl.appendChild(p2ParryLi);

	card.appendChild(p2StatsUl);

	//
	const backDiv = createDiv("pt-4 mt-4 mb-4 border-t border-neonPink");
	const backBtn = createBut("Back", "match-history2", "btn-neon-pink2 w-full hover-underline-animation");
	backDiv.appendChild(backBtn);
	card.appendChild(backDiv);

	backBtn.addEventListener("click", () => {
		createMatchHistory(user_info.id, user_info);
	});

	main.appendChild(card);
	body.appendChild(main);
}


export function createMatchHistory(id: string, user_info:User)
{
	getMatchHistory(id).then((matches: MatchHistory[]) => {
		const body = document.getElementById("expandMatchHistory");
		if (!body) return;

		body.innerHTML = ``;

		if (matches.length === 0)
		{
			const container = createDiv("min-h-72 min-w-16 max-h-72 max-w-2xl mx-4 overflow-y-auto sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm sm:mx-auto md:mx-auto lg:mx-auto xl:mx-auto mt-16 text-softWhite");
			const div = createDiv("text-lg mt-4 text-center bg-gradient-border");
			div.textContent = "No match history found";

			body.appendChild(container);
			container.appendChild(div);

			return;
		}

		const container = createDiv("min-h-72 min-w-16 max-h-72 max-w-2xl mx-4 overflow-y-auto sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm sm:mx-auto md:mx-auto lg:mx-auto xl:mx-auto mt-16 text-softWhite");
		const div_match = createDiv("text-neonBlue text-xl text-center text-2xl font-bold");
		body.appendChild(div_match);
		div_match.textContent = "Match History";

		///
		const matchList = createUl("flex flex-col gap-4 overflow-y-auto");

		container.appendChild(matchList);

		///
		const matchesReversed = matches.slice().reverse();

		matchesReversed.forEach((match) => {
			const listItem = createMatchListItem(match, user_info);
			matchList.appendChild(listItem);
		});

		body.appendChild(container);
	});
}

