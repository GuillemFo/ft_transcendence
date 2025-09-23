import { Vector2, Vector3 } from "@babylonjs/core";
import { Bumper } from "./Board.js";
import { Box, Cylinder, Trigger, TriggerTypes, BounceStrengths, PlayerTrigger } from "./Colliders.js";
import { cylinderInBox, cylinderInCylinder, getBumperBounceDir } from "./CollisionUtils.js";
import { PuckIncrementalSpeedOptions } from "./MatchRuleset.js";
import { PuckState } from "./MatchState.js";

export class Puck
{
	public pos: Vector2;
	public y: number;
	public speed: number;
	public readonly baseSpeed: number = 4;
	readonly weakBounceSpeed: number = 2;
	readonly weakParrySpeed: number = 6;
	readonly bounceSpeedIncrement: number = 1;
	readonly maxBounceSpeed: number = 7;
	incrementalSpeed: number = 0;
	readonly incrementalSpeedAccel;
	overtimeSpeed: number = 0;
	readonly overtimeSpeedAccel: number = 2.5;
	readonly maxIncrementalSpeed: number = 42;
	public dir: Vector2;
	public ySpeed: number;
	public readonly radius: number = 0.375;
	public readonly height: number = 0.1;
	readonly gravity: number = 8;
	readonly contactOffset: number = 0.01;
	public updateTimer: number;
	public readonly timeStep: number = 0.01;
	public strongBouncePlayerIndex: number = -1;
	public isWithinBounds: boolean = true;
	public bounceChain: number = 0;
	public parryChain: number = 0;

	public constructor(_incrementalSpeedOption: PuckIncrementalSpeedOptions)
	{
		this.pos = new Vector2(0, 0);
		this.y = 0;
		this.baseSpeed = [ 7, 6, 5, 4 ][_incrementalSpeedOption];
		this.maxBounceSpeed = this.baseSpeed + 3;
		this.weakBounceSpeed = this.baseSpeed - 2;
		this.weakParrySpeed = this.maxBounceSpeed - 1;
		this.speed = this.baseSpeed;
		this.incrementalSpeedAccel = [ 0, 0.2, 0.5, 0.8 ][_incrementalSpeedOption];
		this.incrementalSpeed = 0;
		this.overtimeSpeed = 0;
		this.dir = new Vector2(0, 0);
		this.ySpeed = 0;
		this.updateTimer = 0;
	}

	public reset()
	{
		this.pos = Vector2.Zero();
		this.y = 0;
		this.speed = this.baseSpeed;
		this.incrementalSpeed = 0;
		this.overtimeSpeed = 0;
		this.dir = new Vector2(0, 0);
		this.ySpeed = 0;
		this.updateTimer = 0;
		this.strongBouncePlayerIndex = -1;
		this.isWithinBounds = true;
		this.bounceChain = 0;
		this.parryChain = 0;
	}

	public loadState(_state: PuckState) : void
	{
		this.pos = new Vector2(_state.xPos, _state.zPos);
		this.y = _state.y;
		this.speed = _state.speed;
		this.incrementalSpeed = _state.incrementalSpeed;
		this.overtimeSpeed = _state.overtimeSpeed;
		this.dir = new Vector2(_state.xDir, _state.zDir);
		this.ySpeed = _state.ySpeed;
		this.updateTimer = _state.updateTimer;
		this.strongBouncePlayerIndex = _state.strongBouncePlayerIndex;
		this.isWithinBounds = _state.isWithinBounds;
		this.bounceChain = _state.bounceChain;
		this.parryChain = _state.parryChain;
	}

	public update(_deltaTime: number, _boxes: Box[], _bumpers: Bumper[], _triggers: Trigger[], _overtimeFlag: boolean, _isPredict: boolean = false) : void
	{
		this.strongBouncePlayerIndex = -1;
		this.updateTimer += _deltaTime;
		while (this.updateTimer >= this.timeStep)
		{
			if (this.incrementalSpeed < this.maxIncrementalSpeed)
				this.incrementalSpeed = Math.min(this.maxIncrementalSpeed, this.incrementalSpeed + this.incrementalSpeedAccel * (this.baseSpeed == this.maxBounceSpeed ? 2.5 : 1) * this.timeStep);
			if (_overtimeFlag)
				this.overtimeSpeed = Math.min(this.maxIncrementalSpeed, this.overtimeSpeed + this.overtimeSpeedAccel * this.timeStep);
			this.ySpeed -= this.gravity * this.timeStep;
			this.isWithinBounds = false;
			this.move(this.timeStep, _boxes, _bumpers, _isPredict);
			this.evalTriggers(_triggers, _isPredict);
			this.updateTimer -= this.timeStep;
		}
	}

	move(_dt: number, _boxes: Box[], _bumpers: Bumper[], _isPredict: boolean) : void
	{
		const deltaY = this.ySpeed * _dt;
		const puckSpeed = this.speed + this.incrementalSpeed + this.overtimeSpeed;
		const deltaX = this.dir.x * puckSpeed * _dt;
		const deltaZ = this.dir.y * puckSpeed * _dt;
		if (deltaY != 0)
			this.y = this.movePuckY(this.pos, this.y, deltaY, _boxes, _bumpers, _isPredict);
		if (deltaX != 0 || deltaZ != 0)
			this.pos = this.movePuckXZ(this.pos, deltaX, deltaZ, _boxes, _bumpers, _isPredict);
	}

	movePuckY(_startPos: Vector2, _startY: number, _deltaY: number, _boxes: Box[], _bumpers: Bumper[], _isPredict: boolean) : number
	{
		let dist = 0;
		const totalDist = Math.abs(_deltaY);
		const maxDelta: number = 0.02;
		const distSign = Math.sign(_deltaY);
		while (dist != totalDist)
		{
			dist += maxDelta;
			if (dist > totalDist)
				dist = totalDist;
			const yNew: number = _startY + dist * distSign;
			for (const box of _boxes)
			{
				if (cylinderInBox(_startPos, yNew, this.radius, this.height, box))
				{
					this.ySpeed = 0;
					return distSign > 0 ? box.startY - this.height : (box.startY + box.height);
				}
			}
			for (const bumper of _bumpers)
			{
				const cylinder: Cylinder = bumper.cylinder;
				if (cylinderInCylinder(_startPos, yNew, this.radius, this.height, cylinder))
				{
					this.ySpeed = 0;
					return distSign > 0 ? cylinder.startY - this.height : (cylinder.startY + cylinder.height);
				}
			}
		}
		return _startY + _deltaY;
	}

	movePuckXZ(_startPos: Vector2, _deltaX: number, _deltaZ: number, _boxes: Box[], _bumpers: Bumper[], _isPredict: boolean) : Vector2
	{
		let p: Vector2 = _startPos;
		const maxDelta: number = 0.02;
		let distX = 0;
		const totalDistX = Math.abs(_deltaX);
		const distSignX = Math.sign(_deltaX);
		let distZ= 0;
		const totalDistZ = Math.abs(_deltaZ);
		const distSignZ = Math.sign(_deltaZ);
		while (distX != totalDistX || distZ != totalDistZ)
		{
			let pNew: Vector2 = p;
			let collision: boolean = false;
			if (distX != totalDistX)
			{
				distX += maxDelta;
				if (distX > totalDistX)
					distX = totalDistX;
				pNew = new Vector2(_startPos.x + distX * distSignX, pNew.y);
				for (const box of _boxes)
				{
					if (cylinderInBox(pNew, this.y, this.radius, this.height, box))
					{
						this.dir.x *= -1;
						pNew.x = box.pos.x - (box.size.x * 0.5 + this.radius + this.contactOffset) * distSignX
						collision = true;
						break;
					}
				}
			}
			if (distZ != totalDistZ)
			{
				distZ += maxDelta;
				if (distZ > totalDistZ)
					distZ = totalDistZ;
				pNew.y = _startPos.y + distZ * distSignZ;
				for (const box of _boxes)
				{
					if (cylinderInBox(pNew, this.y, this.radius, this.height, box))
					{
						this.dir.y *= -1;
						pNew.y = box.pos.y - (box.size.y * 0.5 + this.radius + this.contactOffset) * distSignZ;
						collision = true;
						break;
					}
				}
			}
			for (const bumper of _bumpers)
			{
				const cylinder: Cylinder = bumper.cylinder;
				if (cylinderInCylinder(pNew, this.y, this.radius, this.height, cylinder))
				{
					if (!_isPredict)
						bumper.markHit();
					this.dir = getBumperBounceDir(p, cylinder.pos);
					return bumper.cylinder.pos.add(pNew.subtract(bumper.cylinder.pos).normalize().scale(bumper.cylinder.radius + this.radius + this.contactOffset));;
				}
			}
			if (collision)
				return pNew;
			p = pNew;
		}
		return p;
	}

	evalTriggers(_triggers: Trigger[], _isPredict: boolean)
	{
		for (const trigger of _triggers)
		{
			if (!trigger.isPuckInTrigger(this))
				continue;
			switch (trigger.getTriggerType())
			{
				case TriggerTypes.BoardBounds:
					this.isWithinBounds = true;
					break;
				case TriggerTypes.StickyCeiling:
					if (this.speed == this.maxBounceSpeed)
						this.ySpeed = Math.max(1, this.ySpeed);
					break;
				case TriggerTypes.FloorFan:
					this.ySpeed = 5;
					break;
				case TriggerTypes.Player:
					const bounceTrigger: PlayerTrigger = trigger as PlayerTrigger;
					this.dir.x = Math.abs(this.dir.x) * bounceTrigger.bounceDirSign;
					if (!_isPredict)
					{
						this.bounceChain++;
						bounceTrigger.playerRef.totalBounces++;
						if (bounceTrigger.bounceStrength == BounceStrengths.Strong)
						{
							this.parryChain++;
							bounceTrigger.playerRef.totalSuccessfulSpins++;
						}
						else
							this.parryChain = 0;
					}
					switch (bounceTrigger.bounceStrength)
					{
						case BounceStrengths.Default:
							this.speed = this.baseSpeed;
							break;
						case BounceStrengths.Angled:
							let angle = Math.abs(this.pos.y - bounceTrigger.box.pos.y) > 0.25 ? (this.pos.y - bounceTrigger.box.pos.y) * 30 : 0;
							if (Math.abs(angle) > 45)
								angle = 45 * Math.sign(angle);
							angle *= Math.PI / 180;
							this.dir = new Vector2(Math.cos(angle) * bounceTrigger.bounceDirSign, Math.sin(angle));
							break;
						default:
							this.updateStrongBounceAngle(bounceTrigger.bounceAngleSign);
							if (bounceTrigger.bounceStrength == BounceStrengths.Strong)
							{
								this.strongBouncePlayerIndex = bounceTrigger.playerRef.index;
								if (this.speed == this.weakBounceSpeed) // Wii Sports Resort Moment
									this.speed = this.weakParrySpeed;
								else
									this.speed = Math.min(this.speed + this.bounceSpeedIncrement, this.maxBounceSpeed);
								if (this.speed == this.maxBounceSpeed)
									this.ySpeed = 5;
							}
							if (bounceTrigger.bounceStrength == BounceStrengths.Weak)
								this.speed = this.weakBounceSpeed;
							break;
					}
					if (bounceTrigger.disableAfterBounce)
						bounceTrigger.isActive = false;
					break;
			}
		}
	}

	public updateStrongBounceAngle(_angleSign: number) : void
	{
		this.dir = new Vector2(Math.sign(this.dir.x), 0.5 * _angleSign).normalize();
	}

	public predict(pointCount: number, _boxes: Box[], _bumpers: Bumper[], _triggers: Trigger[], _overtimeFlag: boolean) : Array<Vector3>
	{
		const ogData: PuckState = new PuckState(this);
		let points: Array<Vector3> = new Array<Vector3>(pointCount);
		for (let i = 0; i < pointCount; i++)
		{
			if (this.isWithinBounds)
				this.update(this.timeStep, _boxes, _bumpers, _triggers, _overtimeFlag, true);
			points[i] = new Vector3(this.pos.x, this.y + this.height * 0.5, this.pos.y);
		}
		this.loadState(ogData);
		return points;
	}
}