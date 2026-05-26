/**
 * Eventos de funnel → misma URL que FORM_SUBMIT_URL (Apps Script, type: "event").
 * Opcional: incluir con <script src="js/landing-events.js" defer></script>
 */
(function () {
  var SESSION_KEY = "iaah_session_id";
  var SENT = {};

  function getConfig() {
    return window.LANDING_CONFIG || {};
  }

  function getEndpoint() {
    var url = (getConfig().FORM_SUBMIT_URL || "").trim();
    if (!url || url.indexOf("REEMPLAZAR") !== -1) return "";
    return url;
  }

  function readUtms() {
    var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    var params = new URLSearchParams(window.location.search);
    var out = {};
    keys.forEach(function (key) {
      var v = params.get(key);
      if (v) out[key] = v;
    });
    return out;
  }

  function sessionId() {
    try {
      var existing = sessionStorage.getItem(SESSION_KEY);
      if (existing) return existing;
      var id =
        "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(SESSION_KEY, id);
      return id;
    } catch (e) {
      return "s_anon";
    }
  }

  function pageName() {
    var path = (window.location.pathname || "").split("/").pop() || "index.html";
    return path.indexOf("gracias") !== -1 ? "gracias" : "index";
  }

  function sendEvent(name, section) {
    var endpoint = getEndpoint();
    if (!endpoint) return;

    var dedupeKey = name + "|" + (section || "");
    if (SENT[dedupeKey]) return;
    SENT[dedupeKey] = true;

    var utms = readUtms();
    var payload = {
      type: "event",
      event: name,
      section: section || "",
      page: pageName(),
      session_id: sessionId(),
      utm_source: utms.utm_source || "",
      utm_medium: utms.utm_medium || "",
      utm_campaign: utms.utm_campaign || "",
      utm_content: utms.utm_content || "",
      utm_term: utms.utm_term || "",
    };

    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([JSON.stringify(payload)], { type: "text/plain;charset=utf-8" });
        navigator.sendBeacon(endpoint, blob);
        return;
      }
    } catch (e) {
      /* fallback fetch */
    }

    fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(function () {
      /* silencioso */
    });
  }

  function bindSectionTracking() {
    var map = {
      "card--programa": { event: "section_programa", section: "programa" },
      profe: { event: "section_profe", section: "profe" },
    };

    Object.keys(map).forEach(function (classPart) {
      var el = document.querySelector("." + classPart);
      if (!el || el.tagName !== "DETAILS") return;
      el.addEventListener("toggle", function () {
        if (el.open) sendEvent(map[classPart].event, map[classPart].section);
      });
    });

    var apply = document.getElementById("aplicar");
    if (apply && "IntersectionObserver" in window) {
      var seenForm = false;
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (seenForm || !entry.isIntersecting) return;
            seenForm = true;
            sendEvent("form_visible", "aplicar");
          });
        },
        { threshold: 0.25 }
      );
      obs.observe(apply);
    }
  }

  function bindFormStepTracking() {
    var form = document.getElementById("apply-form");
    if (!form) return;

    var next = document.getElementById("form-next");
    if (next) {
      next.addEventListener("click", function () {
        var step = Number(form.getAttribute("data-current-step") || "1");
        if (step === 1) {
          window.setTimeout(function () {
            if (Number(form.getAttribute("data-current-step") || "1") === 2) {
              sendEvent("form_step_2", "aplicar");
            }
          }, 0);
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var page = pageName();
    if (page === "gracias") {
      sendEvent("thank_you_view", "gracias");
      return;
    }

    sendEvent("landing_view", "hero");
    bindSectionTracking();
    bindFormStepTracking();
  });
})();
