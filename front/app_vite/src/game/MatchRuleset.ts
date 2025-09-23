export enum BoardLayouts { Default, DiamondPlaza, SnowedLake, JungleGym, EtherealMeadows };
export enum AmaiaRefreshRateOptions { Disabled, Slow, Medium, Fast, Constant };
export enum AmaiaPredictDuringImpactPauseOptions { Disabled, Enabled, Buffered };
export enum SpinModes { Disabled, Lenient, Precise };
export enum PuckIncrementalSpeedOptions { Disabled, Slow, Medium, Fast };
export enum CameraModes { Top, HalfTilt, FullTilt };

export class MatchRuleset
{
	public readonly boardLayout: BoardLayouts;
	public readonly targetScore: number;
	public readonly matchTime: number;
	public readonly allowTies: boolean;
	public amaiaRefreshRateOption: AmaiaRefreshRateOptions;
	public readonly amaiaImpactPredictOption: AmaiaPredictDuringImpactPauseOptions;
	public readonly spinMode: SpinModes;
	public readonly puckIncrementalSpeedOption: PuckIncrementalSpeedOptions;
	public readonly stickyCeiling: boolean;
	public readonly cameraMode: CameraModes;
	public readonly simpleVFX: boolean;

	public constructor(_boardLayout: BoardLayouts, _targetScore: number, _matchTime: number, _allowTies: boolean, _amaiaRefreshRateOption: AmaiaRefreshRateOptions, _amaiaImpactPredictOption: AmaiaPredictDuringImpactPauseOptions, _spinMode: SpinModes, _puckIncrementalSpeedOption: PuckIncrementalSpeedOptions, _stickyCeiling: boolean, _cameraMode: CameraModes, _simpleVFX: boolean)
	{
		this.boardLayout = _boardLayout;
		this.targetScore = _targetScore;
		this.matchTime = _matchTime;
		this.allowTies = _allowTies;
		this.amaiaRefreshRateOption = _amaiaRefreshRateOption;
		this.amaiaImpactPredictOption = _amaiaImpactPredictOption;
		this.spinMode = _spinMode;
		this.puckIncrementalSpeedOption = _puckIncrementalSpeedOption;
		this.stickyCeiling = _stickyCeiling;
		this.cameraMode = _cameraMode;
		this.simpleVFX = _simpleVFX;
	}

	public isSinglePlayer() : boolean { return this.amaiaRefreshRateOption != AmaiaRefreshRateOptions.Disabled; }
}
