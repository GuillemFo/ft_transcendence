import { Engine, DeviceSourceManager, DeviceType } from "@babylonjs/core";

export abstract class Input
{
	private pressed: boolean;
	private stateTimer: number;

	public constructor()
	{
		this.pressed = false;
		this.stateTimer = 0;
	}

	public update(_dsm: DeviceSourceManager, _dt: number) : void
	{
		if (this.pressed != this.inputPressed(_dsm))
		{
			this.pressed = !this.pressed;
			this.stateTimer = 0;
		}
		else
			this.stateTimer += _dt;
	}

	protected abstract inputPressed(_dsm: DeviceSourceManager) : boolean;

	public isPressed() : boolean { return this.pressed; }
	public isReleased() : boolean { return !this.pressed; }
	public isJustPressed(_margin: number = 0) : boolean { return this.isPressed() && this.stateTimer <= _margin; }
	public isJustReleased(_margin: number = 0) : boolean { return this.isReleased() && this.stateTimer <= _margin; }
}

class KeyboardInput extends Input
{
	private inputKey: number;

	public constructor(_inputKey: number)
	{
		super();
		this.inputKey = _inputKey;
	}

	protected inputPressed(_dsm: DeviceSourceManager): boolean { return _dsm.getDeviceSource(DeviceType.Keyboard)?.getInput(this.inputKey) === 1; }
}

export class VirtualInput extends Input // bro is an SR-Latch
{
	private pressedFlag: boolean;

	public constructor()
	{
		super();
		this.pressedFlag = false;
	}

	protected inputPressed(_dsm: DeviceSourceManager): boolean { return this.pressedFlag; }

	public setPressedFlag() { this.pressedFlag = true; }
	public resetPressedFlag() { this.pressedFlag = false; }
}

export enum TrackedInputs { SaveState, LoadState, HitboxGraphicsToggle, FrameAdvance, Pause, P1_Up, P1_Down, P1_Left, P1_Right, P2_Up, P2_Down, P2_Left, P2_Right };

enum KeyboardKeycodes { Q = 81, E = 69, H = 72, F = 70, Space = 32, W = 87, S = 83, A = 65, D = 68, I = 73, K = 75, J = 74, L = 76 };

export class InputManager
{
	dsm: DeviceSourceManager;
	public readonly hasTouchScreen: boolean;
	keyboardInputs: KeyboardInput[] = [];
	virtualInputs: VirtualInput[] = [];

	public constructor(_engine: Engine)
	{
		this.dsm = new DeviceSourceManager(_engine);
		this.hasTouchScreen = this.touchScreenDetected();
		
		this.keyboardInputs =
		[
			new KeyboardInput(KeyboardKeycodes.Q),
			new KeyboardInput(KeyboardKeycodes.E),
			new KeyboardInput(KeyboardKeycodes.H),
			new KeyboardInput(KeyboardKeycodes.F),
			new KeyboardInput(KeyboardKeycodes.Space),
			new KeyboardInput(KeyboardKeycodes.W),
			new KeyboardInput(KeyboardKeycodes.S),
			new KeyboardInput(KeyboardKeycodes.A),
			new KeyboardInput(KeyboardKeycodes.D),
			new KeyboardInput(KeyboardKeycodes.I),
			new KeyboardInput(KeyboardKeycodes.K),
			new KeyboardInput(KeyboardKeycodes.J),
			new KeyboardInput(KeyboardKeycodes.L)
		];

		this.virtualInputs = Array<VirtualInput>(this.keyboardInputs.length);
		for (let i = 0; i < this.virtualInputs.length; i++)
			this.virtualInputs[i] = new VirtualInput();
	}

	touchScreenDetected() : boolean // i may have trust issues
	{
		if (window.PointerEvent && ("maxTouchPoints" in navigator))
			return navigator.maxTouchPoints > 0;
		else if (window.matchMedia && (window.matchMedia("(any-pointer:coarse)").matches || window.matchMedia("(hover: none)").matches))
			return true;
		else if (window.TouchEvent || ("ontouchstart" in window))
			return true;
		return false;
	}

	public update(_dt: number) : void
	{
		for (const input of this.keyboardInputs)
			input.update(this.dsm, _dt);
		for (const input of this.virtualInputs)
			input.update(this.dsm, _dt);
	}

	public getInput(_inputIndex: TrackedInputs) : Input { return this.hasTouchScreen ? this.virtualInputs[_inputIndex] : this.keyboardInputs[_inputIndex]; }
}