/**
 * No llamar a Apps Script en orígenes de desarrollo (file://, localhost, etc.).
 * Override: LANDING_CONFIG.ALLOW_BACKEND_IN_DEV = true
 */
(function () {
  function getConfig() {
    return window.LANDING_CONFIG || {};
  }

  window.isLandingDevOrigin = function () {
    if (getConfig().ALLOW_BACKEND_IN_DEV === true) return false;

    if (location.protocol === "file:") return true;

    var h = (location.hostname || "").toLowerCase();
    if (h === "localhost" || h === "127.0.0.1" || h === "[::1]") return true;
    if (h.endsWith(".local")) return true;

    return false;
  };

  window.getLandingBackendUrl = function () {
    var url = (getConfig().FORM_SUBMIT_URL || "").trim();
    if (!url || url.indexOf("REEMPLAZAR") !== -1) return "";
    if (window.isLandingDevOrigin()) return "";
    return url;
  };
})();
