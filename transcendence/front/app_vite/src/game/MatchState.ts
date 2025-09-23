import { ArtificialPlayer } from "./Amaia.js";
import { Board, Bumper } from "./Board.js";
import { MatchStates, BoardManager } from "./BoardManager.js";
import { Player } from "./Player.js";
import { Puck } from "./Puck.js";

export class PuckState
{
	public readonly xPos: number;
	public readonly zPos: number;
	public readonly y: number;
	public readonly speed: number;
	public readonly incrementalSpeed: number;
	public readonly overtimeSpeed: number;
	public readonly xDir: number;
	public readonly zDir: number;
	public readonly ySpeed: number;
	public readonly updateTimer: number;
	public readonly strongBouncePlayerIndex: number;
	public readonly isWithinBounds: boolean;
	public readonly bounceChain: number;
	public readonly parryChain: number;

	public constructor(_puck: Puck)
	{
		this.xPos = _puck.pos.x;
		this.zPos = _puck.pos.y;
		this.y = _puck.y;
		this.speed = _puck.speed;
		this.incrementalSpeed = _puck.incrementalSpeed;
		this.overtimeSpeed = _puck.overtimeSpeed;
		this.xDir = _puck.dir.x;
		this.zDir = _puck.dir.y;
		this.ySpeed = _puck.ySpeed;
		this.updateTimer = _puck.updateTimer;
		this.strongBouncePlayerIndex = _puck.strongBouncePlayerIndex;
		this.isWithinBounds = _puck.isWithinBounds;
		this.bounceChain = _puck.bounceChain;
		this.parryChain = _puck.parryChain;
	}
}

export class PlayerState
{
	public readonly offset: number;
	public readonly spinAngle: number;
	public readonly spinSign: number;
	public readonly spinTimer: number;

	public constructor(_player: Player)
	{
		this.offset = _player.offset;
		this.spinAngle = _player.spinAngle;
		this.spinSign = _player.spinSign;
		this.spinTimer = _player.spinTimer;
	}
}

export class ArtificialPlayerState extends PlayerState
{
	predictTimer: number;
	targetOffset: number;
	targetY: number;
	targetReturnType: number;
	targetTime: number;
	public constructor(_player: ArtificialPlayer)
	{
		super(_player);
		this.predictTimer = _player.predictTimer;
		this.targetOffset = _player.targetOffset;
		this.targetY = _player.targetY;
		this.targetReturnType = _player.targetReturnType;
		this.targetTime = _player.targetTime;
	}
}

export class BumperState
{
	public readonly durability: number;
	public readonly hitCooldownTimer: number;

	public constructor(_bumper: Bumper)
	{
		this.durability = _bumper.durability;
		this.hitCooldownTimer = _bumper.hitCooldownTimer;
	}
}

export class BoardState
{
	public readonly playerStates: PlayerState[];
	public readonly puckState: PuckState;
	public readonly bumperStates: BumperState[];

	public constructor(_board: Board)
	{
		this.playerStates = [];
		for (const player of _board.players)
			this.playerStates.push(player.isArtificial ? new ArtificialPlayerState(player as ArtificialPlayer) : new PlayerState(player));
		this.puckState = new PuckState(_board.puck);
		this.bumperStates = [];
		for (const bumper of _board.bumpers)
			this.bumperStates.push(new BumperState(bumper));
	}
}

export class MatchState
{
	// Board Components
	public readonly boardState: BoardState;

	// Manager Data
	public currentState: MatchStates;
	public stateTimer: number;
	public overtimeFlag: boolean;
	public matchTimer: number;
	public paused: boolean;
	public showHitboxes: boolean;

	public constructor(_manager: BoardManager)
	{
		this.boardState = new BoardState(_manager.board);
		this.currentState = _manager.currentState;
		this.stateTimer = _manager.stateTimer;
		this.overtimeFlag = _manager.overtimeFlag;
		this.matchTimer = _manager.matchTimer;
		this.paused = _manager.paused;
		this.showHitboxes = _manager.showHitboxes;
	}
}