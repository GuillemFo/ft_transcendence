import { Vector2 } from "@babylonjs/core";
import { Box, Trigger, BounceStrengths, PlayerTrigger } from "./Colliders.js";
import { TrackedInputs, InputManager } from "./InputManager.js";
import { SpinModes } from "./MatchRuleset.js";
import { PlayerState } from "./MatchState.js";

export abstract class Player
{
	public readonly index: number;
	public readonly pivot: Vector2;
	readonly range: number = 4.5;
	public offset: number;
	readonly speed: number = 12;
	bottomTrigger: PlayerTrigger;
	topTrigger: PlayerTrigger;
	readonly defaultHitboxWidth: number = 0.5;
	readonly spinHitboxWidth: number = 1.5;
	readonly hitboxDepth: number = 3;
	readonly spinAllowed: boolean;
	spinAngle = 0;
	spinSign = 0;
	spinTimer: number = 0;
	totalBounces: number = 0;
	totalSpins: number = 0;
	totalSuccessfulSpins: number = 0;
	readonly spinSpeed: number = 4; // A Full Spin Lasts For 1 / n Seconds
	readonly spinCooldown: number = 0.5; // After A Full Spin, Another One Can't Be Input Until n Seconds
	readonly spinHitboxAngleMargin = 15; // Angle Difference Around 90 And 270 In Which Both Hitboxes Are Active
	readonly forgivingSpinHitbox: boolean; // If True, Both Hitboxes Are Always Active During A Spin

	public constructor(_isPlayer1: boolean, _spinMode: SpinModes)
	{
		this.pivot = new Vector2(8 * (_isPlayer1 ? -1 : 1), 0);
		this.offset = 0;
		this.index = _isPlayer1 ? 0 : 1;
		const bounceSign: number = -Math.sign(this.pivot.x);
		this.bottomTrigger = new PlayerTrigger(true, new Box(this.pivot, new Vector2(this.defaultHitboxWidth, this.hitboxDepth), 0, _spinMode == SpinModes.Disabled ? 2 : 1), this, bounceSign, false);
		this.topTrigger = new PlayerTrigger(true, new Box(this.pivot, new Vector2(this.defaultHitboxWidth, this.hitboxDepth), 1, 1), this, bounceSign, false);
		this.spinAllowed = _spinMode != SpinModes.Disabled;
		this.forgivingSpinHitbox = _spinMode == SpinModes.Lenient;
		this.totalBounces = 0;
		this.totalSpins = 0;
		this.totalSuccessfulSpins = 0;
	}

	public update(_deltaTime: number)
	{
		this.onBeforeUpdate(_deltaTime);
		const moveUp: boolean = this.inputUp();
		const moveDown: boolean = this.inputDown();
		if (moveUp && this.spinTimer <= 0)
		{
			this.offset += this.speed * _deltaTime;
			if (this.offset > this.range)
				this.offset = this.range;
		}
		if (moveDown && this.spinTimer <= 0)
		{
			this.offset -= this.speed * _deltaTime;
			if (this.offset < -this.range)
				this.offset = -this.range;
		}
		const spinForward: boolean = this.spinAllowed && this.inputForwardSpin();
		const spinBack: boolean = this.spinAllowed && this.inputBackSpin();
		if ((spinForward || spinBack) && this.spinTimer == 0)
		{
			this.spinSign = spinBack ? -1 : 1;
			this.spinTimer = 1;
			this.totalSpins++;
		}
		if (this.spinTimer > 0)
		{
			this.spinTimer -= this.spinSpeed * _deltaTime;
			if (this.spinTimer <= 0)
			{
				this.spinAngle = 0;
				this.spinTimer = -this.spinCooldown;
			}
			else
				this.spinAngle = (360 * this.spinSign * this.spinTimer + 360) % 360;
		}
		if (this.spinTimer < 0)
		{
			this.spinTimer += _deltaTime;
			if (this.spinTimer > 0)
				this.spinTimer = 0;
		}
		// Update Puck Bounce Triggers
		const triggerPos: Vector2 = new Vector2(this.pivot.x, this.pivot.y + this.offset);
		let bounceAngleSign: number = 0;
		if (this.spinTimer > 0 && (moveUp || moveDown))
			bounceAngleSign = moveUp ? 1 : -1;
		this.bottomTrigger.box.pos = triggerPos;
		this.topTrigger.box.pos = triggerPos;
		this.bottomTrigger.box.size.x = this.spinTimer > 0 ? this.spinHitboxWidth : this.defaultHitboxWidth;
		this.topTrigger.box.size.x = this.spinTimer > 0 ? this.spinHitboxWidth : this.defaultHitboxWidth;
		this.bottomTrigger.isActive = Math.abs(this.spinAngle - 180) >= (90 - this.spinHitboxAngleMargin);
		this.topTrigger.isActive = Math.abs(this.spinAngle - 180) <= (90 + this.spinHitboxAngleMargin);
		// Both Triggers Are Enabled During A Spin If 'Forgiving Spin Hitboxes' Is Enabled
		if (this.forgivingSpinHitbox && this.spinTimer > 0)
		{
			this.bottomTrigger.isActive = true;
			this.topTrigger.isActive = true;
		}
		this.bottomTrigger.bounceStrength = this.spinTimer <= 0 ? BounceStrengths.Default : this.spinSign > 0 ? BounceStrengths.Strong : BounceStrengths.Weak;
		this.topTrigger.bounceStrength = this.spinTimer <= 0 ? BounceStrengths.Default : this.spinSign < 0 ? BounceStrengths.Strong : BounceStrengths.Weak;
		this.bottomTrigger.bounceAngleSign = bounceAngleSign;
		this.topTrigger.bounceAngleSign = bounceAngleSign;
		if (!this.spinAllowed)
			this.bottomTrigger.bounceStrength = BounceStrengths.Angled;
	}

	public getTriggers() : Trigger[]
	{
		if (this.topTrigger.getNumericStrength() > this.bottomTrigger.getNumericStrength())
			return [ this.topTrigger, this.bottomTrigger ];
		else
			return [ this.bottomTrigger, this.topTrigger ];
	}

	public reset()
	{
		this.offset = 0;
		this.spinAngle = 0;
		this.spinSign = 0;
		this.spinTimer = 0;
		this.onReset();
	}

	public loadState(_state: PlayerState) : void
	{
		this.offset = _state.offset;
		this.spinAngle = _state.spinAngle;
		this.spinSign = _state.spinSign;
		this.spinTimer = _state.spinTimer;
		this.onStateLoaded(_state);
	}

	protected abstract onBeforeUpdate(_deltaTime: number) : void;
	protected abstract onStateLoaded(_state: PlayerState);
	protected abstract onReset();

	public abstract inputUp() : boolean;
	public abstract inputDown() : boolean;
	public abstract inputForwardSpin() : boolean;
	public abstract inputBackSpin() : boolean;
	public abstract inputNeutralBounce() : boolean;

	public abstract isArtificial() : boolean;
}

export class KeyboardPlayer extends Player
{
	readonly inputManager: InputManager;
	readonly upInput: TrackedInputs;
	readonly downInput: TrackedInputs;
	readonly forwardSpinInput: TrackedInputs;
	readonly backSpinInput: TrackedInputs;

	public constructor(_isPlayer1: boolean, _spinMode: SpinModes, _inputManager: InputManager)
	{
		super(_isPlayer1, _spinMode);
		this.inputManager = _inputManager;
		this.upInput = _isPlayer1 ? TrackedInputs.P1_Up : TrackedInputs.P2_Up;
		this.downInput = _isPlayer1 ? TrackedInputs.P1_Down : TrackedInputs.P2_Down;
		this.forwardSpinInput = _isPlayer1 ? TrackedInputs.P1_Right : TrackedInputs.P2_Left;
		this.backSpinInput = _isPlayer1 ? TrackedInputs.P1_Left : TrackedInputs.P2_Right;
	}

	protected onBeforeUpdate(_deltaTime: number) : void { }
	protected onStateLoaded(_state: PlayerState) : void { }
	protected onReset() : void { }

	public inputUp() : boolean { return this.inputManager.getInput(this.upInput).isPressed(); }
	public inputDown() : boolean { return this.inputManager.getInput(this.downInput).isPressed(); }
	public inputForwardSpin() : boolean { return this.inputManager.getInput(this.forwardSpinInput).isJustPressed(0.1); }
	public inputBackSpin() : boolean { return this.inputManager.getInput(this.backSpinInput).isJustPressed(0.1); }
	public inputNeutralBounce() : boolean { return this.inputManager.getInput(this.forwardSpinInput).isPressed() || this.inputManager.getInput(this.backSpinInput).isPressed(); }

	public isArtificial() : boolean { return false; }
}