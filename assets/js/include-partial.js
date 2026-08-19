/**
 * Loads a header/footer partial into the page at the script tag position.
 * Uses a synchronous request so the markup exists before jQuery plugins run,
 * which keeps the current layout and GitHub Pages static hosting intact.
 *
 * [[root]] in partials is replaced with "" on root pages and "../" in
 * services/ and blog/ so relative links stay the same as before.
 */
(function () {
    "use strict";

    var script = document.currentScript;
    if (!script) {
        return;
    }

    var file = script.getAttribute("data-include");
    if (!file) {
        return;
    }

    var root = file.indexOf("../") === 0 ? "../" : "";
    var request = new XMLHttpRequest();

    request.open("GET", file + (file.indexOf("?") === -1 ? "?v=20260819x" : "&v=20260819x"), false);
    request.send(null);

    if (request.status !== 200 && request.status !== 0) {
        return;
    }

    var html = String(request.responseText)
        .replace(/\[\[root\]\]/g, root)
        .replace(/\[\[year\]\]/g, String(new Date().getFullYear()));

    document.write(html);
})();
