import { Scene, Texture, RawTexture, Mesh, VertexData, ShaderMaterial, ShaderLanguage, Vector2, Color3, Color4 } from "@babylonjs/core";
import { CustomMaterialTypes, getVertexShaderCode, getFragmentShaderCode } from "./MaterialData.js";
import { CustomMeshTypes, MeshData, getMeshData } from "./MeshData.js";
import { CustomTextureTypes, TextureData, getTextureData } from "./TextureData.js";

export function generateCustomTexture(_scene: Scene, _textureType: CustomTextureTypes) : Texture
{
	const data: TextureData = getTextureData(_textureType);
	let texture = RawTexture.CreateRGBTexture(data.colors, data.width, data.height, _scene);
	texture.displayName = "[Custom] " + CustomTextureTypes[_textureType].toString();
	switch (_textureType)
	{
		case CustomTextureTypes.FloorColorGuide:
		case CustomTextureTypes.FenceTile:
			texture.wrapU = 2;
			texture.wrapV = 2;
			break;
		case CustomTextureTypes.FloorGoalTile:
		case CustomTextureTypes.FloorAirHoles:
		case CustomTextureTypes.FloorFanTile_0:
		case CustomTextureTypes.FloorFanTile_1:
		case CustomTextureTypes.FloorFanTile_2:
		case CustomTextureTypes.FloorFanTile_3:
		case CustomTextureTypes.FloorFanTile_4:
		case CustomTextureTypes.FloorFanTile_5:
		case CustomTextureTypes.FloorFanTile_6:
		case CustomTextureTypes.FloorFanTile_Simple_0:
		case CustomTextureTypes.FloorFanTile_Simple_1:
		case CustomTextureTypes.FloorFanTile_Simple_2:
			texture.wrapU = 1;
			texture.wrapV = 1;
			break;
	}
	return texture;
}

function getMaterialUniforms(_matType: CustomMaterialTypes) : string[]
{
	const uniforms: string[] = [ "world", "worldView", "worldViewProjection", "view", "projection" ];
	let extraUniforms: string[] = [];
	switch (_matType)
	{
		case CustomMaterialTypes.UnlitColor:
			extraUniforms = [ "color" ];
			break;
		case CustomMaterialTypes.UnlitTexture:
			extraUniforms = [ "mainTex", "size", "offset", "color" ];
			break;
		case CustomMaterialTypes.BoardFloor:
		case CustomMaterialTypes.BoardFloorSimple:
			extraUniforms = [ "floorColorGuide", "goalTile", "airHoleTile", "p1Color", "p2Color", "puckShadowPos", "puckShadowRadius", "puckShadowColor" ];
			if (_matType == CustomMaterialTypes.BoardFloor)
			{
				extraUniforms.push("floorInnerColor");
				extraUniforms.push("floorOuterColor");
				extraUniforms.push("floorColorSwap");
			}
			else
				extraUniforms.push("floorColor");
			break;
		case CustomMaterialTypes.FenceWall:
		case CustomMaterialTypes.FenceWallSimple:
			extraUniforms = [ "fenceTile", "fenceTop", "color" ];
			break;
		case CustomMaterialTypes.Puck:
			extraUniforms = [ "puckColor", "ringColor", "whiteFade", "topTexture", "flipTopTexture", "topTextureLerp" ];
			break;
		case CustomMaterialTypes.FresnelDX:
			extraUniforms = [ "fillColor", "edgeColor", "fresnelPower", "blendMin", "blendMax" ];
			break;
	}
	for (const extra of extraUniforms)
		uniforms.push(extra);
	return uniforms;
}

export function createCustomMaterial(_scene: Scene, _matType: CustomMaterialTypes) : ShaderMaterial
{
	let shaderMaterial = new ShaderMaterial("shader", _scene,
	{
		vertexSource: getVertexShaderCode(_matType),
		fragmentSource: getFragmentShaderCode(_matType),
	},
	{
		attributes: [ "position", "normal", "uv" ],
		uniforms: getMaterialUniforms(_matType),
		uniformBuffers: undefined,
		shaderLanguage: ShaderLanguage.GLSL
	});
	shaderMaterial.name = "[Custom] " + CustomMaterialTypes[_matType].toString();
	switch (_matType)
	{
		case CustomMaterialTypes.UnlitTexture:
			shaderMaterial.setVector2("size", new Vector2(1, 1));
			shaderMaterial.setVector2("offset", new Vector2(0, 0));
			shaderMaterial.setColor4("color", new Color4(1, 1, 1, 1));
			break;
		case CustomMaterialTypes.BoardFloor:
		case CustomMaterialTypes.BoardFloorSimple:
			shaderMaterial.setTexture("floorColorGuide", generateCustomTexture(_scene, CustomTextureTypes.FloorColorGuide));
			shaderMaterial.setTexture("goalTile", generateCustomTexture(_scene, CustomTextureTypes.FloorGoalTile));
			shaderMaterial.setTexture("airHoleTile", generateCustomTexture(_scene, CustomTextureTypes.FloorAirHoles));
			if (_matType == CustomMaterialTypes.BoardFloor)
				shaderMaterial.setFloat("floorColorSwap", 0);
			else
			{
				shaderMaterial.setColor4("floorColor", new Color4(0.08, 0.08, 0.1, 1));
				shaderMaterial.setColor4("puckShadowColor", new Color4(0.5, 0.5, 0.6, 0.6));
			}
			shaderMaterial.setColor4("p1Color", new Color4(0.1, 0.55, 1, 1));
			shaderMaterial.setColor4("p2Color", new Color4(1, 0.1, 0.32, 1));
			shaderMaterial.setVector2("puckShadowPos", Vector2.Zero());
			shaderMaterial.setFloat("puckShadowRadius", 0.5);
			break;
		case CustomMaterialTypes.FanSurface:
			shaderMaterial.setVector2("size", new Vector2(1, 1));
			shaderMaterial.setVector2("offset", new Vector2(0, 0));
			shaderMaterial.setColor4("color", new Color4(1, 1, 1, 1));
			shaderMaterial.setColor4("puckShadowColor", new Color4(0, 0, 0, 0.6));
			break;
		case CustomMaterialTypes.FenceWall:
		case CustomMaterialTypes.FenceWallSimple:
			shaderMaterial.setTexture("fenceTile", generateCustomTexture(_scene, CustomTextureTypes.FenceTile));
			shaderMaterial.setTexture("fenceTop", generateCustomTexture(_scene, CustomTextureTypes.FenceTop));
			break;
		case CustomMaterialTypes.Puck:
			shaderMaterial.setColor4("ringColor", new Color4(1, 1, 1, 1));
			shaderMaterial.setFloat("whiteFade", 0);
			shaderMaterial.setFloat("topTextureLerp", 0);
			break;
		case CustomMaterialTypes.FresnelDX:
			shaderMaterial.setFloat("fresnelPower", 1);
			shaderMaterial.setFloat("blendMin", 0.2);
			shaderMaterial.setFloat("blendMax", 0.6);
			break;
	}
	return shaderMaterial;
}

export function buildCustomMesh(_scene: Scene, _meshType: CustomMeshTypes) : Mesh
{
	const data: MeshData = getMeshData(_meshType);
	const mesh: Mesh = new Mesh("[Custom] " + CustomMeshTypes[_meshType].toString() + " (" + data.name + ")", _scene);
	let vertexData = new VertexData();

	vertexData.positions = data.positions;
	vertexData.indices = data.indices;
	vertexData.normals = data.normals;
	vertexData.tangents = data.tangents;
	vertexData.uvs = data.uvs;

	vertexData.applyToMesh(mesh);
	return mesh;
}
