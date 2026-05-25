(function () {
  var cfg = window.LANDING_CONFIG || {};
  var base = (cfg.TALLY_FORM_URL || "").trim();
  if (!base || base.indexOf("REEMPLAZAR") !== -1) return;

  var params = new URLSearchParams(window.location.search);
  var hidden = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var qs = new URLSearchParams();

  hidden.forEach(function (key) {
    var v = params.get(key);
    if (v) qs.set(key, v);
  });

  var url = base;
  var extra = qs.toString();
  if (extra) url += (base.indexOf("?") === -1 ? "?" : "&") + extra;

  document.querySelectorAll("[data-tally-apply]").forEach(function (el) {
    el.setAttribute("href", url);
  });
})();
