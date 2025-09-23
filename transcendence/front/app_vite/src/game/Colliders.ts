import { Vector2 } from "@babylonjs/core";
import { cylinderInBox } from "./CollisionUtils.js";
import { Player } from "./Player.js";
import { Puck } from "./Puck.js";

export class Box
{
	public pos: Vector2;
	public size: Vector2;
	public startY: number;
	public height: number;

	public constructor(_pos: Vector2, _size: Vector2, _startY: number, _height: number)
	{
		this.pos = _pos;
		this.size = _size;
		this.startY = _startY;
		this.height = _height;
	}
}

export class Cylinder
{
	public pos: Vector2;
	public radius: number;
	public startY: number;
	public height: number;

	public constructor(_pos: Vector2, _radius: number, _startY: number, _height: number)
	{
		this.pos = _pos;
		this.radius = _radius;
		this.startY = _startY;
		this.height = _height;
	}
}

export enum TriggerTypes { BoardBounds, Player, StickyCeiling, FloorFan }

export abstract class Trigger
{
	public isActive: boolean;

	protected constructor(_isActive: boolean)
	{
		this.isActive = _isActive;
	}

	public abstract getTriggerType() : TriggerTypes;
	public isPuckInTrigger(_puck: Puck) { return this.isActive && this.puckInTrigger(_puck); }
	protected abstract puckInTrigger(_puck: Puck) : boolean;
}

abstract class BoxTrigger extends Trigger
{
	public box: Box;

	public constructor(_isActive: boolean, _box: Box)
	{
		super(_isActive);
		this.box = _box;
	}

	protected puckInTrigger(_puck: Puck): boolean { return cylinderInBox(_puck.pos, _puck.y, _puck.radius, _puck.height, this.box); }
}

export class GenericBoxTrigger extends BoxTrigger
{
	readonly triggerType: TriggerTypes;

	public constructor(_isActive: boolean, _box: Box, _triggerType: TriggerTypes)
	{
		super(_isActive, _box);
		this.triggerType = _triggerType;
	}

	public getTriggerType() : TriggerTypes { return this.triggerType; }
}

export enum BounceStrengths { Weak, Default, Strong, Angled };

export class PlayerTrigger extends BoxTrigger
{
	public readonly playerRef: Player;
	public bounceDirSign: number;
	public bounceStrength: BounceStrengths;
	public bounceAngleSign: number;
	public disableAfterBounce: boolean;

	public constructor(_isActive: boolean, _box: Box, _playerRef: Player, _bounceDirSign: number, _disableAfterBounce: boolean)
	{
		super(_isActive, _box);
		this.playerRef = _playerRef;
		this.bounceDirSign = _bounceDirSign;
		this.bounceStrength = BounceStrengths.Default;
		this.bounceAngleSign = 0;
		this.disableAfterBounce = _disableAfterBounce;
	}

	public getTriggerType(): TriggerTypes { return TriggerTypes.Player; }
	protected puckInTrigger(_puck: Puck): boolean { return Math.sign(_puck.dir.x) != this.bounceDirSign && super.puckInTrigger(_puck); }
	public getNumericStrength() : number { return this.isActive ? this.bounceStrength : -1; }
}