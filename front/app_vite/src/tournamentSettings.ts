import { getAppElement } from "./dom";
import { eventListeners } from "./listeners";
import { User, Tournament } from "./userInterface";
import { AmaiaPredictDuringImpactPauseOptions, AmaiaRefreshRateOptions, BoardLayouts, CameraModes, MatchRuleset, PuckIncrementalSpeedOptions, SpinModes } from "./game/MatchRuleset";
import { createBut, createDiv, createForm, createInp, createLab, createMain, createSelect, createSpan, showError } from "./cssTools";
import { navTo } from "./navigation";
import { initializeSocket } from "./socketEvent";




export function renderTournamentSettings(user_info:User)
{
	const appElement = getAppElement();
	if (!appElement)
		return;
	appElement.innerHTML = "";
	appElement.innerHTML = `
	<div class="flex justify-end space-x-4 pb-4">
		<div>
			<button id="profileBtn" class=" p-1 btn-neon-blue-clip hover-line-all text-center text-sm">Profile</button>
		</div>
	</div>
	<div id="expandMatchSettings">Expand Match Settings</div>
	`;

	initializeSocket();
	createTournamentSettings("expandMatchSettings");
	extractTournamentMatchSettings(user_info);
	eventListeners(user_info.id);
	
}

export function createTournamentSettings(name: string)
{
	const body = document.getElementById(name);
	if (!body) return;

	body.innerHTML = ``;
	body.className = "min-h-screen p-6";

	const main = createMain("flex flex-1");
	const container = createDiv("bg-gradient-border max-w-3xl mx-auto overflow-hidden p-6");
	const form = createForm("match-settings-form", "space-y-6");
	const title = createSpan("Tournament Settings", "", "text-neonPink  text-3xl font-bold block text-center mt-2");


	//
	const boardLayoutDiv = createDiv("space-y-2");
	const boardLayoutLabel = createLab("Board Layout", "boardLayout", "block text-neonBlue font-bold mb-2");
	const boardLayoutSelect = createSelect(
		"boardLayout",
		"neon-box-blue text-neonBlue w-full py-2 px-3 mb-1 focus:outline-none",
		[
			{value: "0", text: "Default"},
			{value: "1", text: "Diamond Plaza"},
			{value: "2", text: "Snowed Lake"},
			{value: "3", text: "Jungle Gym"},
			{value: "4", text: "Ethereal Meadows"}
		]
	);
	
	////
	const targetScoreDiv = createDiv("space-y-2");
	const targetScoreLabel = createLab("Target Score (1-9)", "targetScore", "block text-neonBlue font-bold mb-2");
	const targetScoreInput = createInp("", "number", "targetScore", "targetScore", "neon-box-blue text-neonBlue w-full py-2 px-3 mb-1 focus:outline-none");
	targetScoreInput.min = "1";
	targetScoreInput.max = "9";
	targetScoreInput.value = "1";
	
	//
	const matchTimeDiv = createDiv("space-y-2");
	const matchTimeLabel = createLab("Match Time in seconds (30-600)", "matchTime", "block text-neonBlue font-bold mb-2");
	const matchTimeInput = createInp("", "number", "matchTime", "matchTime", "neon-box-blue text-neonBlue w-full py-2 px-3 mb-1 focus:outline-none");
	matchTimeInput.min = "30";
	matchTimeInput.max = "600";
	matchTimeInput.value = "60";
	
	//
	const allowTiesDiv = createDiv("space-y-2");
	const allowTiesLabel = createLab("", "allowTies", "flex items-center");
	const allowTiesInput = createInp("", "checkbox", "allowTies", "allowTies", "rounded border-neonBlue text-neonPink focus:ring-neonPink");
	const allowTiesSpan = createSpan("Allow Ties", "", "ml-2 text-sm text-neonBlue");
	
	//
	const amaiaRefreshRateDiv = createDiv("space-y-2");
	const amaiaRefreshRateLabel = createLab("Amaia Refresh Rate", "amaiaRefreshRate", "block text-neonBlue font-bold mb-2");
	const amaiaRefreshRateSelect = createSelect(
		"amaiaRefreshRate",
		"neon-box-blue text-neonBlue w-full py-2 px-3 mb-1 focus:outline-none",
		[
			{value: "0", text: "Disabled (Player 2 is human)"},
			{value: "1", text: "Slow (1s)"},
			{value: "2", text: "Medium"},
			{value: "3", text: "Fast"},
			{value: "4", text: "Constant"},
		]
	);
	(amaiaRefreshRateSelect.querySelector("option[value='0']") as HTMLOptionElement).selected = true;
	
	//
	const amaiaImpactPausePredictDiv = createDiv("space-y-2");
	const amaiaImpactPausePredictLabel = createLab("Amaia Impact Pause Predict", "amaiaImpactPausePredict", "block text-neonBlue font-bold mb-2");
	const amaiaImpactPausePredictSelect = createSelect(
		"amaiaImpactPausePredict",
		"neon-box-blue text-neonBlue w-full py-2 px-3 mb-1 focus:outline-none",
		[
			{value: "0", text: "Disabled"},
			{value: "1", text: "Enabled"},
			{value: "2", text: "Buffered"}
		]
	);
	
	//
	const spinModeDiv = createDiv("space-y-2");
	const spinModeLabel = createLab("Spin Mode", "spinMode", "block text-neonBlue font-bold mb-2");
	const spinModeSelect = createSelect(
		"spinMode",
		"neon-box-blue text-neonBlue w-full py-2 px-3 mb-1 focus:outline-none",
		[
			{value: "0", text: "Disabled (Default Pong)"},
			{value: "1", text: "Lenient"},
			{value: "2", text: "Precise"},
		]
	);
	
	//
	const puckIncrementalSpeedDiv = createDiv("space-y-2");
	const puckIncrementalSpeedLabel = createLab("Puck Incremental Speed", "puckIncrementalSpeed", "block text-neonBlue font-bold mb-2");
	const puckIncrementalSpeedSelect = createSelect(
		"puckIncrementalSpeed",
		"neon-box-blue text-neonBlue w-full py-2 px-3 mb-1 focus:outline-none",
		[
			{value: "0", text: "Disabled"},
			{value: "1", text: "Slow"},
			{value: "2", text: "Medium"},
			{value: "3", text: "Fast"}
		]
	);
	(puckIncrementalSpeedSelect.querySelector("option[value='1']") as HTMLOptionElement).selected = true;
	
	//
	const stickyCeilingDiv = createDiv("space-y-2");
	const stickyCeilingLabel = createLab("", "stickyCeiling", "flex items-center");
	const stickyCeilingInput = createInp("", "checkbox", "stickyCeiling", "stickyCeiling", "rounded border-neonBlue text-neonPink focus:ring-neonPink");
	const stickyCeilingSpan = createSpan("Sticky Ceiling", "", "ml-2 text-sm text-neonBlue");
	
	//
	const cameraModeDiv = createDiv("space-y-2");
	const cameraModeLabel = createLab("Camera Mode", "cameraMode", "block text-neonBlue font-bold mb-2");
	const cameraModeSelect = createSelect(
		"cameraMode",
		"neon-box-blue text-neonBlue w-full py-2 px-3 mb-1 focus:outline-none",
		[
			{value: "0", text: "Top"},
			{value: "1", text: "HalfTilt"},
			{value: "2", text: "FullTilt"}
		]
	);
	
	//
	const simpleVisualsDiv = createDiv("space-y-2");
	const simpleVisualsLabel = createLab("", "simpleVisuals", "flex items-center");
	const simpleVisualsInput = createInp("", "checkbox", "simpleVisuals", "simpleVisuals", "rounded border-neonBlue text-neonPink focus:ring-neonPink");
	const simpleVisualsSpan = createSpan("Simple Visuals (less intensive shaders)", "", "ml-2 text-sm text-neonBlue");

	//
	const playerNamesDiv1 = createDiv("space-y-2");
	const playerNamesLabel1 = createLab("Player 1", "player1", "block text-neonBlue font-bold mb-2");
	const playerInp1 = createInp("player1", "text", "player1", "player1", "neon-box-blue text-neonBlue w-full py-2 px-3 mb-1 focus:outline-none");
	playerInp1.placeholder = "Player 1";
	
	const playerNamesDiv2 = createDiv("space-y-2");
	const playerNamesLabel2 = createLab("Player 2", "player2", "block text-neonBlue font-bold mb-2");
	const playerInp2 = createInp("player2", "text", "player2", "player2", "neon-box-blue text-neonBlue w-full py-2 px-3 mb-1 focus:outline-none");
	playerInp2.placeholder = "Player 2";
	
	const playerNamesDiv3 = createDiv("space-y-2");
	const playerNamesLabel3 = createLab("Player 3", "player3", "block text-neonBlue font-bold mb-2");
	const playerInp3 = createInp("player3", "text", "player3", "player3", "neon-box-blue text-neonBlue w-full py-2 px-3 mb-1 focus:outline-none");
	playerInp3.placeholder = "Player 3";
	
	const playerNamesDiv4 = createDiv("space-y-2");
	const playerNamesLabel4 = createLab("Player 4 (empty if AI)", "player4", "block text-neonBlue font-bold mb-2");
	const playerInp4 = createInp("player4", "text", "player4", "player4", "neon-box-blue text-neonBlue w-full py-2 px-3 mb-1 focus:outline-none");
	playerInp4.placeholder = "Player 4";

	const errorDiv = createDiv("text-red-500 animate-fade-in text-xs italic hidden mb-4");
	errorDiv.id = "tournamentError";
	
	//
	const submitDiv = createDiv("pt-4");
	const submitButton = createBut("Submit Configuration", "", "btn-neon-pink2 w-full hover-underline-animation mb-4");
	submitButton.type = "submit";
	
	//
	boardLayoutLabel.appendChild(boardLayoutSelect);
	boardLayoutDiv.appendChild(boardLayoutLabel);
	
	targetScoreLabel.appendChild(targetScoreInput);
	targetScoreDiv.appendChild(targetScoreLabel);
	
	matchTimeLabel.appendChild(matchTimeInput);
	matchTimeDiv.appendChild(matchTimeLabel);
	
	allowTiesLabel.appendChild(allowTiesInput);
	allowTiesLabel.appendChild(allowTiesSpan);
	allowTiesDiv.appendChild(allowTiesLabel);
	
	amaiaRefreshRateLabel.appendChild(amaiaRefreshRateSelect);
	amaiaRefreshRateDiv.appendChild(amaiaRefreshRateLabel);
	
	amaiaImpactPausePredictLabel.appendChild(amaiaImpactPausePredictSelect);
	amaiaImpactPausePredictDiv.appendChild(amaiaImpactPausePredictLabel);
	
	spinModeLabel.appendChild(spinModeSelect);
	spinModeDiv.appendChild(spinModeLabel);
	
	puckIncrementalSpeedLabel.appendChild(puckIncrementalSpeedSelect);
	puckIncrementalSpeedDiv.appendChild(puckIncrementalSpeedLabel);
	
	stickyCeilingLabel.appendChild(stickyCeilingInput);
	stickyCeilingLabel.appendChild(stickyCeilingSpan);
	stickyCeilingDiv.appendChild(stickyCeilingLabel);
	
	cameraModeLabel.appendChild(cameraModeSelect);
	cameraModeDiv.appendChild(cameraModeLabel);
	
	simpleVisualsLabel.appendChild(simpleVisualsInput);
	simpleVisualsLabel.appendChild(simpleVisualsSpan);
	simpleVisualsDiv.appendChild(simpleVisualsLabel);
	
	//
	playerNamesLabel1.appendChild(playerInp1);
	playerNamesDiv1.appendChild(playerNamesLabel1);
	
	playerNamesLabel2.appendChild(playerInp2);
	playerNamesDiv2.appendChild(playerNamesLabel2);
	
	playerNamesLabel3.appendChild(playerInp3);
	playerNamesDiv3.appendChild(playerNamesLabel3);
	
	playerNamesLabel4.appendChild(playerInp4);
	playerNamesDiv4.appendChild(playerNamesLabel4);
	
	submitDiv.appendChild(errorDiv);
	submitDiv.appendChild(submitButton);
	
	//
	form.appendChild(title);
	form.appendChild(playerNamesDiv1);
	form.appendChild(playerNamesDiv2);
	form.appendChild(playerNamesDiv3);
	form.appendChild(playerNamesDiv4);
	form.appendChild(boardLayoutDiv);
	form.appendChild(targetScoreDiv);
	form.appendChild(matchTimeDiv);
	form.appendChild(spinModeDiv);
	form.appendChild(puckIncrementalSpeedDiv);
	form.appendChild(stickyCeilingDiv);
	form.appendChild(cameraModeDiv);
	form.appendChild(simpleVisualsDiv);
	form.appendChild(submitDiv);
	
	container.appendChild(form);
	main.appendChild(container);
	body.appendChild(main);
}

export function extractTournamentMatchSettings(user_info: User)
{
	const form = document.getElementById("match-settings-form") as HTMLFormElement | null;
	if (!form) return;

	form.addEventListener("submit", (e) => {
		e.preventDefault();
		const data = new FormData(form);

		const getNum = (key: string): number => Number(data.get(key));
		const getBool = (key: string): boolean => data.get(key) !== null;
		const getString = (key: string): string => (data.get(key) || "").toString();

		const ruleset = new MatchRuleset(
			getNum("boardLayout") as BoardLayouts,
			getNum("targetScore"),
			getNum("matchTime"),
			getBool("allowTies"),
			getNum("amaiaRefreshRate") as AmaiaRefreshRateOptions,
			getNum("amaiaImpactPausePredict") as AmaiaPredictDuringImpactPauseOptions,
			getNum("spinMode") as SpinModes,
			getNum("puckIncrementalSpeed") as PuckIncrementalSpeedOptions,
			getBool("stickyCeiling"),
			getNum("cameraMode") as CameraModes,
			getBool("simpleVisuals"),
		);

		const isValidName = (name: string): boolean => name.length >= 2 && name.length <= 16;

		let tournamentData: Tournament = {};
		
		document.getElementById("tournamentError")?.classList.add("hidden");

		const p1 = getString("player1");
		if (!isValidName(p1)) {
			showError("tournamentError", "Player names must be between 2 and 16 characters");
			return;
		}
		tournamentData.player1 = p1;
		tournamentData.player1_score = "n/a";

		//
		const p2 = getString("player2");
		if (!isValidName(p2)) {
			showError("tournamentError", "Player names must be between 2 and 16 characters");
			return;
		}
		tournamentData.player2 = p2;
		tournamentData.player2_score = "n/a";

		//
		const p3 = getString("player3");
		if (!isValidName(p3)) {
			showError("tournamentError", "Player names must be between 2 and 16 characters");
			return;
		}
		tournamentData.player3 = p3;
		tournamentData.player3_score = "n/a";

		//
		let p4 = getString("player4");
		if (p4 === "") {
			p4 = "amaia";
		}
		tournamentData.player4 = p4;
		tournamentData.player4_score = "n/a";


		tournamentData.winner1 = "Pending";
		tournamentData.winner1_score = "n/a";
		tournamentData.game_1 = "n/a";
		
		tournamentData.winner2 = "Pending";
		tournamentData.winner2_score = "n/a";
		tournamentData.game_2 = "n/a";

		tournamentData.finalWinner = "Pending";
		tournamentData.game_3 = "n/a";

		// //console.log("Match Ruleset:", ruleset);
		navTo("tournament", user_info.id, ruleset, null, tournamentData);
	});
}
