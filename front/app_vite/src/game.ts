import { navTo } from './navigation';
import { getAppElement } from './dom';

import { Engine } from "@babylonjs/core/Engines/engine.js";
import { BoardManager } from "./game/BoardManager.js";
import { MatchRuleset } from './game/MatchRuleset.js';
import { eventListeners } from './listeners';
import { Tournament, User } from './userInterface';
import { initializeSocket } from './socketEvent';

let engine: Engine = null;
let canvas: HTMLCanvasElement = null;
let manager: BoardManager = null;



export function renderGame(user_info:User, match_settings?:MatchRuleset, _player2User?:User, tournamentData?:Tournament)
{
	const appElement = getAppElement();
	if (!appElement)
		return;
	appElement.innerHTML = `
	<div class="flex justify-end space-x-4 pb-4">
		
		<div>
			<button id="profilegameBtn" class="p-1 btn-neon-blue-clip hover-line-all text-center text-sm">Profile</button>
		</div>
	</div>
	<div id="game"></div>
	`;

	initializeSocket();
	eventListeners(user_info.id);
	const profilegameBtn = document.getElementById("profilegameBtn");
	profilegameBtn?.addEventListener("click", () =>
	{
		if (manager)
			manager.stopGame();
		navTo("profile", user_info.id);
	});
	startGame(user_info, match_settings, _player2User, tournamentData);

}

export function startGame(user_info:User, _ruleset: MatchRuleset, other_user?:User, tournamentData?:Tournament)
{
	const body = document.getElementById("game");
	if (!body) return;
	
	body.innerHTML = ``;
	
	if (!canvas)
	{
		canvas = <HTMLCanvasElement>document.createElement("canvas");
		canvas.style.width = "90vw";
		canvas.style.height = "40vw";
		canvas.style.margin = "0px auto";
		canvas.id = "gameCanvas";
	}
	body.appendChild(canvas);

	if (!engine)
	{
		assert(canvas instanceof HTMLCanvasElement);
		engine = new Engine(canvas);

		function assert<T>(value: T): asserts value
		{
			if (!value)
				throw new Error("Assertion failed");
		}
	}

	if (!manager)
	{
		manager = new BoardManager(engine);
		if (manager.debugFlag)
			manager.camera.attachControl(canvas, true);

		manager.scene.onBeforeRenderObservable.add(() =>
		{
			manager.update();
		});

		engine.runRenderLoop(() =>
		{
			manager.onRender();
			manager.scene.render();
		});

		window.addEventListener("resize", function ()
		{
			engine.resize();
			manager.adjustUI();
		});

		window.addEventListener("popstate", function ()
		{
			manager.stopGame();
		});
	}

	if (_ruleset && (other_user || tournamentData))
	{
		if (tournamentData)
			manager.startTournamentGame(user_info, _ruleset, tournamentData);
		else
			manager.startSingleGame(user_info, _ruleset, other_user);
		canvas.hidden = false;
		window.scroll(0, 0);
		canvas.scrollIntoView({ behavior: "smooth" });
		canvas.focus();
	}
	else
	{
		clearGameScene();
		let errorMsg: string = "Cannot start match: ";
		if (_ruleset)
			errorMsg += "ruleset is OK but both player 2 and tournament data are null or undefined";
		else
		{
			errorMsg += "ruleset is null or undefined";
			if (other_user || tournamentData)
				errorMsg += other_user ? ", player 2 data is OK" : ", tournament data is OK";
			else
				errorMsg += " and both player 2 and tournament data are null or undefined";
		}
		console.log(errorMsg);
		navTo("profile", user_info.id);
	}
}

export function clearGameScene() : void
{
	if (canvas)
		canvas.hidden = true;
	if (manager)
		manager.stopGame();
}
