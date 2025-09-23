import { TextBlock, Rectangle, Button } from "@babylonjs/gui/2D";

export interface ManualResponsiveObject
{
	onResize(_scale: number) : void;
}

export class ManualResponsiveRectangle implements ManualResponsiveObject
{
	readonly rectangle: Rectangle;
	readonly defaultCornerRadius: number;
	readonly defaultThickness: number;

	public constructor(_rectangle: Rectangle)
	{
		this.rectangle = _rectangle;
		this.defaultCornerRadius = _rectangle.cornerRadius;
		this.defaultThickness = _rectangle.thickness;
	}

	public onResize(_scale: number): void
	{
		this.rectangle.cornerRadius = this.defaultCornerRadius * _scale;
		this.rectangle.thickness = this.defaultThickness * _scale;
	}
}

export class ManualResponsiveTextBlock implements ManualResponsiveObject
{
	readonly textBlock: TextBlock;
	readonly defaultFontSize: number;
	readonly defaultOutlineWidth: number;

	public constructor(_textBlock: TextBlock)
	{
		this.textBlock = _textBlock;
		this.defaultFontSize = _textBlock.fontSizeInPixels;
		this.defaultOutlineWidth = _textBlock.outlineWidth;
	}

	public onResize(_scale: number): void
	{
		this.textBlock.fontSize = this.defaultFontSize * _scale;
		this.textBlock.outlineWidth = this.defaultOutlineWidth * _scale;
	}
}

export class ManualResponsiveButton implements ManualResponsiveObject
{
	readonly button: Button;
	readonly defaultCornerRadius: number;
	readonly defaultThickness: number;
	readonly defaultFontSize: number;

	public constructor(_button: Button)
	{
		this.button = _button;
		this.defaultCornerRadius = _button.cornerRadius;
		this.defaultThickness = _button.thickness;
		this.defaultFontSize = _button.children[0].fontSizeInPixels;
	}

	public onResize(_scale: number): void
	{
		this.button.cornerRadius = this.defaultCornerRadius * _scale;
		this.button.thickness = this.defaultThickness * _scale;
		this.button.children[0].fontSize = this.defaultFontSize * _scale;
	}
}
