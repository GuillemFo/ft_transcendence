import { Vector2 } from "@babylonjs/core";
import { ArtificialPlayer } from "./Amaia.js";
import { Box, Cylinder, Trigger, GenericBoxTrigger, TriggerTypes } from "./Colliders.js";
import { InputManager } from "./InputManager.js";
import { AmaiaPredictDuringImpactPauseOptions, BoardLayouts, MatchRuleset } from "./MatchRuleset.js";
import { BoardState, BumperState } from "./MatchState.js";
import { Player, KeyboardPlayer } from "./Player.js";
import { Puck } from "./Puck.js";

export class Bumper
{
	public cylinder: Cylinder;
	public durability: number;
	hitCooldownTimer: number = 0;
	readonly hitCooldownPeriod: number = 0.1;
	hit: boolean;

	public constructor(_pos: Vector2, _radius: number, _startY: number, _height: number)
	{
		this.cylinder = new Cylinder(_pos, _radius, _startY, _height);
		this.durability = 3;
		this.hit = false;
	}

	public update(_deltaTime: number) : void
	{
		if (this.hitCooldownTimer > 0)
			this.hitCooldownTimer -= _deltaTime;
		if (this.hit && this.durability > 0)
		{
			this.durability--;
			this.hitCooldownTimer = this.hitCooldownPeriod;
			this.hit = false;
		}
	}

	public markHit() : void
	{
		if (this.hitCooldownTimer <= 0)
			this.hit = true;
	}

	public isActive() : boolean { return this.durability > 0; }

	public reset() : void
	{
		this.durability = 3;
		this.hitCooldownTimer = 0;
		this.hit = false;
	}

	public loadState(_state: BumperState) : void
	{
		this.durability = _state.durability;
		this.hitCooldownTimer = _state.hitCooldownTimer;
	}
}

class BoardLayout
{
	public readonly boxes: Box[];
	public readonly bumpers: Bumper[];
	public readonly triggers: Trigger[];

	public constructor(_boxes: Box[], _bumpers: Bumper[], _triggers: Trigger[])
	{
		this.boxes = _boxes;
		this.bumpers = _bumpers;
		this.triggers = _triggers;
	}
}

export class Board
{
	public readonly players: Player[];
	public readonly puck: Puck;
	public readonly boxes: Box[];
	public readonly bumpers: Bumper[];
	public readonly triggers: Trigger[];
	impactTimer: number = 0;
	amaiaImpactTimerUpdateOption: AmaiaPredictDuringImpactPauseOptions;

	public constructor(_ruleset: MatchRuleset, _inputManager: InputManager)
	{
		this.puck = new Puck(_ruleset.puckIncrementalSpeedOption);
		this.players = Array<Player>(2);
		for (let i = 0; i < this.players.length; i++)
			this.players[i] = i > 0 && _ruleset.isSinglePlayer() ? new ArtificialPlayer(false, _ruleset.amaiaRefreshRateOption, _ruleset.spinMode, this) : new KeyboardPlayer(i == 0, _ruleset.spinMode, _inputManager);
		const layout: BoardLayout = Board.generate(_ruleset);
		this.boxes = layout.boxes;
		this.bumpers = layout.bumpers;
		this.triggers = layout.triggers;
		this.amaiaImpactTimerUpdateOption = _ruleset.amaiaImpactPredictOption;
	}

	public onDispose()
	{
		for (const player of this.players.filter((player) => player.isArtificial()))
			(player as ArtificialPlayer).dispose();
	}

	public update(_deltaTime: number, _overtimeFlag: boolean)
	{
		if (this.amaiaImpactTimerUpdateOption != AmaiaPredictDuringImpactPauseOptions.Disabled || this.impactTimer <= 0)
			for (const player of this.players)
				if (player.isArtificial())
					(player as ArtificialPlayer).updatePrediction(_deltaTime, this.amaiaImpactTimerUpdateOption == AmaiaPredictDuringImpactPauseOptions.Enabled || this.impactTimer <= 0, _overtimeFlag);
		if (this.impactTimer > 0)
		{
			this.impactTimer -= _deltaTime;
			for (let i = 0; i < this.players.length; i++)
			{
				if (i == this.puck.strongBouncePlayerIndex)
				{
					const upInput: boolean = this.players[i].inputUp();
					const downInput: boolean = this.players[i].inputDown();
					const neutralInput: boolean = this.players[i].inputForwardSpin() || this.players[i].inputBackSpin();
					if (upInput || downInput)
						this.puck.updateStrongBounceAngle(upInput ? 1 : -1);
					else if (neutralInput)
						this.puck.updateStrongBounceAngle(0);
				}
			}
			if (this.impactTimer > 0)
				return;
		}
		for (const player of this.players)
			player.update(_deltaTime);
		this.puck.update(_deltaTime, this.boxes, this.getActiveBumpers(), this.getTriggers(), _overtimeFlag);
		if (this.puck.strongBouncePlayerIndex != -1)
			this.impactTimer = 0.25;
		for (const bumper of this.bumpers)
			bumper.update(_deltaTime);
	}
	
	getActiveBumpers() : Bumper[] { return this.bumpers.filter((item) => item.isActive()); }

	getTriggers() : Trigger[]
	{
		let allTriggers: Trigger[] = [];
		for (const trigger of this.triggers)
			allTriggers.push(trigger);
		for (const player of this.players)
			for (const trigger of player.getTriggers())
				allTriggers.push(trigger);
		return allTriggers;
	}

	public reset()
	{
		for (const player of this.players)
			player.reset();
		this.puck.reset();
		for (const bumper of this.bumpers)
			bumper.reset();
	}

	public setInitialPuckDir(_layout: BoardLayouts)
	{
		let angles: number[];
		switch (_layout)
		{
			case BoardLayouts.DiamondPlaza:
				angles = [ 15, 30, 45, 60, -15, -30, -45, -60, 195, 210, 225, 240, 165, 150, 135, 120 ]; // No Straights (kinda based??)
				break;
			case BoardLayouts.SnowedLake:
				angles = [ 0, 15, 45, 60, -15, -45, -60, 180, 195, 225, 240, 165, 150, 135, 120 ]; // No 30-Degree Shots
				break;
			case BoardLayouts.EtherealMeadows:
				angles = [ 0, 15, 30, 45, -15, -30, -45, 180, 195, 210, 225, 165, 150, 135 ]; // No 60-Degree Shots
				break;
			default:
				angles = [ 0, 15, 30, 45, 60, -15, -30, -45, -60, 180, 195, 210, 225, 240, 165, 150, 135, 120 ];
				break;
		}
		const angle = angles[Math.floor(Math.random() * angles.length)]  * Math.PI / 180;
		this.puck.dir = new Vector2(-Math.cos(angle), Math.sin(angle));
	}

	public loadState(_state: BoardState)
	{
		for (let i = 0; i < this.players.length; i++)
			this.players[i].loadState(_state.playerStates[i]);
		this.puck.loadState(_state.puckState);
		for (let i = 0; i < this.bumpers.length; i++)
			this.bumpers[i].loadState(_state.bumperStates[i]);
	}

	static generate(_ruleset: MatchRuleset) : BoardLayout
	{
		let boxes: Box[];
		let bumpers: Bumper[];
		let triggers: Trigger[];

		boxes =
		[
			new Box(new Vector2(0, -6.5), new Vector2(24, 1), 0, 2),
			new Box(new Vector2(0, 6.5), new Vector2(24, 1), 0, 2),
			new Box(new Vector2(0, 0), new Vector2(24, 14), -1, 1),
			new Box(new Vector2(0, 0), new Vector2(24, 14), 2, 1)
		];
		triggers = [ new GenericBoxTrigger(true, new Box(new Vector2(0, 0), new Vector2(24, 12), 0, 2), TriggerTypes.BoardBounds) ];
		if (_ruleset.stickyCeiling)
			triggers.push(new GenericBoxTrigger(true, new Box(new Vector2(0, 0), new Vector2(24, 12), 1.5, 0.5), TriggerTypes.StickyCeiling));
		bumpers = [];
		switch (_ruleset.boardLayout)
		{
			case BoardLayouts.DiamondPlaza:
				bumpers.push(new Bumper(new Vector2(-4, 0), 0.5, 0, 0.5));
				bumpers.push(new Bumper(new Vector2(4, 0), 0.5, 0, 0.5));
				bumpers.push(new Bumper(new Vector2(0, -3), 0.5, 0, 0.5));
				bumpers.push(new Bumper(new Vector2(0, 3), 0.5, 0, 0.5));
				break;
			case BoardLayouts.SnowedLake:
				bumpers.push(new Bumper(new Vector2(-3.5, -2), 0.5, 0, 0.5));
				bumpers.push(new Bumper(new Vector2(-3.5, 2), 0.5, 0, 0.5));
				bumpers.push(new Bumper(new Vector2(0, -4), 0.5, 0, 0.5));
				bumpers.push(new Bumper(new Vector2(0, 4), 0.5, 0, 0.5));
				bumpers.push(new Bumper(new Vector2(3.5, -2), 0.5, 0, 0.5));
				bumpers.push(new Bumper(new Vector2(3.5, 2), 0.5, 0, 0.5));
				break; 
			case BoardLayouts.JungleGym:
				triggers.push(new GenericBoxTrigger(true, new Box(new Vector2(-5, 0), new Vector2(1, 4), 0, 0.01), TriggerTypes.FloorFan));
				triggers.push(new GenericBoxTrigger(true, new Box(new Vector2(5, 0), new Vector2(1, 4), 0, 0.01), TriggerTypes.FloorFan));
				break;
			case BoardLayouts.EtherealMeadows:
				bumpers.push(new Bumper(new Vector2(-5, 0), 0.5, 0, 0.5));
				bumpers.push(new Bumper(new Vector2(-2, -3), 0.5, 0, 0.5));
				bumpers.push(new Bumper(new Vector2(-2, 3), 0.5, 0, 0.5));
				triggers.push(new GenericBoxTrigger(true, new Box(new Vector2(-5, -3), new Vector2(1, 2), 0, 0.01), TriggerTypes.FloorFan));
				triggers.push(new GenericBoxTrigger(true, new Box(new Vector2(-5, 3), new Vector2(1, 2), 0, 0.01), TriggerTypes.FloorFan));
				triggers.push(new GenericBoxTrigger(true, new Box(new Vector2(-2, 0), new Vector2(1, 3), 0, 0.01), TriggerTypes.FloorFan));
				bumpers.push(new Bumper(new Vector2(5, 0), 0.5, 0, 0.5));
				bumpers.push(new Bumper(new Vector2(2, -3), 0.5, 0, 0.5));
				bumpers.push(new Bumper(new Vector2(2, 3), 0.5, 0, 0.5));
				triggers.push(new GenericBoxTrigger(true, new Box(new Vector2(5, -3), new Vector2(1, 2), 0, 0.01), TriggerTypes.FloorFan));
				triggers.push(new GenericBoxTrigger(true, new Box(new Vector2(5, 3), new Vector2(1, 2), 0, 0.01), TriggerTypes.FloorFan));
				triggers.push(new GenericBoxTrigger(true, new Box(new Vector2(2, 0), new Vector2(1, 3), 0, 0.01), TriggerTypes.FloorFan));
				break;
		}
		return new BoardLayout(boxes, bumpers, triggers);
	}
}
