export function preventDefaultBehaviors() {
	document.addEventListener('contextmenu', function (e) {
		e.preventDefault();
		return false;
	});

	document.addEventListener('selectstart', function (e) {
		e.preventDefault();
		return false;
	});

	document.addEventListener('dragstart', function (e) {
		e.preventDefault();
		return false;
	});

	const style = document.createElement('style');
	style.textContent = `
        * {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        canvas {
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
        }
    `;
	document.head.appendChild(style);
}
