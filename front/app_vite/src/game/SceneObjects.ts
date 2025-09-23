import { Scene, Texture, Vector2, Vector3, CreateGround, CreateCylinder, Color3, Color4, Mesh, ShaderMaterial } from "@babylonjs/core";
import { Bumper } from "./Board.js";
import { ColliderGraphic, BoxColliderGraphic } from "./ColliderGraphics.js";
import { Cylinder, GenericBoxTrigger } from "./Colliders.js";
import { buildCustomMesh, createCustomMaterial, generateCustomTexture } from "./GraphicUtils.js";
import { CustomMaterialTypes } from "./MaterialData.js";
import { CustomMeshTypes } from "./MeshData.js";
import { CustomTextureTypes } from "./TextureData.js";
import { Player } from "./Player.js";
import { Puck } from "./Puck.js";

export class PlayerObject
{
	readonly refPlayer: Player;
	readonly spinSign: number;
	readonly models: Mesh[];
	mat: ShaderMaterial;
	readonly poleMesh: Mesh;
	readonly poleMat: ShaderMaterial;
	readonly color: Color4;
	whiteFlashLerp: number;
	readonly bottomTriggerGfx: BoxColliderGraphic[];
	readonly topTriggerGfx: BoxColliderGraphic[];
	hitboxGraphicsEnabled: boolean;

	public constructor(_player: Player, _scene: Scene, _camPos: Vector3, _hitboxGfx: boolean)
	{
		this.refPlayer = _player;
		this.spinSign = this.refPlayer.pivot.x > 0 ? -1 : 1;
		this.mat = createCustomMaterial(_scene, CustomMaterialTypes.UnlitColor);
		this.color = _player.pivot.x < 0 ? new Color4(0.1, 0.6, 1, 1) : new Color4(1, 0.1, 0.4, 1);
		this.mat.setColor4("color", this.color);
		this.models = [];
		for (let i = 0; i < Math.max(1, Math.floor(this.refPlayer.hitboxDepth)); i++)
		{
			const model = buildCustomMesh(_scene, CustomMeshTypes.Player);
			model.material = this.mat;
			model.renderOutline = true;
			model.outlineWidth = 0.05;
			model.outlineColor = Color3.Black();
			this.models.push(model);
		}
		this.poleMesh = CreateCylinder("pole", { diameter: 0.15, height: 12 }, _scene);
		this.poleMesh.position = new Vector3(this.refPlayer.pivot.x, 1, this.refPlayer.pivot.y);
		this.poleMesh.rotation = new Vector3(Math.PI * 0.5, 0, 0);
		if (_camPos)
		{
			this.poleMat = createCustomMaterial(_scene, CustomMaterialTypes.FresnelDX);
			this.poleMat.setColor3("fillColor", new Color3(0.95, 0.95, 1));
			this.poleMat.setColor3("edgeColor", new Color3(0.5, 0.5, 0.6));
			this.poleMat.setFloat("fresnelPower", 0.6);
			this.poleMat.setVector3("cameraPosition", _camPos);
		}
		else
		{
			this.poleMat = createCustomMaterial(_scene, CustomMaterialTypes.UnlitColor);
			this.poleMat.setColor4("color", new Color4(0.9, 0.9, 1, 1));
		}
		this.poleMesh.material = this.poleMat;
		this.poleMesh.renderOutline = true;
		this.poleMesh.outlineWidth = 0.03;
		this.poleMesh.outlineColor = Color3.Black();
		this.bottomTriggerGfx = [];
		this.topTriggerGfx = [];
		for (let i = 0; i < 4 && _hitboxGfx; i++)
		{
			const color: Color3 = [ new Color3(1, 0, 0.4), new Color3(1, 0.6, 0), new Color3(0, 1, 0.4), new Color3(0.1, 0.75, 0.9) ][i];
			this.bottomTriggerGfx.push(new BoxColliderGraphic(_scene, color, this.refPlayer.bottomTrigger.box));
			this.topTriggerGfx.push(new BoxColliderGraphic(_scene, color, this.refPlayer.topTrigger.box));
		}
		this.setHitboxGraphicsEnabled(false);
	}

	public dispose()
	{
		for (const model of this.models)
			model.dispose();
		this.models.length = 0;
		this.mat.dispose();
		this.poleMesh.dispose();
		this.poleMat.dispose();
		for (const gfx of this.bottomTriggerGfx)
			gfx.dispose();
		this.bottomTriggerGfx.length = 0;
		for (const gfx of this.topTriggerGfx)
			gfx.dispose();
		this.topTriggerGfx.length = 0;
	}

	public onUpdate(_deltaTime: number) : void
	{
		if (this.whiteFlashLerp)
		{
			this.whiteFlashLerp = Math.max(0, this.whiteFlashLerp - _deltaTime * 4);
			this.mat.setColor4("color", Color4.Lerp(this.color, new Color4(1, 1, 1, 1), this.whiteFlashLerp));
		}
	}

	public onRender()
	{
		this.updatePlayerModels();
		if (this.hitboxGraphicsEnabled)
			this.updateHitboxGraphics();
	}

	public toggleWhiteFlash(_enabled: boolean)
	{
		this.whiteFlashLerp = _enabled ? 1 : 0;
		this.mat.setColor4("color", _enabled ? new Color4(1, 1, 1, 1) : this.color);
	}

	updatePlayerModels()
	{
		let p = this.models.length > 1 ? (this.models.length - 1) * -0.5 : 0;
		p += this.refPlayer.offset;
		for (const model of this.models)
		{
			model.position = new Vector3(this.refPlayer.pivot.x, 1, this.refPlayer.pivot.y + p);
			model.rotation = new Vector3(this.refPlayer.spinAngle * this.spinSign * Math.PI / 180, Math.PI * 0.5, 0);
			p++;
		}
	}

	updateHitboxGraphics()
	{
		for (let i = 0; i < 4; i++)
		{
			this.bottomTriggerGfx[i].setEnabled(false);
			if (this.refPlayer.bottomTrigger.isActive && i == this.refPlayer.bottomTrigger.bounceStrength)
			{
				this.bottomTriggerGfx[i].updatePoints();
				this.bottomTriggerGfx[i].setEnabled(true);
			}
			this.topTriggerGfx[i].setEnabled(false);
			if (this.refPlayer.topTrigger.isActive && i == this.refPlayer.topTrigger.bounceStrength)
			{
				this.topTriggerGfx[i].updatePoints();
				this.topTriggerGfx[i].setEnabled(true);
			}
		}
	}

	public setHitboxGraphicsEnabled(_enabled: boolean) : void
	{
		this.hitboxGraphicsEnabled = _enabled;
		for (const triggerGfx of this.bottomTriggerGfx)
			triggerGfx.setEnabled(_enabled);
		for (const triggerGfx of this.topTriggerGfx)
			triggerGfx.setEnabled(_enabled);
		if (_enabled)
			this.updateHitboxGraphics();
	}
}

export class PuckObject
{
	readonly refPuck: Puck;
	readonly mesh: Mesh;
	material: ShaderMaterial;
	arrowTextures: Texture[];

	readonly defaultPuckColor: Color4;
	puckFlashLerp: number;

	public constructor(_refPuck: Puck,_scene: Scene)
	{
		this.refPuck = _refPuck;
		this.mesh = buildCustomMesh(_scene, CustomMeshTypes.Puck);
		this.material = createCustomMaterial(_scene, CustomMaterialTypes.Puck);
		this.arrowTextures = [];
		for (const textureType of [ CustomTextureTypes.PuckArrow_Down, CustomTextureTypes.PuckArrow_Forward, CustomTextureTypes.PuckArrow_Up ])
			this.arrowTextures.push(generateCustomTexture(_scene, textureType));
		this.mesh.position = new Vector3(this.refPuck.pos.x, this.refPuck.y + this.refPuck.height * 0.5, this.refPuck.pos.y);
		this.mesh.material = this.material;
		this.mesh.renderOutline = true;
		this.mesh.outlineColor = Color3.White();
		this.mesh.outlineWidth = 0.05;
		this.defaultPuckColor = new Color4(0.1, 0.1, 0.125, 1);
		this.material.setColor4("puckColor", this.defaultPuckColor);
		this.puckFlashLerp = 0;
		this.material.setTexture("topTexture", this.arrowTextures[0]);
	}

	public dispose()
	{
		this.mesh.dispose();
		this.material.dispose();
		for (let texture of this.arrowTextures)
			texture.dispose();
		this.arrowTextures.length = 0;
	}

	public onUpdate(_deltaTime: number, _flashArrowIndex: number = -1) : void
	{
		if (_flashArrowIndex >= 0)
		{
			this.puckFlashLerp = 1;
			this.material.setTexture("topTexture", this.arrowTextures[_flashArrowIndex % 3]);
			this.material.setFloat("flipTopTexture", _flashArrowIndex < 3 ? 0 : 1);
		}
		else if (this.puckFlashLerp > 0)
			this.puckFlashLerp = Math.max(0, this.puckFlashLerp - 4 * _deltaTime);
	}

	public onRender()
	{
		this.mesh.position = new Vector3(this.refPuck.pos.x, this.refPuck.y + this.refPuck.height * 0.5, this.refPuck.pos.y);
		this.material.setFloat("topTextureLerp", Math.pow(this.puckFlashLerp, 2));
		this.setWhiteFade(this.puckFlashLerp);
		this.material.setColor4("puckColor", Color4.Lerp(this.defaultPuckColor, new Color4(1, 1, 1, 1), this.puckFlashLerp));
		let ringColor: Color4;
		if (this.refPuck.isWithinBounds)
			ringColor = Color4.Lerp(new Color4(1, 1, 1, 1), new Color4(1, 0.75, 0.1, 1), Math.max(0, Math.min((this.refPuck.y - 0.9) * 5, 1)));
		else
			ringColor = this.refPuck.pos.x > 0 ? new Color4(0.1, 0.6, 1, 1) : new Color4(1, 0.1, 0.4, 1);
		this.material.setColor4("ringColor", ringColor);
	}

	public toggleWhiteFlash(_enabled: boolean)
	{
		this.puckFlashLerp = _enabled ? 1 : 0;
		this.setWhiteFade(this.puckFlashLerp);
	}

	public setWhiteFade(_fade: number) : void
	{
		this.material.setFloat("whiteFade", Math.max(0, Math.min(_fade, 1)));
	}
}

export class BumperObject
{
	readonly refBumper: Bumper;
	readonly mesh: Mesh;
	material: ShaderMaterial;

	public constructor(_refBumper: Bumper, _scene: Scene, _camPos: Vector3)
	{
		this.refBumper = _refBumper;
		const cylinder: Cylinder = _refBumper.cylinder;
	
		this.mesh = buildCustomMesh(_scene, CustomMeshTypes.Bumper);
		this.mesh.position = new Vector3(cylinder.pos.x, cylinder.startY, cylinder.pos.y);

		this.material = createCustomMaterial(_scene, CustomMaterialTypes.FresnelDX);
		this.material.setFloat("blendMin", 0.4);
		this.material.setFloat("blendMax", 0.5);
		this.material.setFloat("fresnelPower", 0.625);
		this.material.setVector3("cameraPosition", _camPos);
		this.mesh.material = this.material;
		this.mesh.renderOutline = true;
		this.mesh.outlineWidth = 0.05;
	}

	public dispose()
	{
		this.mesh.dispose();
		this.material.dispose();
	}

	public onRender()
	{
		const paletteIndex = this.refBumper.durability;
		const brightFlash: boolean = this.refBumper.hitCooldownTimer > 0 && (this.refBumper.hitCooldownTimer * 40) % 2 < 1;
		this.mesh.setEnabled(this.refBumper.isActive() || this.refBumper.hitCooldownTimer > 0);
		this.mesh.outlineColor = brightFlash ? new Color3(0.4, 0.4, 0.5) : [ new Color3(0.2, 0.2, 0.25), new Color3(1, 0, 0.25), new Color3(1, 0.75, 0), new Color3(0, 0.9, 1) ][paletteIndex];
		this.material.setColor3("fillColor", brightFlash || paletteIndex > 0 ? new Color3(1, 1, 1) : new Color3(0.75, 0.75, 0.8));
		this.material.setColor3("edgeColor", brightFlash ? new Color3(0.6, 0.6, 0.75) : [ new Color3(0.4, 0.4, 0.5), new Color3(1, 0.75, 0.8), new Color3(1, 0.95, 0.75), new Color3(0.75, 0.9, 1) ][paletteIndex]);
	}
}

export class FanSurfaceSet
{
	readonly positions: Vector2[];
	readonly meshes: Mesh[];
	readonly meshMaterials: ShaderMaterial[];
	animIndex: number;
	animTimer: number;
	readonly animFrameLength: number;
	readonly animTiles: Texture[];
	readonly animIndices: number[];
	readonly triggerGfx: ColliderGraphic[];

	public constructor(_scene: Scene, _fanTriggers: GenericBoxTrigger[], _simpleVFX: boolean)
	{
		this.meshes = [];
		this.meshMaterials = [];
		this.triggerGfx = [];
		for (const fanTrigger of _fanTriggers)
		{
			const surface = CreateGround("ground", { width: fanTrigger.box.size.x, height: fanTrigger.box.size.y });
			surface.position = new Vector3(fanTrigger.box.pos.x, -0.04, fanTrigger.box.pos.y);
			const surfaceMat = createCustomMaterial(_scene, CustomMaterialTypes.FanSurface);
			surfaceMat.setVector2("size", fanTrigger.box.size);
			surface.material = surfaceMat;
			this.meshes.push(surface);
			this.meshMaterials.push(surfaceMat);
			this.triggerGfx.push(new BoxColliderGraphic(_scene, Color3.Yellow(), (fanTrigger as GenericBoxTrigger).box));
		}
		this.animIndex = 0;
		this.animTimer = 0;
		this.animTiles = [];
		if (_simpleVFX)
		{
			for (const textureType of [ CustomTextureTypes.FloorFanTile_Simple_0, CustomTextureTypes.FloorFanTile_Simple_1, CustomTextureTypes.FloorFanTile_Simple_2 ])
				this.animTiles.push(generateCustomTexture(_scene, textureType));
			this.animIndices = [ 0, 0, 2, 1, 1, 2 ];
			this.animFrameLength = 0.125;
		}
		else
		{
			for (const textureType of [ CustomTextureTypes.FloorFanTile_0, CustomTextureTypes.FloorFanTile_1, CustomTextureTypes.FloorFanTile_2, CustomTextureTypes.FloorFanTile_3, CustomTextureTypes.FloorFanTile_4, CustomTextureTypes.FloorFanTile_5, CustomTextureTypes.FloorFanTile_6 ])
				this.animTiles.push(generateCustomTexture(_scene, textureType));
			this.animIndices = [ 0, 3, 4, 6, 5, 1, 2, 1, 5, 6, 4, 3 ];
			this.animFrameLength = 0.008;
		}
		this.updateTile();
		this.setHitboxGraphicsEnabled(false);
	}

	public dispose()
	{
		// Destroy Meshes
		for (const mesh of this.meshes)
			mesh.dispose();
		this.meshes.length = 0;
		// Destroy Materials
		for (const material of this.meshMaterials)
			material.dispose();
		this.meshMaterials.length = 0;
		// Destroy Tiles
		for (const texture of this.animTiles)
			texture.dispose();
		this.animTiles.length = 0;
		// Destroy Trigger GFX
		for (const gfx of this.triggerGfx)
			gfx.dispose();
		this.triggerGfx.length = 0;
	}

	public onUpdate(_dt: number)
	{
		this.animTimer += _dt;
		while (this.animTimer >= this.animFrameLength)
		{
			this.animIndex++;
			if (this.animIndex == this.animIndices.length)
				this.animIndex = 0;
			this.updateTile();
			this.animTimer -= this.animFrameLength;
		}
	}

	public updatePuckShadow(_pos: Vector2, _radius: number)
	{
		for (let i = 0; i < this.meshes.length; i++)
		{
			const mesh: Mesh = this.meshes[i];
			const mat: ShaderMaterial = this.meshMaterials[i];
			const offset: Vector2 = new Vector2(mesh.position.x, mesh.position.z);
			mat.setVector2("puckShadowPos", _pos.subtract(offset));
			mat.setFloat("puckShadowRadius", _radius);
		}
	}

	updateTile()
	{
		const tileIndex: number = this.animIndices[this.animIndex];
		for (const mat of this.meshMaterials)
			mat.setTexture("mainTex", this.animTiles[tileIndex]);
	}

	public setHitboxGraphicsEnabled(_enabled: boolean) : void
	{
		for (const triggerGfx of this.triggerGfx)
			triggerGfx.setEnabled(_enabled);
	}
}
