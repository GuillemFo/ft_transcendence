export enum CustomMaterialTypes { UVTest, UnlitColor, UnlitTexture, BoardFloor, BoardFloorSimple, FanSurface, FenceWall, FenceWallSimple, Puck, FresnelDX };

export function getVertexShaderCode(_matType: CustomMaterialTypes) : string
{
	switch (_matType)
	{
		case CustomMaterialTypes.FresnelDX:
			return getFresnelVertexShader();
	}
	return getDefaultVertexShader();
}

export function getFragmentShaderCode(_matType: CustomMaterialTypes) : string
{
	switch (_matType)
	{
		case CustomMaterialTypes.UVTest:
			return getUVTestFragmentShader();
		case CustomMaterialTypes.UnlitColor:
			return getUnlitColorFragmentShader();
		case CustomMaterialTypes.UnlitTexture:
			return getUnlitTextureFragmentShader();
		case CustomMaterialTypes.BoardFloor:
			return getBoardFloorFragmentShader();
		case CustomMaterialTypes.BoardFloorSimple:
			return getBoardFloorSimpleFragmentShader();
		case CustomMaterialTypes.FanSurface:
			return getFanSurfaceFragmentShader();
		case CustomMaterialTypes.FenceWall:
			return getFenceWallFragmentShader();
		case CustomMaterialTypes.FenceWallSimple:
			return getFenceWallSimpleFragmentShader();
		case CustomMaterialTypes.Puck:
			return getPuckFragmentShader();
		case CustomMaterialTypes.FresnelDX:
			return getFresnelFragmentShader();
	}
	console.log("No Defined Return in getFragmentShaderCode() For " + _matType);
	return "";
}

function getDefaultVertexShader() : string
{
	return `precision highp float;

// Attributes
attribute vec3 position;
attribute vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;

// Varying
varying vec2 vUV;

void main(void) {
	gl_Position = worldViewProjection * vec4(position, 1.0);
	vUV = uv;
}`;
}

function getFresnelVertexShader() : string
{
	return `#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec3 normal;

// Uniforms
uniform mat4 world;
uniform mat4 worldViewProjection;

// Varying
out vec3 vPositionW;
out vec3 vNormalW;

void main(void) {
	vec4 outPosition = worldViewProjection * vec4(position, 1.0);
	gl_Position = outPosition;

	vPositionW = vec3(world * vec4(position, 1.0));
	vNormalW = normalize(vec3(world * vec4(normal, 0.0)));
}`;
}

function getUVTestFragmentShader() : string
{
	return `precision highp float;

varying vec2 vUV;

void main(void) {
	gl_FragColor = vec4(vUV.x, vUV.y, 0, 1);
}`;
}

function getUnlitColorFragmentShader() : string
{
	return `precision highp float;

varying vec2 vUV;

uniform vec4 color;

void main(void) {
	gl_FragColor = color;
}`;
}

function getUnlitTextureFragmentShader() : string
{
	return `precision highp float;

varying vec2 vUV;

uniform sampler2D mainTex;
uniform vec2 size;
uniform vec2 offset;
uniform vec4 color;

void main(void) {
	gl_FragColor = texture2D(mainTex, vUV * size - offset) * color;
}`;
}

function getBoardFloorFragmentShader() : string
{
	return `precision highp float;

varying vec2 vUV;

uniform sampler2D floorColorGuide;
uniform sampler2D goalTile;
uniform sampler2D airHoleTile;
uniform vec4 floorInnerColor;
uniform vec4 floorOuterColor;
uniform float floorColorSwap;
uniform vec4 p1Color;
uniform vec4 p2Color;
uniform vec2 puckShadowPos;
uniform float puckShadowRadius;
uniform vec4 puckShadowColor;

vec4 getFloorColor()
{
	vec4 a = floorInnerColor;
	vec4 b = floorOuterColor;
	return mix(mix(a, b, floorColorSwap), mix(b, a, floorColorSwap), clamp((pow(vUV.x - 0.5, 2.) + pow(vUV.y - 0.5, 2.)) * 4., 0., 1.));
}

float getFloorBorderAmount(vec2 _uv)
{
	vec2 floorSize = vec2(24, 12);
	float borderMargin = 0.5;
	_uv *= floorSize;
	return smoothstep(0., borderMargin, _uv.x) * smoothstep(floorSize.x, floorSize.x - borderMargin, _uv.x) * smoothstep(0., borderMargin, _uv.y) * smoothstep(floorSize.y, floorSize.y - borderMargin, _uv.y);
}

vec4 getColorFromGuide(vec4 _guideCol, vec4 _floorCol, vec4 _playerCol)
{
	return mix(mix(vec4(0, 0, 0, 1), _playerCol, _guideCol.g), mix(_floorCol, vec4(1, 1, 1, 1), _guideCol.g), _guideCol.r);
}

void main(void) {
	vec4 guideCol = texture2D(floorColorGuide, vUV * 2. + vec2(0, 1));
	vec4 goalTapeGuideCol = texture2D(goalTile, vUV * vec2(24, 12));
	vec4 floorColor = getFloorColor();
	vec4 playerColor = mix(p1Color, p2Color, step(0.5, vUV.x));
	gl_FragColor = mix(getColorFromGuide(guideCol, floorColor, playerColor), getColorFromGuide(goalTapeGuideCol, floorColor, playerColor), guideCol.b);
	float airHoleLerp = texture2D(airHoleTile, vUV * vec2(24, 12) * 2.).r;
	gl_FragColor = mix(gl_FragColor, vec4(0, 0, 0, 1), airHoleLerp) * getFloorBorderAmount(vUV);
	vec2 puckDiff = ((puckShadowPos + vec2(12, 6)) / vec2(24, 12) - vUV) * vec2(24, 12);
	float puckDist = sqrt(pow(puckDiff.x, 2.) + pow(puckDiff.y, 2.));
	glFragColor = mix(gl_FragColor, puckShadowColor, smoothstep(puckShadowRadius + 0.05, puckShadowRadius, puckDist) * puckShadowColor.a);
	glFragColor.a = 1.;
}`;
}

function getBoardFloorSimpleFragmentShader() : string
{
	return `precision highp float;

varying vec2 vUV;

uniform sampler2D floorColorGuide;
uniform sampler2D goalTile;
uniform sampler2D airHoleTile;
uniform vec4 floorColor;
uniform vec4 p1Color;
uniform vec4 p2Color;
uniform vec2 puckShadowPos;
uniform float puckShadowRadius;
uniform vec4 puckShadowColor;

vec4 getColorFromGuide(vec4 _guideCol, vec4 _floorCol, vec4 _playerCol)
{
	return mix(mix(vec4(0, 0, 0, 1), _playerCol, _guideCol.g), mix(_floorCol, vec4(1, 1, 1, 1), _guideCol.g), _guideCol.r);
}

void main(void) {
	vec4 guideCol = texture2D(floorColorGuide, vUV * 2. + vec2(0, 1));
	vec4 goalTapeGuideCol = texture2D(goalTile, vUV * vec2(24, 12));
	vec4 playerColor = mix(p1Color, p2Color, step(0.5, vUV.x));
	gl_FragColor = mix(getColorFromGuide(guideCol, floorColor, playerColor), getColorFromGuide(goalTapeGuideCol, floorColor, playerColor), guideCol.b);
	float airHoleLerp = texture2D(airHoleTile, vUV * vec2(24, 12) * 2.).r;
	gl_FragColor = mix(gl_FragColor, vec4(0, 0, 0, 1), airHoleLerp);
	vec2 puckDiff = ((puckShadowPos + vec2(12, 6)) / vec2(24, 12) - vUV) * vec2(24, 12);
	float puckDist = sqrt(pow(puckDiff.x, 2.) + pow(puckDiff.y, 2.));
	glFragColor = mix(gl_FragColor, puckShadowColor, smoothstep(puckShadowRadius + 0.05, puckShadowRadius, puckDist) * puckShadowColor.a);
	glFragColor.a = 1.;
}`;
}

function getFanSurfaceFragmentShader() : string
{
	return `precision highp float;

varying vec2 vUV;

uniform sampler2D mainTex;
uniform vec2 size;
uniform vec2 offset;
uniform vec4 color;
uniform vec2 puckShadowPos;
uniform float puckShadowRadius;
uniform vec4 puckShadowColor;

void main(void) {
	glFragColor = texture2D(mainTex, vUV * size - offset) * color;
	// glFragColor = vec4(1, 1, 0, 1);
	vec2 puckDiff = ((puckShadowPos + size * 0.5) / size - vUV) * size;
	float puckDist = sqrt(pow(puckDiff.x, 2.) + pow(puckDiff.y, 2.));
	glFragColor = mix(gl_FragColor, puckShadowColor, smoothstep(puckShadowRadius + 0.05, puckShadowRadius, puckDist) * puckShadowColor.a);
	glFragColor.a = 1.;
	// glFragColor = texture2D(mainTex, vUV * size - offset) * color;
}`;
}

function getFenceWallFragmentShader() : string
{
	return `precision highp float;

varying vec2 vUV;

uniform sampler2D fenceTile;
uniform sampler2D fenceTop;
uniform vec4 color;

float getFloorBorderAmount(vec2 _uv)
{
	vec2 floorSize = vec2(24, 2);
	float borderMargin = 0.5;
	_uv *= floorSize;
	return smoothstep(0., borderMargin, _uv.x) * smoothstep(floorSize.x, floorSize.x - borderMargin, _uv.x) * smoothstep(0., borderMargin, _uv.y);
}

void main(void) {
	vec2 fenceUV = vUV * vec2(24, 2) * 2.;
	vec4 guideCol = texture2D(fenceTile, fenceUV * 2.5);
	vec4 topCol = texture2D(fenceTop, fenceUV - vec2(0, 3));
	guideCol = mix(topCol, guideCol, topCol.b);
	// if (guideCol.r < 0.1) { discard; } // BG is already black
	gl_FragColor = mix(vec4(0, 0, 0, 1), mix(color, vec4(1, 1, 1, 1), guideCol.g), guideCol.r * getFloorBorderAmount(vUV));
}`;
}

function getFenceWallSimpleFragmentShader() : string
{
	return `precision highp float;

varying vec2 vUV;

uniform sampler2D fenceTile;
uniform sampler2D fenceTop;
uniform vec4 color;

void main(void) {
	vec2 fenceUV = vUV * vec2(24, 2) * 2.;
	vec4 guideCol = texture2D(fenceTile, fenceUV * 2.5);
	vec4 topCol = texture2D(fenceTop, fenceUV - vec2(0, 3));
	guideCol = mix(topCol, guideCol, topCol.b);
	// if (guideCol.r < 0.1) { discard; } // BG is already black
	gl_FragColor = mix(vec4(0, 0, 0, 1), mix(color, vec4(1, 1, 1, 1), guideCol.g), guideCol.r);
}`;
}

function getPuckFragmentShader() : string
{
	return `precision highp float;

varying vec2 vUV;

uniform vec4 puckColor;
uniform vec4 ringColor;
uniform float whiteFade;
uniform sampler2D topTexture;
uniform float flipTopTexture;
uniform float topTextureLerp;

void main(void) {
	vec2 center_diff = vUV - vec2(0.25, 0.25);
	float dist = sqrt(pow(center_diff.x, 2.) + pow(center_diff.y, 2.));
	float target_dist = 0.15;
	float dist_margin = 0.025;
	float inner_ring = smoothstep(target_dist - dist_margin, target_dist, dist);
	float outer_ring = smoothstep(target_dist + dist_margin, target_dist, dist);
	gl_FragColor = mix(mix(puckColor, ringColor, pow(inner_ring * outer_ring, 0.25)), vec4(1, 1, 1, 1), whiteFade);
	vec2 arrowUV = vUV * 4. - vec2(1, 1) * 0.5;
	arrowUV.x = mix(arrowUV.x, 1. - arrowUV.x, flipTopTexture);
	gl_FragColor = mix(gl_FragColor, texture2D(topTexture, arrowUV), topTextureLerp * step(vUV.y, 0.5));
}`;
}

function getFresnelFragmentShader() : string
{
	return `#version 300 es
precision highp float;

// Lights
in vec3 vPositionW;
in vec3 vNormalW;

// eepy
uniform vec3 fillColor;
uniform vec3 edgeColor;
uniform float fresnelPower;
uniform float blendMin;
uniform float blendMax;

// Refs
uniform vec3 cameraPosition;
uniform sampler2D mainTex;

out vec4 fragColor;

void main(void) {
	vec3 viewDirectionW = normalize(cameraPosition - vPositionW);

	// Fresnel
	float fresnelTerm = dot(viewDirectionW, vNormalW);
	fresnelTerm = clamp(1.0 - fresnelTerm, 0., 1.);

	fragColor = vec4(mix(fillColor, edgeColor, smoothstep(blendMin, blendMax, pow(fresnelTerm, fresnelPower))), 1.);
}`;
}
