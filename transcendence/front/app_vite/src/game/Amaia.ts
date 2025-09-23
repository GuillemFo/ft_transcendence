import { Vector2, Vector3, Color3, GreasedLineBaseMesh, CreateGreasedLine } from "@babylonjs/core";
import { Board } from "./Board.js";
import { Box, Trigger, BounceStrengths, PlayerTrigger, TriggerTypes } from "./Colliders.js";
import { AmaiaRefreshRateOptions, SpinModes } from "./MatchRuleset.js";
import { PlayerState, ArtificialPlayerState } from "./MatchState.js";
import { Player } from "./Player.js";

export class ArtificialPlayer extends Player
{
	readonly board: Board;
	predictTimer: number = 0;
	readonly predictDelay: number = 1;
	readonly predictLookahead: number = 2.5;
	readonly bounceLookahead: number = 1.5;
	targetOffset: number = 0;
	targetY: number = 0;
	targetReturnType: number = 0;
	targetTime: number = 0;
	readonly targetTimeMargin: number = 0.25;
	readonly targetSpinMargin: number = 0.05;
	readonly noTargetTimeDefined: number = -1;
	readonly showDebugLines: boolean = false;

	predictLinePointsBuff: Array<number>;
	predictLine: GreasedLineBaseMesh;
	bouncePredictLinesPointBuffs: Array<number>[];
	bouncePredictLineSet: GreasedLineBaseMesh;
	selectedBouncePredictLinePointsBuff: Array<number>;
	selectedBouncePredictLine: GreasedLineBaseMesh;

	public constructor(_isPlayer1: boolean, _refreshRate: AmaiaRefreshRateOptions, _spinMode: SpinModes, _board: Board)
	{
		super(_isPlayer1, _spinMode);
		this.board = _board;
		switch (_refreshRate)
		{
			case AmaiaRefreshRateOptions.Slow:
				this.predictDelay = 1;
				break;
			case AmaiaRefreshRateOptions.Medium:
				this.predictDelay = 0.5;
				break;
			case AmaiaRefreshRateOptions.Fast:
				this.predictDelay = 0.2;
				break;
			case AmaiaRefreshRateOptions.Constant:
				this.predictDelay = 0;
				break;
		}
		if (this.showDebugLines)
		{
			this.predictLinePointsBuff = new Array<number>(3 * (this.predictLookahead / this.board.puck.timeStep)).fill(0);
			this.predictLine = CreateGreasedLine("trail", { points: this.predictLinePointsBuff, updatable: true }, { color: Color3.Yellow() });
			const bouncePredictLinePointCount = 3 * (this.predictLookahead + this.bounceLookahead) / this.board.puck.timeStep;
			this.bouncePredictLinesPointBuffs = [];
			for (let i = 0; i < 9; i++)
				this.bouncePredictLinesPointBuffs.push(new Array<number>(bouncePredictLinePointCount).fill(0));
			this.bouncePredictLineSet = CreateGreasedLine("trail", { points: this.bouncePredictLinesPointBuffs, updatable: true }, { color: Color3.Red() });
			this.selectedBouncePredictLinePointsBuff = new Array<number>(bouncePredictLinePointCount).fill(0);
			this.selectedBouncePredictLine = CreateGreasedLine("trail", { points: this.selectedBouncePredictLinePointsBuff, updatable: true }, { color: Color3.Green() });
		}
		else
		{
			this.predictLinePointsBuff = [];
			this.predictLine = null;
			this.bouncePredictLinesPointBuffs = [];
			this.bouncePredictLineSet = null;
			this.selectedBouncePredictLinePointsBuff = [];
			this.selectedBouncePredictLine = null;
		}
	}

	public updatePrediction(_deltaTime: number, _canPredict: boolean, _overtimeFlag: boolean) : void
	{
		if (this.predictTimer > 0)
		{
			this.predictTimer -= _deltaTime;
			if (this.predictTimer > 0)
				return;
		}
		if (!_canPredict)
			return;
		// Calculate Bounce Position And Time
		this.resetTargetData();
		let tmpBoxes: Box[] = Array.from(this.board.boxes);
		tmpBoxes.push(new Box(new Vector2(Math.min(-this.pivot.x, this.board.puck.pos.x - (this.board.puck.radius + this.defaultHitboxWidth * 0.5 + this.board.puck.contactOffset)), this.pivot.y), new Vector2(this.defaultHitboxWidth, 12), 0, 2)); // Assume Player Never Lets Puck Go Through
		let tmpTriggers: Trigger[] = this.board.getTriggers().filter((item) => item.getTriggerType() != TriggerTypes.Player); // Ignore Own Return Triggers
		this.calcTargetArrival(tmpBoxes, tmpTriggers, _overtimeFlag);
		// Calculate Best Bounce (0 = Default Bounce, 1 = Straight Spin, 2 = Up Spin, 3 = Down Spin)
		if (this.targetTime != this.noTargetTimeDefined && this.targetTime <= Math.max(this.spinAllowed ? 0.1 : 0.4, this.predictDelay) && (this.targetY >= 1 || this.board.puck.speed != this.board.puck.baseSpeed || !this.spinAllowed)) // Must Spin If Puck Coming From Above (targetY >= 1) Or Player Spun (Puck Not Going At Default Base Speed) (Bounce Is Also Calculated If Spin Disabled)
			this.calcTargetBounceType(tmpBoxes, tmpTriggers, _overtimeFlag);
		else
		{
			this.targetReturnType = 0; // No Spin If Puck Coming From Below And At Default Base Speed (Player Must Start Spin Rally)
			if (this.showDebugLines) // Clear Bounce Prediction Lines (No Prediction Made)
			{
				for (let i = 0; i < this.bouncePredictLinesPointBuffs.length; i++)
				this.bouncePredictLinesPointBuffs[i].fill(0);
				this.bouncePredictLineSet.setPoints(this.bouncePredictLinesPointBuffs);
				this.selectedBouncePredictLinePointsBuff.fill(0);
				this.selectedBouncePredictLine.setPoints([ this.selectedBouncePredictLinePointsBuff ]);
			}
		}
		this.predictTimer += this.predictDelay;
	}

	protected onBeforeUpdate(_deltaTime: number) : void
	{
		if (this.targetTime != this.noTargetTimeDefined)
			this.targetTime -= _deltaTime;
		// Return To Center After Returning Puck (With Margin For Late Returns)
		if (this.targetTime < -this.targetTimeMargin && this.isWithinTargetOffset() && this.spinTimer <= 0)
			this.resetTargetData();
	}

	public dispose()
	{
		if (this.showDebugLines)
		{
			this.predictLine.dispose(true, true);
			this.predictLine = null;
			this.bouncePredictLineSet.dispose(true, true);
			this.bouncePredictLineSet = null;
			this.selectedBouncePredictLine.dispose(true, true);
			this.selectedBouncePredictLine = null;
		}
	}

	protected onReset()
	{
		this.predictTimer = 0;
		this.targetOffset = 0;
		this.targetY = 0;
		this.targetReturnType = 0;
		this.targetTime = this.noTargetTimeDefined;
	}

	protected onStateLoaded(_state: PlayerState) : void
	{
		this.loadArtificialPlayerState(_state as ArtificialPlayerState);
	}

	loadArtificialPlayerState(_state: ArtificialPlayerState) : void
	{
		this.predictTimer = _state.predictTimer;
		this.targetOffset = _state.targetOffset;
		this.targetY = _state.targetY;
		this.targetReturnType = _state.targetReturnType;
		this.targetTime = _state.targetTime;
	}

	resetTargetData() : void
	{
		this.targetTime = this.noTargetTimeDefined;
		this.targetOffset = 0;
		this.targetReturnType = 0;
	}

	calcTargetArrival(_tmpBoxes: Box[], _tmpTriggers: Trigger[], _overtimeFlag: boolean) : void
	{
		const points: Vector3[] = this.board.puck.predict(Math.ceil(this.predictLookahead / this.board.puck.timeStep), _tmpBoxes, this.board.getActiveBumpers(), _tmpTriggers, _overtimeFlag);
		let t = 0;
		let finalPointIndex = 0;
		for (const v of points)
		{
			this.targetOffset = Math.min(this.range, Math.max(-this.range, v.z));
			this.targetY = v.y;
			t += this.board.puck.timeStep;
			if (Math.sign(v.x) == Math.sign(this.pivot.x) && Math.abs(v.x) >= Math.abs(this.pivot.x) - (this.defaultHitboxWidth + this.board.puck.radius))
			{
				this.targetTime = t;
				break;
			}
			finalPointIndex++;
		}
		if (this.showDebugLines)
		{
			finalPointIndex = Math.min(points.length - 1, finalPointIndex);
			for (let i = 0; i < this.predictLinePointsBuff.length / 3; i++)
			{
				const p: Vector3 = points[Math.min(i, finalPointIndex)];
				this.predictLinePointsBuff[i * 3] = p.x;
				this.predictLinePointsBuff[i * 3 + 1] = p.y;
				this.predictLinePointsBuff[i * 3 + 2] = p.z;
			}
			this.predictLine.setPoints([ this.predictLinePointsBuff ]);
		}
	}

	calcTargetBounceType(_tmpBoxes: Box[], _tmpTriggers: Trigger[], _overtimeFlag: boolean)
	{
		let tmpBounceTrigger: PlayerTrigger = new PlayerTrigger(true, new Box(new Vector2(this.pivot.x, this.pivot.y + this.targetOffset), new Vector2(this.spinAllowed ? this.spinHitboxWidth : this.defaultHitboxWidth, this.hitboxDepth), 0, 2), this, -1, true);
		_tmpTriggers.push(tmpBounceTrigger);
		let bounceOutcomes = [];
		if (this.spinAllowed)
		{
			tmpBounceTrigger.bounceStrength = BounceStrengths.Strong;
			for (let i = 0; i < 3; i++)
			{
				tmpBounceTrigger.bounceAngleSign = [ 0, 1, -1 ][i];
				tmpBounceTrigger.isActive = true;
				const points: Vector3[] = this.board.puck.predict(Math.ceil((this.targetTime + this.bounceLookahead) / this.board.puck.timeStep), _tmpBoxes, this.board.getActiveBumpers(), _tmpTriggers, _overtimeFlag);
				let bounceOutcome = { outcomeIndex: i + 1, maxDist: 0, maxDistTime: this.bounceLookahead, selfGoalTime: this.bounceLookahead * 2, points: points };
				let outcomeTimer = -this.targetTime;
				for (const v of points)
				{
					if (outcomeTimer >= 0)
					{
						const dist: number = (this.pivot.x - 1) - v.x;
						if (dist > bounceOutcome.maxDist)
						{
							bounceOutcome.maxDist = dist;
							bounceOutcome.maxDistTime = outcomeTimer;
						}
						if (Math.sign(v.x) == Math.sign(this.pivot.x) && Math.abs(v.x) >= Math.abs(this.pivot.x) + 2)
							bounceOutcome.selfGoalTime = outcomeTimer;
					}
					outcomeTimer += this.board.puck.timeStep;
				}
				bounceOutcomes.push(bounceOutcome);
			}
		}
		else
		{
			tmpBounceTrigger.bounceStrength = BounceStrengths.Angled;
			for (let i = 0; i <= 1; i += 0.1)
			{
				const newTargetOffset: number = Math.min(this.range, Math.max(-this.range, this.targetOffset + this.hitboxDepth * (i - 0.5)));
				tmpBounceTrigger.box.pos.y = this.pivot.y + newTargetOffset;
				tmpBounceTrigger.isActive = true;
				const points: Vector3[] = this.board.puck.predict(Math.ceil((this.targetTime + this.bounceLookahead) / this.board.puck.timeStep), _tmpBoxes, this.board.getActiveBumpers(), _tmpTriggers, _overtimeFlag);
				let bounceOutcome = { targetOffset: newTargetOffset, maxDist: 0, maxDistTime: this.bounceLookahead, selfGoalTime: this.bounceLookahead * 2, points: points };
				let outcomeTimer = -this.targetTime;
				for (const v of points)
				{
					if (outcomeTimer >= 0)
					{
						const dist: number = (this.pivot.x - 1) - v.x;
						if (dist > bounceOutcome.maxDist)
						{
							bounceOutcome.maxDist = dist;
							bounceOutcome.maxDistTime = outcomeTimer;
						}
						if (Math.sign(v.x) == Math.sign(this.pivot.x) && Math.abs(v.x) >= Math.abs(this.pivot.x) + 2)
							bounceOutcome.selfGoalTime = outcomeTimer;
					}
					outcomeTimer += this.board.puck.timeStep;
				}
				bounceOutcomes.push(bounceOutcome);
			}
		}
		let avgSelfGoalTime = 0;
		for (const outcome of bounceOutcomes)
			avgSelfGoalTime += outcome.selfGoalTime;
		avgSelfGoalTime /= bounceOutcomes.length;
		bounceOutcomes = bounceOutcomes.filter((item) => item.selfGoalTime >= avgSelfGoalTime);
		if (bounceOutcomes.length == 0) // Just In Case
			this.targetReturnType = 0;
		else
		{
			bounceOutcomes.sort((a, b) => {
				if (a.maxDist != b.maxDist) // Bigger Max Distance -> Better
					return b.maxDist - a.maxDist;
				if (a.maxDistTime != b.maxDistTime) // Lower Max Distance Time -> Better
					return a.maxDistTime - b.maxDistTime;
				return Math.random() < 0.5 ? 1 : -1; // Equally Good Bounces, Random Shuffle
			});
			let n = 0;
			while (Math.random() < (this.spinAllowed ? 0.5 : 0.75) && n < bounceOutcomes.length - 1)
				n++;
			if (this.spinAllowed)
				this.targetReturnType = bounceOutcomes[n].outcomeIndex;
			else
			{
				this.targetReturnType = 0;
				this.targetOffset = bounceOutcomes[n].targetOffset;
			}

			if (this.showDebugLines)
			{
				for (let i = 0, buffIndex = 0; buffIndex < this.bouncePredictLinesPointBuffs.length; i++)
				{
					const bouncePoints: Array<Vector3> = i < bounceOutcomes.length ? bounceOutcomes[i].points : new Array<Vector3>(1).fill(Vector3.Zero());
					const pointsBuff: Array<number> = i == n ? this.selectedBouncePredictLinePointsBuff : this.bouncePredictLinesPointBuffs[buffIndex];
					for (let j = 0; j < pointsBuff.length / 3; j++)
					{
						const p: Vector3 = bouncePoints[Math.min(bouncePoints.length - 1, j)];
						pointsBuff[j * 3] = p.x;
						pointsBuff[j * 3 + 1] = p.y;
						pointsBuff[j * 3 + 2] = p.z;
					}
					if (i != n)
						buffIndex++;
				}
				this.selectedBouncePredictLine.setPoints([ this.selectedBouncePredictLinePointsBuff ]);
				this.bouncePredictLineSet.setPoints(this.bouncePredictLinesPointBuffs);
			}
		}
	}
	
	isWithinTargetOffset() : boolean
	{
		let margin = this.hitboxDepth * 0.5;
		// Reduce Margin If Arriving Late To Target
		if (this.targetTime < 0)
			margin = Math.max(0.2, margin * (1 + (this.targetTime / 0.2)));
		return Math.abs(this.offset - this.targetOffset) <= margin;
	}

	allowedToSpin() : boolean { return this.spinTimer == 0 && this.targetTime != this.noTargetTimeDefined && this.targetReturnType > 0 && this.isWithinTargetOffset(); }

	public inputUp() : boolean { return this.spinTimer <= 0 ? this.offset - this.targetOffset < -0.1 : this.targetReturnType == 2; }
	public inputDown() : boolean { return this.spinTimer <= 0 ? this.offset - this.targetOffset > 0.1 : this.targetReturnType == 3; }
	public inputForwardSpin() : boolean { return this.allowedToSpin() && this.targetTime <= this.targetSpinMargin && this.targetY <= 1; }
	public inputBackSpin() : boolean { return this.allowedToSpin() && this.targetTime <= (0.5 / this.spinSpeed) + this.targetSpinMargin && this.targetY >= 1; }
	public inputNeutralBounce() : boolean { return this.targetReturnType == 1; }

	public isArtificial() : boolean { return true; } // My Eyes Are [[ BURNING ]] Like [[ Top DVDs At Half Price! ]]
}
