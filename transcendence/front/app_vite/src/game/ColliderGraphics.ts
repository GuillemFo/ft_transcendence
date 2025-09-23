import { Scene, Vector3, Color3, GreasedLineBaseMesh, CreateGreasedLine } from "@babylonjs/core";
import { Box, Cylinder } from "./Colliders.js";

export abstract class ColliderGraphic
{
	lineSet: GreasedLineBaseMesh;
	pointBuffs: Array<number>[];
	public constructor(_scene: Scene, _color: Color3)
	{
		this.pointBuffs = [];
		for (const pointCount of this.getPointCounts())
			this.pointBuffs.push(new Array<number>(3 * pointCount).fill(0));
		this.lineSet = CreateGreasedLine("edge", { points: this.pointBuffs, updatable: true }, { color: _color, width: 0.05 }, _scene);
		this.setEnabled(false);
	}

	public updatePoints() : void
	{
		let i = 0;
		for (const linePoints of this.getPoints())
		{
			let j = 0;
			for (let v of linePoints)
			{
				this.pointBuffs[i][j * 3] = v.x;
				this.pointBuffs[i][j * 3 + 1] = v.y;
				this.pointBuffs[i][j * 3 + 2] = v.z;
				j++;
			}
			i++;
		}
		this.lineSet.setPoints(this.pointBuffs);
	}

	protected abstract getPointCounts() : Array<number>;
	protected abstract getPoints() : Array<Array<Vector3>>;

	public setEnabled(_enabled: boolean) : void
	{
		this.lineSet.setEnabled(_enabled);
	}

	public dispose()
	{
		this.lineSet.dispose(true, true);
	}
}

export class BoxColliderGraphic extends ColliderGraphic
{
	readonly refBox: Box;
	public constructor (_scene: Scene, _color: Color3, _box: Box)
	{
		super(_scene, _color);
		this.refBox = _box;
	}

	protected getPointCounts(): Array<number> { return [ 5, 5, 2, 2, 2, 2 ]; }
	protected getPoints(): Array<Array<Vector3>>
	{
		const bottomPivot: Vector3 = new Vector3(this.refBox.pos.x, this.refBox.startY, this.refBox.pos.y);
		const topPivot: Vector3 = bottomPivot.add(new Vector3(0, this.refBox.height, 0));
		let pivotOffsets: Vector3[] = [];
		for (let i = 0; i < 4; i++)
			pivotOffsets.push(new Vector3(this.refBox.size.x * 0.5 * (i < 2 ? 1 : -1), 0, this.refBox.size.y * 0.5 * (i < 1 || i > 2 ? 1 : -1)));
		let pointSet = [];
		for (let i = 0; i < 6; i++)
		{
			let points: Vector3[] = [];
			if (i < 2)
				for (let j = 0; j < 5; j++)
					points.push((i == 0 ? bottomPivot : topPivot).add(pivotOffsets[j % 4]));
			else
				points = [ pointSet[0][i - 2], pointSet[1][i - 2] ];
			pointSet.push(points);
		}
		return pointSet;
	}
}

export class CylinderColliderGraphic extends ColliderGraphic
{
	readonly refCylinder: Cylinder;
	public constructor (_scene: Scene, _color: Color3, _cylinder: Cylinder)
	{
		super(_scene, _color);
		this.refCylinder = _cylinder;
	}

	getCirclePointCount() : number { return 12; }

	protected getPointCounts(): Array<number> { return [ this.getCirclePointCount() + 1, this.getCirclePointCount() + 1, 2, 2, 2, 2 ]; }
	protected getPoints(): Array<Array<Vector3>>
	{
		const bottomPivot: Vector3 = new Vector3(this.refCylinder.pos.x, this.refCylinder.startY, this.refCylinder.pos.y);
		const topPivot: Vector3 = bottomPivot.add(new Vector3(0, this.refCylinder.height, 0));
		let pivotOffsets: Vector3[] = [];
		for (let i = 0; i < 4; i++)
			pivotOffsets.push(new Vector3(this.refCylinder.radius * [ 0, 1, 0, -1 ][i], 0, this.refCylinder.radius * [ 1, 0, -1, 0 ][i]));
		let pointSet = [];
		for (let i = 0; i < 6; i++)
		{
			let points: Vector3[] = [];
			if (i < 2)
			{
				for (let j = 0; j < this.getCirclePointCount() + 1; j++)
				{
					const angle = Math.PI * 2 * j / this.getCirclePointCount();
					points.push((i == 0 ? bottomPivot : topPivot).add(new Vector3(Math.sin(angle), 0, Math.cos(angle)).scale(this.refCylinder.radius)));
				}
			}
			else
				points = [ bottomPivot.add(pivotOffsets[i - 2]), topPivot.add(pivotOffsets[i - 2]) ];
			pointSet.push(points);
		}
		return pointSet;
	}
}