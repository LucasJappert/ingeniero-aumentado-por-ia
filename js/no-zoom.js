/**
 * Bloquea pinch-zoom en iOS/WebKit (Brave, Safari, etc.).
 * Apple ignora user-scalable=no; gesture + touch + viewport lock son necesarios.
 */
(function () {
	var doc = document.documentElement;
	var viewportLocked =
		"width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no";

	function preventDefault(e) {
		e.preventDefault();
	}

	doc.addEventListener("gesturestart", preventDefault, { passive: false });
	doc.addEventListener("gesturechange", preventDefault, { passive: false });
	doc.addEventListener("gestureend", preventDefault, { passive: false });

	document.addEventListener(
		"touchstart",
		function (e) {
			if (e.touches.length > 1) {
				preventDefault(e);
			}
		},
		{ passive: false, capture: true }
	);

	document.addEventListener(
		"touchmove",
		function (e) {
			if (e.touches.length > 1) {
				preventDefault(e);
			}
		},
		{ passive: false, capture: true }
	);

	var meta = document.querySelector('meta[name="viewport"]');

	function relockViewport() {
		if (!meta || !window.visualViewport) {
			return;
		}
		if (window.visualViewport.scale > 1.01) {
			meta.setAttribute("content", viewportLocked);
		}
	}

	if (window.visualViewport) {
		window.visualViewport.addEventListener("resize", relockViewport);
		window.visualViewport.addEventListener("scroll", relockViewport);
	}
})();
