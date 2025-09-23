import { Engine, Scene, FreeCamera, Vector2, Vector3, Color3, Color4, CreateGround, Mesh, ShaderMaterial } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock, Rectangle, Grid, Button } from "@babylonjs/gui/2D";
import { Board } from "./Board.js";
import { ColliderGraphic, BoxColliderGraphic, CylinderColliderGraphic } from "./ColliderGraphics.js";
import { GenericBoxTrigger, TriggerTypes } from "./Colliders.js";
import { FormatVector2, FormatVector3 } from "./DebugUtils.js";
import { createCustomMaterial } from "./GraphicUtils.js";
import { TrackedInputs, InputManager } from "./InputManager.js";
import { ManualResponsiveObject, ManualResponsiveRectangle, ManualResponsiveTextBlock, ManualResponsiveButton } from "./ManualResponsiveObjects.js";
import { BoardLayouts, CameraModes, MatchRuleset } from "./MatchRuleset.js";
import { MatchState } from "./MatchState.js";
import { CustomMaterialTypes } from "./MaterialData.js";
import { PlayerObject, PuckObject, BumperObject, FanSurfaceSet } from "./SceneObjects.js";
import { Tournament, User } from "../userInterface.js";
import { navTo } from "../navigation.js";
// import { Inspector } from "@babylonjs/inspector"; // mods, add an 11MB import to their website

export enum MatchStates { None, BeforeMatch, BeforePoint, DuringPoint, AfterPoint, Finished };

export class BoardManager
{
	readonly engine: Engine;
	public readonly scene: Scene;

	readonly maxDeltaTime: number = 0.05;
	readonly inputManager: InputManager;
	board: Board;
	ruleset: MatchRuleset;
	score_P1: number = 0;
	score_P2: number = 0;
	matchTimer: number;
	matchDuration: number;
	longestBounceStreak = 0;
	longestParryStreak = 0;
	currentState: MatchStates;
	stateTimer: number;
	overtimeFlag: boolean = false;

	user_P1: User = null;
	user_P2: User = null;
	tournamentData: Tournament = null;

	paused: boolean = false;
	showHitboxes: boolean = false;

	public readonly camera;
	players: PlayerObject[];
	puckObj: PuckObject;
	bumpers: BumperObject[];
	fanSurfaces: FanSurfaceSet;
	floorObj: Mesh;
	floorMat: ShaderMaterial = null;
	floorColorLerpFlag: boolean = false;
	floorColorLerp: number = 0;
	wallObjs: Mesh[];
	wallMat: ShaderMaterial = null;
	colliderGfx: ColliderGraphic[];

	P1NameText: TextBlock;
	P1ScoreText: TextBlock;
	P2NameText: TextBlock;
	P2ScoreText: TextBlock;
	matchTimerText: TextBlock;
	beforeMatchMenu: Rectangle;
	beforeMatchTopText: TextBlock;
	beforeMatchMiddleText: TextBlock;
	beforeMatchBottomText: TextBlock;
	matchFinishedMenu: Rectangle;
	matchFinishedTopText: TextBlock;
	matchFinishedMiddleText: TextBlock;
	matchFinishedBottomText: TextBlock;
	
	// Manual Responsive Stuff
	advancedTextureUI: AdvancedDynamicTexture;
	manualResponsiveObjects: ManualResponsiveObject[];

	boardState: string;
	debugInfoText: TextBlock;
	public readonly debugFlag: boolean = false;

	public constructor(_engine: Engine)
	{
		this.engine = _engine;
		this.scene = new Scene(this.engine);
		this.scene.clearColor = new Color4(0, 0, 0, 1);
		this.inputManager = new InputManager(this.engine);
		this.currentState = MatchStates.None;
		this.stateTimer = 0;

		this.camera = new FreeCamera("camera", Vector3.Zero(), this.scene);

		this.players = [];
		this.puckObj = null;
		this.floorObj = CreateGround("ground", { width: 24, height: 12 });
		this.floorObj.position = new Vector3(0, -0.05, 0);
		this.wallObjs = new Array<Mesh>(2);
		for (let i = 0; i < 2; i++)
		{
			let wallObj = CreateGround("wall", { width: 24, height: 2 });
			wallObj.position = new Vector3(0, 1, 6 * (i == 0 ? 1 : -1));
			wallObj.rotation = new Vector3(-90, i == 0 ? 0 : 180, 0).scale(Math.PI / 180);
			this.wallObjs[i] = wallObj;
		}
		this.fanSurfaces = null;
		this.colliderGfx = [];
		this.bumpers = [];

		this.advancedTextureUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
		this.manualResponsiveObjects = [];

		// Top UI Section
		{
			const topRect = new Rectangle("Top UI");
			topRect.width = "96%";
			topRect.height = "20%";
			topRect.color = "#00000000";
			topRect.background = "#00000000";
			topRect.setPadding("2%", "4%", "2%", "4%");
			topRect.horizontalAlignment = 2;
			topRect.verticalAlignment = 0;
			this.advancedTextureUI.addControl(topRect);

			for (let i = 0; i < 2; i++)
			{
				const playerColor: string = i == 0 ? "#1999FFFF" : "#FF5076FF";
				const rect = new Rectangle();
				rect.width = "15%";
				rect.height = "100%";
				rect.cornerRadius = 10;
				rect.color = playerColor;
				rect.thickness = 4;
				rect.background = "#20202080";
				rect.descendantsOnlyPadding = true;
				rect.setPadding("5%", 0, "5%", 0);
				rect.horizontalAlignment = i;
				rect.verticalAlignment = 2;
				topRect.addControl(rect);
				this.manualResponsiveObjects.push(new ManualResponsiveRectangle(rect));

				const contentGrid = new Grid();
				contentGrid.width = "80%";
				contentGrid.height = "100%";
				for (let j = 0; j < 2; j++)
					contentGrid.addRowDefinition(0.5);
				rect.addControl(contentGrid);
				
				const rect_name_border = new Rectangle();
				rect_name_border.width = "100%";
				rect_name_border.height = "80%";
				rect_name_border.cornerRadius = 24;
				rect_name_border.color = "white";
				rect_name_border.thickness = 4;
				rect_name_border.background = playerColor;
				rect_name_border.verticalAlignment = 2;
				contentGrid.addControl(rect_name_border, 0, 0);
				this.manualResponsiveObjects.push(new ManualResponsiveRectangle(rect_name_border));
				
				const nameText: TextBlock = new TextBlock();
				nameText.color = "white";
				nameText.fontSize = 16;
				nameText.outlineColor = "black";
				nameText.outlineWidth = 3;
				nameText.text = "[NAME]";
				rect_name_border.addControl(nameText);
				this.manualResponsiveObjects.push(new ManualResponsiveTextBlock(nameText));
				
				const scoreText: TextBlock = new TextBlock();
				scoreText.color = "white";
				scoreText.fontSize = 28;
				scoreText.outlineColor = "black";
				scoreText.outlineWidth = 5;
				scoreText.text = "0 / ?";
				scoreText.textVerticalAlignment = 2;
				contentGrid.addControl(scoreText, 1, 0);
				this.manualResponsiveObjects.push(new ManualResponsiveTextBlock(scoreText));

				if (i == 0)
				{
					this.P1NameText = nameText;
					this.P1ScoreText = scoreText;
				}
				else
				{
					this.P2NameText = nameText;
					this.P2ScoreText = scoreText;
				}
			}

			const rect = new Rectangle();
			rect.width = "10%";
			rect.height = "50%";
			rect.cornerRadius = 10;
			rect.color = "#D0D0D0FF";
			rect.thickness = 4;
			rect.background = "#20202080";
			rect.horizontalAlignment = 2;
			rect.verticalAlignment = 2;
			topRect.addControl(rect);
			this.manualResponsiveObjects.push(new ManualResponsiveRectangle(rect));

			this.matchTimerText = new TextBlock();
			this.matchTimerText.color = "white";
			this.matchTimerText.fontSize = 24;
			this.matchTimerText.outlineColor = "black";
			this.matchTimerText.outlineWidth = 5;
			this.matchTimerText.text = "--.-";
			rect.addControl(this.matchTimerText);
			this.manualResponsiveObjects.push(new ManualResponsiveTextBlock(this.matchTimerText));
		}

		// Debug Data Text Wall
		this.debugInfoText = new TextBlock("debugger? i barely know er!");
		this.debugInfoText.color = "white";
		this.debugInfoText.fontSize = 24;
		this.debugInfoText.outlineColor = "black";
		this.debugInfoText.outlineWidth = 5;
		this.advancedTextureUI.addControl(this.debugInfoText);
		this.debugInfoText.isVisible = this.debugFlag;
		this.manualResponsiveObjects.push(new ManualResponsiveTextBlock(this.debugInfoText));

		// Bottom UI Section (On-Screen Controls)
		{
			const bottomRect = new Rectangle("Virtual Controls");
			bottomRect.width = "96%";
			bottomRect.height = "40%";
			bottomRect.color = "#00000000";
			bottomRect.background = "#00000000";
			bottomRect.setPadding("5%", "5%", "5%", "5%");
			bottomRect.horizontalAlignment = 2;
			bottomRect.verticalAlignment = 1;
			this.advancedTextureUI.addControl(bottomRect);
			bottomRect.isVisible = this.inputManager.hasTouchScreen;
			this.manualResponsiveObjects.push(new ManualResponsiveRectangle(bottomRect));

			const virtualInputs = this.inputManager.virtualInputs;
			for (let i = 0; i < 2; i++)
			{
				const rect = new Rectangle("Player " + (i + 1).toString() + " Controls");
				rect.width = "20%";
				rect.height = "100%";
				rect.thickness = 0;
				rect.background = "#00000000";
				rect.descendantsOnlyPadding = true;
				rect.setPadding("2%", "0", "2%", "0");
				rect.horizontalAlignment = i;
				rect.verticalAlignment = 2;
				bottomRect.addControl(rect);
				this.manualResponsiveObjects.push(new ManualResponsiveRectangle(rect));

				const inputKeys =
				[
					[ TrackedInputs.P1_Left, TrackedInputs.P1_Right, TrackedInputs.P1_Up , TrackedInputs.P1_Down ],
					[ TrackedInputs.P2_Left, TrackedInputs.P2_Right, TrackedInputs.P2_Up , TrackedInputs.P2_Down ]
				][i];
				for (let j = 0; j < 4; j++)
				{
					const button = Button.CreateSimpleButton(TrackedInputs[inputKeys[j]], [ "<", ">", "^", "v" ][j]);
					button.width = "30%";
					button.height = [ "60%", "60%", "45%", "45%" ][j];
					button.cornerRadius = 24;
					button.thickness = 4;
					button.children[0].color = "#FFFFFFFF";
					button.children[0].fontSize = 42;
					button.color = "#FFFFFFFF";
					button.background = [ "#1999FFFF", "#FF5076FF" ][i];
					button.horizontalAlignment = [ 0, 1, 2, 2 ][j];
					button.verticalAlignment = [ 2, 2, 0, 1 ][j];
					button.onPointerDownObservable.add(() => virtualInputs[inputKeys[j]].setPressedFlag());
					button.onPointerUpObservable.add(() => virtualInputs[inputKeys[j]].resetPressedFlag());
					rect.addControl(button);
					this.manualResponsiveObjects.push(new ManualResponsiveButton(button));
				}
			}
		}

		// Before Match UI Section
		{
			this.beforeMatchMenu = new Rectangle("Before The Story - Deltarune OST");
			this.beforeMatchMenu.width = "100%";
			this.beforeMatchMenu.height = "100%";
			this.beforeMatchMenu.thickness = 0;
			this.beforeMatchMenu.background = "#20202080";
			this.advancedTextureUI.addControl(this.beforeMatchMenu);

			const beforeMatchMenuRect = new Rectangle();
			beforeMatchMenuRect.width = "50%";
			beforeMatchMenuRect.height = "60%";
			beforeMatchMenuRect.cornerRadius = 10;
			beforeMatchMenuRect.color = "#FFFFFFFF";
			beforeMatchMenuRect.thickness = 4;
			beforeMatchMenuRect.background = "#20202080";
			beforeMatchMenuRect.horizontalAlignment = 2;
			beforeMatchMenuRect.verticalAlignment = 2;
			beforeMatchMenuRect.descendantsOnlyPadding = true;
			beforeMatchMenuRect.setPadding("5%", "5%", "5%", "5%");
			this.beforeMatchMenu.addControl(beforeMatchMenuRect);
			this.manualResponsiveObjects.push(new ManualResponsiveRectangle(beforeMatchMenuRect));

			const contentGrid = new Grid();
			contentGrid.width = "100%";
			contentGrid.height = "100%";
			for (let i = 0; i < 4; i++)
				contentGrid.addRowDefinition(0.25);
			beforeMatchMenuRect.addControl(contentGrid);

			for (let i = 0; i < 3; i++)
			{
				const textBlock = new TextBlock();
				textBlock.color = "white";
				textBlock.fontSize = 36;
				textBlock.outlineColor = "black";
				textBlock.outlineWidth = 5;
				textBlock.textVerticalAlignment = 2;
				textBlock.text = "";
				contentGrid.addControl(textBlock, i, 0);
				this.manualResponsiveObjects.push(new ManualResponsiveTextBlock(textBlock));

				if (i == 0)
					this.beforeMatchTopText = textBlock;
				else if (i == 1)
					this.beforeMatchMiddleText = textBlock;
				else
					this.beforeMatchBottomText = textBlock;
			}
			
			const button = Button.CreateSimpleButton("button", "Start!");
			button.width = "25%";
			button.height = "50%";
			button.cornerRadius = 28;
			button.thickness = 4;
			button.children[0].color = "#000000FF";
			button.children[0].fontSize = 24;
			button.color = "#FFFFFFFF";
			button.background = "#FFFFFFFF";
			button.horizontalAlignment = 2;
			button.verticalAlignment = 1;
			const manager = this;
			button.onPointerClickObservable.add(function ()
			{
				manager.beforeMatchMenu.isVisible = false;
				manager.currentState = MatchStates.BeforePoint;
				manager.stateTimer = 0;
				manager.boardState = JSON.stringify(new MatchState(manager));
			});
			contentGrid.addControl(button, 3, 0);
			this.manualResponsiveObjects.push(new ManualResponsiveButton(button));
		}

		// Match Finished UI Section
		{
			this.matchFinishedMenu = new Rectangle("where the funny text goes");
			this.matchFinishedMenu.width = "100%";
			this.matchFinishedMenu.height = "100%";
			this.matchFinishedMenu.thickness = 0;
			this.matchFinishedMenu.background = "#20202080";
			this.advancedTextureUI.addControl(this.matchFinishedMenu);

			const matchFinishedMenuRect = new Rectangle();
			matchFinishedMenuRect.width = "50%";
			matchFinishedMenuRect.height = "60%";
			matchFinishedMenuRect.cornerRadius = 10;
			matchFinishedMenuRect.color = "#FFFFFFFF";
			matchFinishedMenuRect.thickness = 4;
			matchFinishedMenuRect.background = "#20202080";
			matchFinishedMenuRect.horizontalAlignment = 2;
			matchFinishedMenuRect.verticalAlignment = 2;
			matchFinishedMenuRect.descendantsOnlyPadding = true;
			matchFinishedMenuRect.setPadding("5%", "5%", "5%", "5%");
			this.matchFinishedMenu.addControl(matchFinishedMenuRect);
			this.manualResponsiveObjects.push(new ManualResponsiveRectangle(matchFinishedMenuRect));

			const contentGrid = new Grid();
			contentGrid.width = "100%";
			contentGrid.height = "100%";
			for (let i = 0; i < 4; i++)
				contentGrid.addRowDefinition(0.25);
			matchFinishedMenuRect.addControl(contentGrid);

			for (let i = 0; i < 3; i++)
			{
				const textBlock = new TextBlock();
				textBlock.color = "white";
				textBlock.fontSize = 36;
				textBlock.outlineColor = "black";
				textBlock.outlineWidth = 5;
				if (i == 1)
				{
					textBlock.textWrapping = 3;
					textBlock.lineSpacing = 8;
				}
				textBlock.textVerticalAlignment = 2;
				textBlock.text = "";
				contentGrid.addControl(textBlock, i, 0);
				this.manualResponsiveObjects.push(new ManualResponsiveTextBlock(textBlock));

				if (i == 0)
					this.matchFinishedTopText = textBlock;
				else if (i == 1)
					this.matchFinishedMiddleText = textBlock;
				else
					this.matchFinishedBottomText = textBlock;
			}

			const button = Button.CreateSimpleButton("button", "Return");
			button.width = "25%";
			button.height = "50%";
			button.cornerRadius = 28;
			button.thickness = 4;
			button.children[0].color = "#000000FF";
			button.children[0].fontSize = 24;
			button.color = "#FFFFFFFF";
			button.background = "#FFFFFFFF";
			button.horizontalAlignment = 2;
			button.verticalAlignment = 1;

			const manager = this;
			button.onPointerClickObservable.add(function () {
				if (manager.tournamentData)
					navTo("tournament", manager.user_P1.id, manager.ruleset, null, manager.tournamentData);
				else
					navTo("profile", manager.user_P1.id);
			});
			contentGrid.addControl(button, 3, 0);
			this.manualResponsiveObjects.push(new ManualResponsiveButton(button));
		}
	}

	shortenUsername(_s: string) : string
	{
		const charLimit: number = 10;
		return _s.length > charLimit + 3 ? _s.substring(0, charLimit) + "..." : _s;
	}

	public startSingleGame(_player1User: User, _ruleset: MatchRuleset, _player2User?: User)
	{
		this.user_P1 = _player1User;
		this.user_P2 = _player2User;
		this.tournamentData = null;
		this.P1NameText.text = this.shortenUsername(this.user_P1.username);
		this.P2NameText.text = this.shortenUsername(this.user_P2.username);
		this.startGame(_ruleset);
	}

	public startTournamentGame(_player1User: User, _ruleset: MatchRuleset, _tournamentData: Tournament)
	{
		this.user_P1 = _player1User;
		this.user_P2 = null;
		this.tournamentData = _tournamentData;
		if (_tournamentData.game_1 == "playing")
		{
			this.P1NameText.text = this.shortenUsername(_tournamentData.player1);
			this.P2NameText.text = this.shortenUsername(_tournamentData.player2);
		}
		else if (_tournamentData.game_2 == "playing")
		{
			this.P1NameText.text = this.shortenUsername(_tournamentData.player3);
			this.P2NameText.text = this.shortenUsername(_tournamentData.player4);
		}
		else if (_tournamentData.game_3 == "playing")
		{
			this.P1NameText.text = this.shortenUsername(_tournamentData.winner1);
			this.P2NameText.text = this.shortenUsername(_tournamentData.winner2);
		}
		else // just in case
		{
			this.P1NameText.text = "void [SP] (42)";
			this.P2NameText.text = "null [SP] (42)";
		}
		this.startGame(_ruleset);
	}

	startGame(_ruleset: MatchRuleset)
	{
		this.clearScene(); // just in case

		this.board = new Board(_ruleset, this.inputManager);
		this.board.reset();
		this.ruleset = _ruleset;
		this.score_P1 = 0;
		this.score_P2 = 0;
		this.matchTimer = _ruleset.matchTime;
		this.matchDuration = 0;
		this.currentState = MatchStates.BeforeMatch;
		this.stateTimer = 0;
		this.overtimeFlag = false;
		this.paused = false;
		this.matchFinishedMenu.isVisible = false;

		let camPos: Vector3 = Vector3.Zero();
		let camRot: Vector3 = Vector3.Zero();
		switch (_ruleset.cameraMode)
		{
			case CameraModes.Top:
				camPos = new Vector3(0, 17.5, -0.25);
				camRot = new Vector3(89, 0, 0);
				break;
			case CameraModes.HalfTilt:
				camPos = new Vector3(0, 16, -4.5);
				camRot = new Vector3(75, 0, 0);
				break;
			case CameraModes.FullTilt:
				camPos = new Vector3(0, 12.5, -12.5);
				camRot = new Vector3(45, 0, 0);
				break;
		}
		this.camera.position = camPos;
		this.camera.rotation = camRot.scale(Math.PI / 180);

		for (const player of this.board.players)
			this.players.push(new PlayerObject(player, this.scene, this.ruleset.simpleVFX ? null : this.camera.position, this.debugFlag));

		this.puckObj = new PuckObject(this.board.puck, this.scene);

		if (_ruleset.simpleVFX)
			this.floorMat = createCustomMaterial(this.scene, CustomMaterialTypes.BoardFloorSimple);
		else
		{
			this.floorMat = createCustomMaterial(this.scene, CustomMaterialTypes.BoardFloor);
			let innerColor: Color4 = new Color4(0.08, 0.08, 0.1, 1);
			let outerColor: Color4 = new Color4(0.08, 0.08, 0.1, 1);
			let shadowColor: Color4 = new Color4(0.5, 0.5, 0.6, 0.6);
			switch (_ruleset.boardLayout)
			{
				case BoardLayouts.Default:
					innerColor = new Color4(0.2, 0.2, 0.25, 1);
					outerColor = new Color4(0.1, 0.1, 0.125, 1);
					shadowColor = new Color4(0, 0, 0, 0.6);
					break;
				case BoardLayouts.DiamondPlaza:
					innerColor = new Color4(1, 0.8, 0.4, 1);
					outerColor = new Color4(1, 0.5, 0.75, 1);
					shadowColor = new Color4(0.25, 0.2, 0, 0.6);
					break;
				case BoardLayouts.SnowedLake:
					innerColor = new Color4(0.4, 0.9, 1, 1);
					outerColor = new Color4(0, 0.625, 1, 1);
					shadowColor = new Color4(0, 0.2, 0.25, 0.6);
					break;
				case BoardLayouts.JungleGym:
					innerColor = new Color4(0.1, 0.9, 0.6, 1);
					outerColor = new Color4(0.2, 0.75, 0.6, 1);
					shadowColor = new Color4(0, 0.25, 0.2, 0.6);
					break;
				case BoardLayouts.EtherealMeadows:
					// innerColor = new Color4(0.25, 0.9, 0.6, 1);
					// outerColor = new Color4(0.2, 0.75, 1, 1);
					innerColor = new Color4(0.25, 0.75, 1, 1);
					outerColor = new Color4(0.75, 0.6, 1, 1);
					shadowColor = new Color4(0.2, 0, 0.25, 0.6);
					break;
			}
			this.floorMat.setColor4("floorInnerColor", innerColor);
			this.floorMat.setColor4("floorOuterColor", outerColor);
			this.floorMat.setColor4("puckShadowColor", shadowColor);
		}
		this.floorObj.setEnabled(true);
		this.floorObj.material = this.floorMat;
		this.floorColorLerpFlag = this.ruleset.simpleVFX && this.ruleset.boardLayout == BoardLayouts.EtherealMeadows;

		this.wallMat = createCustomMaterial(this.scene, this.ruleset.simpleVFX ? CustomMaterialTypes.FenceWallSimple : CustomMaterialTypes.FenceWall);
		let wallColor: Color4 = new Color4(0.4, 0.4, 0.5, 1);
		if (!this.ruleset.simpleVFX)
		{
			switch (this.ruleset.boardLayout)
			{
				case BoardLayouts.Default:
					wallColor = new Color4(0.6, 0.6, 0.75, 1);
					break;
				case BoardLayouts.DiamondPlaza:
					wallColor = new Color4(1, 0.75, 0.9, 1);
					break;
				case BoardLayouts.SnowedLake:
					wallColor = new Color4(0.1, 0.4, 0.9, 1);
					break;
				case BoardLayouts.JungleGym:
					wallColor = new Color4(0.2, 0.8, 0.4, 1);
					break;
				case BoardLayouts.EtherealMeadows:
					wallColor = new Color4(0.75, 0.6, 1, 1);
					break;
			}
		}
		this.wallMat.setColor4("color", wallColor);
		for (const wallObj of this.wallObjs)
		{
			wallObj.setEnabled(true);
			wallObj.material = this.wallMat;
		}

		const fanTriggers: GenericBoxTrigger[] = this.board.triggers.filter((trigger) => trigger.getTriggerType() == TriggerTypes.FloorFan) as GenericBoxTrigger[];
		this.fanSurfaces = fanTriggers.length > 0 ? new FanSurfaceSet(this.scene, fanTriggers, _ruleset.simpleVFX) : null;

		if (this.debugFlag)
			for (const box of this.board.boxes)
				this.colliderGfx.push(new BoxColliderGraphic(this.scene, Color3.Green(), box));

		for (const bumper of this.board.bumpers)
		{
			this.bumpers.push(new BumperObject(bumper, this.scene, this.camera.position));
			if (this.debugFlag)
				this.colliderGfx.push(new CylinderColliderGraphic(this.scene, Color3.Yellow(), bumper.cylinder));
		}

		if (this.debugFlag)
			for (const trigger of this.board.getTriggers().filter((trigger) => trigger.getTriggerType() != TriggerTypes.Player))
				this.colliderGfx.push(new BoxColliderGraphic(this.scene, Color3.Yellow(), (trigger as GenericBoxTrigger).box));

		for (const gfx of this.colliderGfx)
			gfx.updatePoints();

		if (this.debugFlag)
			this.boardState = JSON.stringify(new MatchState(this));

		this.matchTimerText.color = "white";
		if (Math.random() < 0.25)
		{
			const special: string[] =
			[
				"Heaven Or Hell",
				"The Wheel Of Fate Is Turning...",
				"A Brawl Is Surely Brewing...",
				"In Opposite Corners Of The Ring...",
				"- The Ultimate Showdown -",
				"- Duel Of Destinies -",
				"One Must Fall, One Will Remain..."
			];
			this.beforeMatchTopText.text = special[Math.floor(Math.random() * special.length)];
		}
		else if (Math.random() < 0.1)
			this.beforeMatchTopText.text = "Trans Rights! :3 (Say it back)";
		else
			this.beforeMatchTopText.text = "Up Next:";
		this.beforeMatchMiddleText.text = "/ " + this.P1NameText.text + " /  VS  / " + this.P2NameText.text + " /";
		if (Math.random() < 0.25)
		{
			const special: string[] =
			[
				"Ready To Rumble?",
				"Let The Games Begin!",
				"Time To Be A Big Shot!",
				"Get Into The Wave!",
				"Shall We Dance?",
				"Let's Make History!",
				"Blood Will Be Drawn...",
				"No Flesh Shall Be Spared"
			];
			this.beforeMatchBottomText.text = special[Math.floor(Math.random() * special.length)];
		}
		else
			this.beforeMatchBottomText.text = "Ready?";
		this.beforeMatchMenu.isVisible = true;
		this.adjustUI();

		if (this.debugFlag)
		{
			console.log("Objects: ", this.scene.rootNodes.length);
			console.log("Materials: ", this.scene.materials.length);
			console.log("Textures: ", this.scene.textures.length);
			// Inspector.Show(this.scene, { embedMode: true });
		}
	}

	public stopGame() : void
	{
		this.currentState = MatchStates.None;
		this.stateTimer = 0;
		this.clearScene();
	}

	clearScene() : void
	{
		if (this.board)
		{
			this.board.onDispose();
			this.board = null;
		}

		this.floorObj.setEnabled(false);
		if (this.floorMat)
		{
			this.floorMat.dispose(false, true, false); // Dispose Of Textures As Well
			this.floorMat = null;
		}

		for (const wall of this.wallObjs)
			wall.setEnabled(false);
		if (this.wallMat)
		{
			this.wallMat.dispose(false, true, false); // Dispose Of Textures As Well
			this.wallMat = null;
		}

		for (const player of this.players)
			player.dispose();
		this.players = [];

		if (this.puckObj)
		{
			this.puckObj.dispose();
			this.puckObj = null;
		}

		if (this.fanSurfaces)
		{
			this.fanSurfaces.dispose();
			this.fanSurfaces = null;
		}

		for (const bumper of this.bumpers)
			bumper.dispose();
		this.bumpers = [];

		for (const gfx of this.colliderGfx)
			gfx.dispose();
		this.colliderGfx = [];
	}

	public update() : void
	{
		if (this.currentState == MatchStates.None)
			return;
		this.inputManager.update(this.engine.getDeltaTime());
		if (this.debugFlag && this.inputManager.getInput(TrackedInputs.SaveState).isJustPressed())
		{
			this.boardState = JSON.stringify(new MatchState(this));
			console.log("Saved State: ", this.boardState);
		}
		if (this.debugFlag && this.inputManager.getInput(TrackedInputs.LoadState).isJustPressed())
			this.omegaFlowey(JSON.parse(this.boardState));
		if (this.debugFlag && this.inputManager.getInput(TrackedInputs.HitboxGraphicsToggle).isJustPressed())
		{
			this.showHitboxes = !this.showHitboxes;
			for (const player of this.players)
				player.setHitboxGraphicsEnabled(this.showHitboxes);
			if (this.fanSurfaces)
				this.fanSurfaces.setHitboxGraphicsEnabled(this.showHitboxes);
			for (const gfx of this.colliderGfx)
				gfx.setEnabled(this.showHitboxes);
		}
		const singleFrame: boolean = this.debugFlag && this.inputManager.getInput(TrackedInputs.FrameAdvance).isJustPressed();
		const singleFrameDt: number = 0.01;
		if (this.debugFlag && this.inputManager.getInput(TrackedInputs.Pause).isJustPressed())
			this.paused = !this.paused;
		if (singleFrame)
			this.paused = false;
		if (!this.paused)
		{
			const dt = singleFrame ? singleFrameDt : Math.min(this.maxDeltaTime, this.engine.getDeltaTime() * 0.001);
			switch (this.currentState)
			{
				case MatchStates.BeforePoint:
					this.stateTimer += dt;
					if (this.score_P1 > 0 || this.score_P2 > 0)
						this.puckObj.setWhiteFade((0.2 - this.stateTimer) * 5);
					if (this.stateTimer >= 0.75)
					{
						this.currentState = MatchStates.DuringPoint;
						this.stateTimer -= 0.75;
						this.board.setInitialPuckDir(this.ruleset.boardLayout);
					}
					break;
				case MatchStates.DuringPoint:
					this.board.update(dt, this.overtimeFlag);
					this.longestBounceStreak = Math.max(this.longestBounceStreak, this.board.puck.bounceChain);
					this.longestParryStreak = Math.max(this.longestParryStreak, this.board.puck.parryChain);
					if (this.board.puck.strongBouncePlayerIndex == -1)
					{
						if (this.matchTimer > 0)
							this.matchTimer -= dt;
						this.matchDuration += dt;
						this.puckObj.onUpdate(dt);
					}
					else
					{
						this.puckObj.onUpdate(dt, Math.sign(this.board.puck.dir.y) + 1 + (this.board.puck.dir.x < 0 ? 3 : 0));
						this.puckObj.toggleWhiteFlash(true);
						this.players[this.board.puck.strongBouncePlayerIndex].toggleWhiteFlash(true);
					}
					if (!this.board.puck.isWithinBounds)
					{
						if (this.board.puck.pos.x > 0)
							this.score_P1++;
						else
							this.score_P2++;
						this.currentState = MatchStates.AfterPoint;
						this.stateTimer = 0;
						this.puckObj.toggleWhiteFlash(false);
						for (const playerObj of this.players)
							playerObj.toggleWhiteFlash(false);
					}
					else if (this.matchTimer <= 0)
					{
						if (this.score_P1 != this.score_P2 || this.ruleset.allowTies)
							this.onMatchFinished();
						else if (this.overtimeFlag)
						{
							if (Math.random() < 0.5)
								this.score_P1++;
							else
								this.score_P2++;
							this.onMatchFinished();
						}
						else
						{
							this.overtimeFlag = true;
							this.matchTimer += 30;
						}
					}
					break;
				case MatchStates.AfterPoint:
					this.stateTimer += dt;
					this.puckObj.setWhiteFade((0.2 - this.stateTimer) * 5);
					if (this.stateTimer >= 0.75)
					{
						if (this.score_P1 < this.ruleset.targetScore && this.score_P2 < this.ruleset.targetScore && this.matchTimer > 0)
						{
							this.board.reset();
							this.currentState = MatchStates.BeforePoint;
							this.puckObj.setWhiteFade(1);
						}
						else
							this.onMatchFinished();
						this.stateTimer -= 0.75;
					}
					break;
			}
			if (this.floorColorLerpFlag)
			{
				this.floorColorLerp += 0.4 * dt;
				this.floorColorLerp %= 2;
			}
			for (const playerObj of this.players)
				playerObj.onUpdate(dt);
			if (this.fanSurfaces)
				this.fanSurfaces.onUpdate(dt);
		}
		if (singleFrame)
			this.paused = true;
	}

	updatePuckShadow(_pos: Vector2, _radius: number) : void
	{
		if (this.fanSurfaces)
			this.fanSurfaces.updatePuckShadow(_pos, _radius);
		this.floorMat.setVector2("puckShadowPos", _pos);
		this.floorMat.setFloat("puckShadowRadius", _radius);
	}

	onMatchFinished() : void
	{
		this.currentState = MatchStates.Finished;

		if (Math.random() < 0.25)
		{
			const special: string[] =
			[
				"IT'S JOEVER",
				"Judgement Time"
			];
			this.matchFinishedTopText.text = special[Math.floor(Math.random() * special.length)];
		}
		else
			this.matchFinishedTopText.text = "Match Finished!";
		// Middle Text
		{
			const winnerName: string = this.score_P1 >= this.score_P2 ? this.P1NameText.text : this.P2NameText.text;
			const loserName: string = this.score_P1 < this.score_P2 ? this.P1NameText.text : this.P2NameText.text;
			const tiedMatch: boolean = this.score_P1 == this.score_P2;
			const sweep: boolean = this.score_P1 * this.score_P2 == 0;
			const perfect: boolean = sweep && (Math.max(this.score_P1, this.score_P2) == this.ruleset.targetScore);
			const special: string[] = Math.random() < 0.25 ? (tiedMatch ?
				[
					winnerName + " and " + loserName + " are evenly matched!",
					"gonna call this 50 shades of pong the way " + winnerName + " and " + loserName + " are tied",
					"Friendship Wins!"
				] : perfect ?
				// Perfect (Target Scored Reached, Other Score 0)
				[
					"it has never been more joever for " + loserName,
					loserName + " now owes " + winnerName + " a Blajah (yipee) :3",
					winnerName + " is now a minishell master",
					winnerName + " has now reached 'Peak Unemployment' status",
					"does " + loserName + " even know how this thing works??",
					"'Nah, I'd win' - " + winnerName,
					loserName + " just got ULTRAKILLED (layer 8 coming this year!! :D)",
					"generational aura debt for " + loserName + " couldn't be me fr fr :skull:",
					winnerName + " is an average 'a few quick matches' player (buy now on steam!)",
					winnerName + " just chopped up " + loserName + " in a meat grinder and the only thing that came out was an eyeball",
					winnerName + " has ft_transcended to a higher plane of existence"
				] : sweep ?
				// Sweep (Target Scored Not Reached, Other Score 0)
				[
					"#" + winnerName.toUpperCase() + "SWEEP!!",
					"oh wow " + winnerName + " swept the floor w/ " + loserName,
					winnerName + " is now a minishell expert",
					winnerName + " did NOT, in fact, let that slide",
					winnerName + " is a Jigglypuff main /pos",
					"x1.5 aura for " + winnerName + " (baron mime?)",
					winnerName + " is an avid FEM&M listener"
				] :
				// Regular
				[
					"not a good day to be " + loserName + " ngl",
					winnerName + " is now a minishell novice",
					"nahh " + winnerName + " knows about zip files bc they a winrar dawg",
					loserName + " is VERY employed",
					"BREAKING NEWS: " + loserName + " found dead in Miami, local authorities suspect of the fabled ante 7 plant boss blind",
					loserName + " managed to snatch defeat from the jaws of victory",
					"+50 aura for " + winnerName,
					winnerName + " is legally skilled (90% of people can't get past level 3, download now!!1!)"
				]) : [];
			this.matchFinishedMiddleText.text =
				special.length > 0 ? special[Math.floor(Math.random() * special.length)] :
				tiedMatch ? "It's a tie!" :
				perfect ? "A perfect victory for " + winnerName + "!" :
				sweep ? winnerName + " is a great goalkeeper!" :
				winnerName + " wins!";
		}
		if (Math.random() < 0.25)
		{
			const special: string[] =
			[
				"Keep 'em Coming!",
				"Bueno, Un Whisky Y A Dormir",
				"One More?",
				"Up For Round 2?"
			];
			this.matchFinishedBottomText.text = special[Math.floor(Math.random() * special.length)];
		}
		else
			this.matchFinishedBottomText.text = "Thanks For Playing!";
		this.matchFinishedMenu.isVisible = true;

		if (this.tournamentData)
		{
			if (this.tournamentData.game_1 == "playing")
			{
				this.tournamentData.game_1 = "played";
				this.tournamentData.player1_score = this.score_P1.toString();
				this.tournamentData.player2_score = this.score_P2.toString();
			}
			else if (this.tournamentData.game_2 == "playing")
			{
				this.tournamentData.game_2 = "played";
				this.tournamentData.player3_score = this.score_P1.toString();
				this.tournamentData.player4_score = this.score_P2.toString();
			}
			else if (this.tournamentData.game_3 == "playing")
			{
				this.tournamentData.game_3 = "played";
				this.tournamentData.winner1_score = this.score_P1.toString();
				this.tournamentData.winner2_score = this.score_P2.toString();
			}
			if (this.debugFlag)
				console.log("Updated Tournament Data: ", this.tournamentData);
		}
		else
		{
			const matchResults: object =
			{
				duration: this.matchDuration.toString(),
				parry_streak: this.longestParryStreak.toString(),
				bounce_streak: this.longestBounceStreak.toString(),
				player1: this.user_P1.id,
				player1_score: this.score_P1.toString(),
				player1_bounce_count: this.board.players[0].totalBounces.toString(),
				player1_parry_attempts: this.board.players[0].totalSpins.toString(),
				player1_parry_count: this.board.players[0].totalSuccessfulSpins.toString(),
				player2: this.user_P2.id,
				player2_score: this.score_P2.toString(),
				player2_bounce_count: this.board.players[1].totalBounces.toString(),
				player2_parry_attempts: this.board.players[1].totalSpins.toString(),
				player2_parry_count: this.board.players[1].totalSuccessfulSpins.toString()
			};
			if (this.debugFlag)
				console.log("Posted Results: ", matchResults);
			this.uploadMatchResults(JSON.stringify(matchResults));
		}
	}

	async uploadMatchResults(_resultsJson: string)
	{
		try
		{
			const response = await fetch("/api/match_history",
			{
				method: "POST",
				body: _resultsJson,
				headers:
				{
					"Content-Type": "application/json",
				},
				credentials: 'include',
			});
			const data = await response.json();
			if (this.debugFlag)
				console.log("Response From Server (Match Results Post): ", data);
		}
		catch (error)
		{
			console.log("Error registering match outcome: ", error);
		}
	}

	public onRender() : void
	{
		if (this.currentState == MatchStates.None)
			return;
		this.puckObj.onRender();
		this.updatePuckShadow(this.board.puck.pos, 0.5 + this.board.puck.y * 0.1);
		if (this.floorColorLerpFlag)
			this.floorMat.setFloat("floorColorSwap", this.floorColorLerp > 1 ? 2 - this.floorColorLerp : this.floorColorLerp);
		for (const playerObj of this.players)
			playerObj.onRender();
		for (const bumperObj of this.bumpers)
			bumperObj.onRender();
		this.P1ScoreText.text = this.score_P1.toString() + " / " + this.ruleset.targetScore.toString();
		this.P2ScoreText.text = this.score_P2.toString() + " / " + this.ruleset.targetScore.toString();
		this.matchTimerText.text = Math.max(0, this.matchTimer).toFixed(this.matchTimer < 10 ? 2 : 1).toString();
		if (this.overtimeFlag)
		{
			this.matchTimerText.text = "[ ! ]  " + this.matchTimerText.text + "  [ ! ]";
			if (this.ruleset.simpleVFX)
				this.matchTimerText.color = this.matchTimer < 10 ? "#FF80A0" : "#FFD080";
			else
			{
				const colorIndex = this.matchTimer < 10 ? Math.floor(this.matchTimer * 8) % 4 : Math.floor(this.matchTimer * 4) % 2;
				this.matchTimerText.color = colorIndex % 2 == 0 ? "white" : [ "#FFA042", "#FF42A0" ][(colorIndex - 1) / 2];
			}
		}
		if (this.debugFlag)
		{
			let debugText: string = "";
			debugText += "FPS: " + Math.round(1000 / this.engine.getDeltaTime());
			debugText += "\nPuck Pos: " + FormatVector2(this.board.puck.pos, 3);
			debugText += "\nPuck Dir: " + FormatVector2(this.board.puck.dir, 3);
			debugText += "\nPuck Speed: " + (this.board.puck.speed + this.board.puck.incrementalSpeed + this.board.puck.overtimeSpeed).toFixed(3);
			debugText += "\nPuck Y: " + this.board.puck.y.toFixed(3);
			debugText += "\nPuck Y Speed: " + this.board.puck.ySpeed.toFixed(3);
			debugText += "\nCam Rotation: " + FormatVector3(this.camera.rotation, 3);
			debugText += "\nScore: " + this.score_P1.toString() + " - " + this.score_P2.toString();
			debugText += "\nMatch Timer: " + this.matchTimer.toFixed(3);
			debugText += "\nMatch State: " + this.currentState + " (" + MatchStates[this.currentState] + ")";
			debugText += "\nState Timer: " + this.stateTimer.toFixed(3);
			debugText += "\nMatch Duration: " + this.matchDuration.toFixed(3);
			debugText += "\nBounce Chain: " + this.board.puck.bounceChain.toString();
			debugText += "\nParry Chain: " + this.board.puck.parryChain.toString();
			debugText += "\nLongest Bounce Chain: " + this.longestBounceStreak.toString();
			debugText += "\nLongest Parry Chain: " + this.longestParryStreak.toString();
			debugText += "\nP1 Bounces: " + this.board.players[0].totalBounces.toString();
			debugText += "\nP1 Parry Rate: " + this.board.players[0].totalSuccessfulSpins.toString() + " / " + this.board.players[0].totalSpins.toString() + " (" + ((this.board.players[0].totalSpins > 0 ? this.board.players[0].totalSuccessfulSpins / this.board.players[0].totalSpins : 0) * 100).toFixed(3) + ")";
			debugText += "\nP2 Bounces: " + this.board.players[1].totalBounces.toString();
			debugText += "\nP2 Parry Rate: " + this.board.players[1].totalSuccessfulSpins.toString() + " / " + this.board.players[1].totalSpins.toString() + " (" + ((this.board.players[1].totalSpins > 0 ? this.board.players[1].totalSuccessfulSpins / this.board.players[1].totalSpins : 0) * 100).toFixed(3) + ")";
			this.debugInfoText.text = debugText;
		}
	}

	public adjustUI()
	{
		const scale = Math.min(this.advancedTextureUI.getSize().width / 1873, this.advancedTextureUI.getSize().height / 937);
		for (const obj of this.manualResponsiveObjects)
			obj.onResize(scale);
	}

	omegaFlowey(_state: MatchState) : void
	{
		this.board.loadState(_state.boardState);
		this.currentState = _state.currentState;
		this.stateTimer = _state.stateTimer;
		this.overtimeFlag = _state.overtimeFlag;
		this.matchTimer = _state.matchTimer;
		this.paused = _state.paused;
		this.showHitboxes = _state.showHitboxes;
		for (const player of this.players)
			player.setHitboxGraphicsEnabled(this.showHitboxes);
		if (this.fanSurfaces)
			this.fanSurfaces.setHitboxGraphicsEnabled(this.showHitboxes);
		for (const gfx of this.colliderGfx)
			gfx.setEnabled(this.showHitboxes);
		this.beforeMatchMenu.isVisible = this.currentState == MatchStates.BeforeMatch;
		this.matchFinishedMenu.isVisible = this.currentState == MatchStates.Finished;
		if (!this.overtimeFlag)
			this.matchTimerText.color = "white";
	}
}