let _appElement: HTMLElement | null = null;

export function getAppElement(): HTMLElement | null
{
	if (!_appElement)
		_appElement = document.getElementById('app');
	return _appElement;
}