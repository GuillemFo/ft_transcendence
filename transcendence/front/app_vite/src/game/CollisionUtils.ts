import { Vector2 } from "@babylonjs/core";
import { Box, Cylinder } from "./Colliders.js";

export function cylinderInBox(_puckPos: Vector2, _puckY: number, _puckRadius: number, _puckHeight: number, _box: Box) : boolean
{
	return heightOverlap(_puckY, _puckHeight, _box.startY, _box.height) && circleInRectangle(_puckPos, _puckRadius, _box.pos.subtract(_box.size.scale(0.5)), _box.pos.add(_box.size.scale(0.5)));
}

export function cylinderInCylinder(_puckPos: Vector2, _puckY: number, _puckRadius: number, _puckHeight: number, _cylinder: Cylinder) : boolean
{
	return heightOverlap(_puckY, _puckHeight, _cylinder.startY, _cylinder.height) && circleInCircle(_puckPos, _puckRadius, _cylinder.pos, _cylinder.radius);
}

export function heightOverlap(_aStart: number, _aHeight: number, _bStart: number, _bHeight: number) : boolean
{
	return (_aStart < _bStart + _bHeight) && (_bStart < _aStart + _aHeight);
}

export function circleInRectangle(_puckPos: Vector2, _puckRadius: number, _boxMin: Vector2, _boxMax: Vector2) : boolean
{
	const xDist: number = Math.max(_boxMin.x, Math.min(_puckPos.x, _boxMax.x)) - _puckPos.x;
	const yDist: number = Math.max(_boxMin.y, Math.min(_puckPos.y, _boxMax.y)) - _puckPos.y;
	return (xDist * xDist + yDist * yDist) <= _puckRadius * _puckRadius;
}

export function circleInCircle(_aPos: Vector2, _aRadius: number, _bPos: Vector2, _bRadius: number) : boolean
{
	return Vector2.Distance(_aPos, _bPos) <= _aRadius + _bRadius;
}

export function rectangleInRectangle(_aMin: Vector2, _aMax: Vector2, _bMin: Vector2, _bMax: Vector2) : boolean
{
	return (_aMin.x < _bMax.x) && (_bMin.x < _aMax.x) && (_aMin.y < _bMax.y) && (_bMin.y < _aMax.y);
}

export function getBumperBounceDir(_puckPos: Vector2, _bumperPos: Vector2) : Vector2
{
	const fixedBounceAngles: boolean = true;
	const bounceDir: Vector2 = _puckPos.subtract(_bumperPos).normalize();
	let angle: number = Math.atan2(bounceDir.y, bounceDir.x) * 180 / Math.PI;
	if (angle < 0)
		angle += 360;
	let newAngle: number = fixedBounceAngles ? Math.round(angle / 15) * 15 : angle;
	for (let i: number = 0; i < 4; i++)
	{
		const threshold: number = 90 * i;
		if (Math.abs(newAngle - threshold) < 30) { newAngle += angle < threshold ? -30 : 30; }
	}
	newAngle *= Math.PI / 180;
	return new Vector2(Math.cos(newAngle), Math.sin(newAngle));
}