import { Vector2, Vector3 } from "@babylonjs/core";

export function FormatVector2(v: Vector2, decimals: number) : string
{
	return "(" + v.x.toFixed(decimals) + ", " + v.y.toFixed(decimals) + ")";
}

export function FormatVector3(v: Vector3, decimals: number) : string
{
	return "(" + v.x.toFixed(decimals) + ", " + v.y.toFixed(decimals) + ", " + v.z.toFixed(decimals) + ")";
}
