import { getAppElement } from "./dom";
import { eventListeners } from "./listeners";
import { User } from "./userInterface";
import { AmaiaPredictDuringImpactPauseOptions, AmaiaRefreshRateOptions, BoardLayouts, CameraModes, MatchRuleset, PuckIncrementalSpeedOptions, SpinModes } from "./game/MatchRuleset";
import { createBut, createDiv, createForm, createInp, createLab, createMain, createSelect, createSpan, showError } from "./cssTools";
import { navTo } from "./navigation";
import { initializeSocket } from "./socketEvent";
import { getUserByName } from "./apiCall";



export function renderSettings(user_info:User)
{
	const appElement = getAppElement();
	if (!appElement)
		return;
	appElement.innerHTML = "";
	appElement.innerHTML = `
	<div class="flex justify-end space-x-4 pb-4">
		<div>
			<button id="profileBtn" class=" p-1 btn-neon-blue-clip hover-line-all text-center text-sm ">Profile</button>
		</div>
	</div>
	<div class="flex justify-center">
    	<div id="expandMatchSettings" class="text-center">Expand Match Settings</div>
	</div>
	`;

	initializeSocket();
	createMatchSettings("expandMatchSettings");
	extractMatchSettings(user_info);
	eventListeners(user_info.id);
	
}




export function createMatchSettings(name: string)
{
	const body = document.getElementById(name);
	if (!body) return;

	body.innerHTML = ``;
	body.className = "min-h-screen p-6";

	const main = createMain("");
	const container = createDiv("bg-gradient-border max-w-3xl mx-auto overflow-hidden p-6");
	const form = createForm("match-settings-form", "space-y-6");
	const title = createSpan("Match Settings", "", "text-neonPink text-3xl font-bold block text-center mt-2");


	///
	const boardLayoutDiv = createDiv("space-y-2");
	const boardLayoutLabel = createLab("Board Layout", "boardLayout", "block text-neonBlue font-bold mb-2 mt-4");
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
	
	///
	const targetScoreDiv = createDiv("space-y-2");
	const targetScoreLabel = createLab("Target Score (1-9)", "targetScore", "block text-neonBlue font-bold mb-2");
	const targetScoreInput = createInp("", "number", "targetScore", "targetScore", "neon-box-blue text-neonBlu w-full py-2 px-3 mb-1 focus:outline-none");
	targetScoreInput.min = "1";
	targetScoreInput.max = "9";
	targetScoreInput.value = "1";
	
	///
	const matchTimeDiv = createDiv("space-y-2");
	const matchTimeLabel = createLab("Match Time in seconds (30-600)", "matchTime", "block text-neonBlue font-bold mb-2");
	const matchTimeInput = createInp("", "number", "matchTime", "matchTime", "neon-box-blue text-neonBlu w-full py-2 px-3 mb-1 focus:outline-none");
	matchTimeInput.min = "30";
	matchTimeInput.max = "600";
	matchTimeInput.value = "60";
	
	///
	const allowTiesDiv = createDiv("space-y-2");
	const allowTiesLabel = createLab("", "allowTies", "flex items-center");
	const allowTiesInput = createInp("", "checkbox", "allowTies", "allowTies", "rounded border-neonBlue text-neonPink focus:ring-neonPink");
	const allowTiesSpan = createSpan("Allow Ties", "", "ml-2 text-sm text-neonBlue");
	
	///
	const amaiaRefreshRateDiv = createDiv("space-y-2");
	const amaiaRefreshRateLabel = createLab("Amaia Refresh Rate", "amaiaRefreshRate", "block text-neonBlue font-bold mb-2");
	const amaiaRefreshRateSelect = createSelect(
		"amaiaRefreshRate",
		"neon-box-blue text-neonBlu w-full py-2 px-3 mb-1 focus:outline-none",
		[
			{value: "0", text: "Disabled (Player 2 is human)"},
			{value: "1", text: "Slow (1s)"},
			{value: "2", text: "Medium"},
			{value: "3", text: "Fast"},
			{value: "4", text: "Constant"},
		]
	);
	(amaiaRefreshRateSelect.querySelector("option[value='0']") as HTMLOptionElement).selected = true;
	
	///
	const amaiaImpactPausePredictDiv = createDiv("space-y-2");
	const amaiaImpactPausePredictLabel = createLab("Amaia Impact Pause Predict", "amaiaImpactPausePredict", "block text-neonBlue font-bold mb-2");
	const amaiaImpactPausePredictSelect = createSelect(
		"amaiaImpactPausePredict",
		"neon-box-blue text-neonBlu w-full py-2 px-3 mb-1 focus:outline-none",
		[
			{value: "0", text: "Disabled"},
			{value: "1", text: "Enabled"},
			{value: "2", text: "Buffered"}
		]
	);
	
	///
	const spinModeDiv = createDiv("space-y-2");
	const spinModeLabel = createLab("Spin Mode", "spinMode", "block text-neonBlue font-bold mb-2");
	const spinModeSelect = createSelect(
		"spinMode",
		"neon-box-blue text-neonBlu w-full py-2 px-3 mb-1 focus:outline-none",
		[
			{value: "0", text: "Disabled (Default Pong)"},
			{value: "1", text: "Lenient"},
			{value: "2", text: "Precise"},
		]
	);
	
	///
	const puckIncrementalSpeedDiv = createDiv("space-y-2");
	const puckIncrementalSpeedLabel = createLab("Puck Incremental Speed", "puckIncrementalSpeed", "block text-neonBlue font-bold mb-2");
	const puckIncrementalSpeedSelect = createSelect(
		"puckIncrementalSpeed",
		"neon-box-blue text-neonBlu w-full py-2 px-3 mb-1 focus:outline-none",
		[
			{value: "0", text: "Disabled"},
			{value: "1", text: "Slow"},
			{value: "2", text: "Medium"},
			{value: "3", text: "Fast"}
		]
	);
	(puckIncrementalSpeedSelect.querySelector("option[value='1']") as HTMLOptionElement).selected = true;
	
	///
	const stickyCeilingDiv = createDiv("space-y-2");
	const stickyCeilingLabel = createLab("", "stickyCeiling", "flex items-center");
	const stickyCeilingInput = createInp("", "checkbox", "stickyCeiling", "stickyCeiling", "rounded border-neonBlue text-neonPink focus:ring-neonPink");
	const stickyCeilingSpan = createSpan("Sticky Ceiling", "", "ml-2 text-sm text-neonBlue");
	
	///
	const cameraModeDiv = createDiv("space-y-2");
	const cameraModeLabel = createLab("Camera Mode", "cameraMode", "block text-neonBlue font-bold mb-2");
	const cameraModeSelect = createSelect(
		"cameraMode",
		"neon-box-blue text-neonBlu w-full py-2 px-3 mb-1 focus:outline-none",
		[
			{value: "0", text: "Top"},
			{value: "1", text: "HalfTilt"},
			{value: "2", text: "FullTilt"}
		]
	);
	
	///
	const simpleVisualsDiv = createDiv("space-y-2");
	const simpleVisualsLabel = createLab("", "simpleVisuals", "flex items-center");
	const simpleVisualsInput = createInp("", "checkbox", "simpleVisuals", "simpleVisuals", "rounded border-neonBlue text-neonPink focus:ring-neonPink");
	const simpleVisualsSpan = createSpan("Simple Visuals (less intensive shaders)", "", "ml-2 text-sm text-neonBlue");

	///
	const playerNamesDiv1 = createDiv("space-y-2");
	const playerNamesLabel1 = createLab("Opponent's Name (empty if AI)", "opponent", "block text-neonBlue font-bold mb-2");
	const playerInp1 = createInp("opponent", "text", "opponent", "opponent", "neon-box-blue text-neonBlu w-full py-2 px-3 mb-1 focus:outline-none");
	playerInp1.placeholder = "Opponent";
	
	
	const errorDiv = createDiv("text-red-500 animate-fade-in text-xs italic hidden mb-4");
	errorDiv.id = "matchError";

	///
	const submitDiv = createDiv("pt-4");
	const submitButton = createBut("Submit Configuration", "", "btn-neon-pink2 w-full hover-underline-animation mb-4");
	submitButton.type = "submit";
	
	///
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
	
	///
	playerNamesLabel1.appendChild(playerInp1);
	playerNamesDiv1.appendChild(playerNamesLabel1);
	
	
	submitDiv.appendChild(submitButton);
	
	///
	form.appendChild(title);
	form.appendChild(playerNamesDiv1);
	form.appendChild(boardLayoutDiv);
	form.appendChild(targetScoreDiv);
	form.appendChild(matchTimeDiv);
	form.appendChild(allowTiesDiv);
	form.appendChild(amaiaRefreshRateDiv);
	form.appendChild(amaiaImpactPausePredictDiv);
	form.appendChild(spinModeDiv);
	form.appendChild(puckIncrementalSpeedDiv);
	form.appendChild(stickyCeilingDiv);
	form.appendChild(cameraModeDiv);
	form.appendChild(simpleVisualsDiv);
	form.appendChild(errorDiv);
	form.appendChild(submitDiv);
	
	container.appendChild(form);
	main.appendChild(container);
	body.appendChild(main);
}

export function extractMatchSettings(user_info: User)
{
	const form = document.getElementById("match-settings-form") as HTMLFormElement | null;
	if (!form) return;

	form.addEventListener("submit", async (e) => {
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
			getBool("simpleVisuals")
		);
		document.getElementById("matchError")?.classList.add("hidden");
		let player2name = getString("opponent");
		if (player2name == "" || player2name == "amaia")
		{
			player2name = "amaia";
			if (ruleset.amaiaRefreshRateOption == 0)
				ruleset.amaiaRefreshRateOption = 1;
		}
		const player2:User = await getUserByName(player2name);
		if (player2 == null || player2.id == user_info.id)
		{
			showError("matchError", "Opponent does not exist or it cannot be yourself");
			return;
		}

		navTo("game", user_info.id, ruleset, player2);
	});
}