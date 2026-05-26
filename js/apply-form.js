(function () {
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var REQUIRED_RADIOS = ["experiencia", "ia_codear"];
  var AREA_NINGUNA = "Ninguna";
  var COSTARIA_MIN_LEN = 15;
  var TOTAL_STEPS = 2;
  var STEP_LABELS = ["Contacto", "Tu perfil"];

  function getConfig() {
    return window.LANDING_CONFIG || {};
  }

  function readUtmsFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var out = {};
    UTM_KEYS.forEach(function (key) {
      var v = params.get(key);
      if (v) out[key] = v;
    });
    return out;
  }

  function fillUtmHiddenFields(form) {
    var utms = readUtmsFromUrl();
    UTM_KEYS.forEach(function (key) {
      var input = form.querySelector('[name="' + key + '"]');
      if (input) input.value = utms[key] || "";
    });
  }

  function buildThankYouUrl(cfg) {
    var path = (cfg.THANK_YOU_PATH || "gracias.html").trim();
    var base = path.indexOf("http") === 0 ? path : new URL(path, window.location.href).href;
    var url = new URL(base);
    var utms = readUtmsFromUrl();
    Object.keys(utms).forEach(function (key) {
      url.searchParams.set(key, utms[key]);
    });
    return url.toString();
  }

  function getSubmitUrl(cfg) {
    var url = (cfg.FORM_SUBMIT_URL || "").trim();
    if (!url || url.indexOf("REEMPLAZAR") !== -1) return "";
    return url;
  }

  function trimVal(form, name) {
    var el = form.elements[name];
    if (!el) return "";
    if (el.length !== undefined && el.type !== "select-one") {
      var checked = form.querySelector('input[name="' + name + '"]:checked');
      return checked ? checked.value : "";
    }
    return (el.value || "").toString().trim();
  }

  function hasRadio(form, name) {
    return !!form.querySelector('input[name="' + name + '"]:checked');
  }

  function isPaisValid(form) {
    return hasRadio(form, "pais");
  }

  function areaCount(form) {
    return form.querySelectorAll('input[name="areas"]:checked').length;
  }

  function step1Complete(form) {
    return trimVal(form, "nombre") && trimVal(form, "whatsapp") && isPaisValid(form);
  }

  function step2FieldsComplete(form) {
    for (var i = 0; i < REQUIRED_RADIOS.length; i++) {
      if (!hasRadio(form, REQUIRED_RADIOS[i])) return false;
    }
    if (areaCount(form) < 1) return false;
    if (trimVal(form, "costaria").length < COSTARIA_MIN_LEN) return false;
    return true;
  }

  function step2Complete(form) {
    return step1Complete(form) && step2FieldsComplete(form);
  }

  function isFormComplete(form) {
    return step2Complete(form);
  }

  function getCurrentStep(form) {
    return Number(form.getAttribute("data-current-step") || "1");
  }

  function setCurrentStep(form, step) {
    form.setAttribute("data-current-step", String(step));
  }

  function step1ProgressPct(form) {
    var done = 0;
    if (trimVal(form, "nombre")) done++;
    if (trimVal(form, "whatsapp")) done++;
    if (isPaisValid(form)) done++;
    return (done / 3) * (100 / TOTAL_STEPS);
  }

  function step2ProgressPct(form) {
    var done = 0;
    if (hasRadio(form, "experiencia")) done++;
    if (areaCount(form) >= 1) done++;
    if (hasRadio(form, "ia_codear")) done++;
    if (trimVal(form, "costaria").length >= COSTARIA_MIN_LEN) done++;
    return (done / 4) * (100 / TOTAL_STEPS);
  }

  function updateFormProgress(form, step) {
    var bar = document.getElementById("form-progress-bar");
    var progress = document.getElementById("form-progress");
    if (!bar) return;
    step = step || getCurrentStep(form);
    var pct = step <= 1 ? step1ProgressPct(form) : 100 / TOTAL_STEPS + step2ProgressPct(form);
    pct = Math.min(100, Math.max(0, Math.round(pct)));
    bar.style.width = pct + "%";
    if (progress) {
      progress.setAttribute("aria-valuemin", "0");
      progress.setAttribute("aria-valuemax", "100");
      progress.setAttribute("aria-valuenow", String(pct));
    }
  }

  function autoResizeTextarea(field) {
    if (!field || !field.hasAttribute("data-autogrow")) return;
    field.style.height = "auto";
    field.style.height = field.scrollHeight + "px";
  }

  function bindAutoGrowTextareas(form) {
    var fields = form.querySelectorAll("textarea[data-autogrow]");
    fields.forEach(function (field) {
      autoResizeTextarea(field);
      field.addEventListener("input", function () {
        autoResizeTextarea(field);
      });
    });
  }

  function updateCostariaCount(form) {
    var counter = document.getElementById("costaria-count");
    var field = form.querySelector('[name="costaria"]');
    if (!counter || !field) return;
    var len = (field.value || "").trim().length;
    counter.textContent = len + " / " + COSTARIA_MIN_LEN;
    counter.classList.toggle("is-valid", len >= COSTARIA_MIN_LEN);
  }

  function fieldIsComplete(form, fieldKey) {
    if (fieldKey === "experiencia" || fieldKey === "ia_codear") {
      return hasRadio(form, fieldKey);
    }
    if (fieldKey === "areas") {
      return areaCount(form) >= 1;
    }
    if (fieldKey === "costaria") {
      return trimVal(form, "costaria").length >= COSTARIA_MIN_LEN;
    }
    return false;
  }

  function updateFieldCompletion(form) {
    if (getCurrentStep(form) !== 2) return;
    form.querySelectorAll(".form-field[data-field]").forEach(function (wrap) {
      var key = wrap.getAttribute("data-field");
      wrap.classList.toggle("is-complete", fieldIsComplete(form, key));
    });
  }

  function hasAreaBesidesNinguna(form) {
    var checked = form.querySelectorAll('input[name="areas"]:checked');
    for (var i = 0; i < checked.length; i++) {
      if (checked[i].value !== AREA_NINGUNA) return true;
    }
    return false;
  }

  function updateProfileWarn(form) {
    var warn = document.getElementById("profile-warn");
    if (!warn) return;
    var exp = trimVal(form, "experiencia");
    var ia = trimVal(form, "ia_codear");
    var inconsistent =
      exp === "nada" && (hasAreaBesidesNinguna(form) || ia === "cursor-diario");
    warn.hidden = !inconsistent;
    warn.classList.toggle("is-visible", inconsistent);
  }

  function updateStepExtras(form, step) {
    var postCta = document.getElementById("form-post-cta");
    var onStep2 = step >= TOTAL_STEPS;
    if (postCta) {
      postCta.hidden = !onStep2;
    }
  }

  function updateNextButton(form) {
    var nextBtn = document.getElementById("form-next");
    if (!nextBtn || nextBtn.hidden) return;

    var step = getCurrentStep(form);
    var ready = !validateStep(form, step);
    nextBtn.disabled = !ready;
    nextBtn.setAttribute("aria-disabled", ready ? "false" : "true");
    nextBtn.classList.toggle("is-ready", ready);
  }

  function updateSubmitButton(form) {
    var btn = document.getElementById("form-submit");
    if (!btn || btn.hidden) return;
    if (btn.getAttribute("aria-busy") === "true") return;

    var ready = step2FieldsComplete(form);
    btn.disabled = !ready;
    btn.setAttribute("aria-disabled", ready ? "false" : "true");
    btn.classList.toggle("is-ready", ready);
    if (!ready) {
      btn.title = "Completá los campos obligatorios del paso 2";
    } else {
      btn.removeAttribute("title");
    }
  }

  function updateFormControls(form) {
    updateNextButton(form);
    updateSubmitButton(form);
    updateFormProgress(form);
    updateCostariaCount(form);
    updateFieldCompletion(form);
    updateAllPickerTriggers(form);
    updateProfileWarn(form);
  }

  function updateStepUi(form, step) {
    var groups = form.querySelectorAll(".form-group[data-step]");
    groups.forEach(function (group) {
      var groupStep = Number(group.getAttribute("data-step"));
      var active = groupStep === step;
      group.hidden = !active;
      group.classList.toggle("is-active", active);
    });

    var label = document.getElementById("form-step-label");
    if (label) {
      label.textContent = "Paso " + step + " de " + TOTAL_STEPS + " — " + STEP_LABELS[step - 1];
    }

    var prev = document.getElementById("form-prev");
    var next = document.getElementById("form-next");
    var submitBtn = document.getElementById("form-submit");
    if (prev) {
      prev.hidden = step <= 1;
      prev.toggleAttribute("hidden", step <= 1);
    }
    if (next) {
      var hideNext = step >= TOTAL_STEPS;
      next.hidden = hideNext;
      next.toggleAttribute("hidden", hideNext);
    }
    if (submitBtn) {
      var hideSubmit = step < TOTAL_STEPS;
      submitBtn.hidden = hideSubmit;
      submitBtn.toggleAttribute("hidden", hideSubmit);
    }

    updateStepExtras(form, step);
    updateFormControls(form);
    if (step === 2) {
      var costaria = form.querySelector('[name="costaria"]');
      if (costaria) autoResizeTextarea(costaria);
    }
  }

  function goToStep(form, step, opts) {
    var target = Math.max(1, Math.min(TOTAL_STEPS, step));
    setCurrentStep(form, target);
    updateStepUi(form, target);
    hideError(form);
    if (!opts || !opts.silent) {
      var header = document.querySelector(".form-steps-header");
      if (header && header.scrollIntoView) {
        header.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }

  function collectAreas(form) {
    var checked = [];
    form.querySelectorAll('input[name="areas"]:checked').forEach(function (el) {
      checked.push(el.value);
    });
    return checked.join(", ");
  }

  function resolvePaisForPayload(form) {
    var v = trimVal(form, "pais");
    if (v === "otro") {
      var detail = trimVal(form, "pais_otro");
      return detail ? "otro: " + detail : "otro";
    }
    return v;
  }

  function showError(form, message) {
    var box = form.querySelector(".form-error");
    if (!box) return;
    box.textContent = message;
    box.hidden = false;
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function hideError(form) {
    var box = form.querySelector(".form-error");
    if (!box) return;
    box.hidden = true;
    box.textContent = "";
  }

  function clearFieldInvalid(el) {
    if (!el) return;
    el.classList.remove("field-invalid");
    var field = el.closest(".form-field");
    if (field) field.classList.remove("field-invalid");
  }

  function markFieldInvalid(el) {
    if (!el) return el;
    if (
      el.name === "areas" ||
      (el.type === "radio" && el.name) ||
      (el.type === "checkbox" && el.name === "areas")
    ) {
      var groupField = el.closest(".form-field");
      if (groupField) groupField.classList.add("field-invalid");
      return groupField || el;
    }
    el.classList.add("field-invalid");
    var wrap = el.closest(".form-field");
    if (wrap) wrap.classList.add("field-invalid");
    return el;
  }

  function scrollToInvalid(el) {
    var node = el;
    if (node && !node.classList.contains("form-field")) {
      var field = node.closest(".form-field");
      if (field) node = field;
    }
    if (node && node.scrollIntoView) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function validateStep(form, step) {
    if (step === 1) {
      if (!trimVal(form, "nombre")) {
        return { el: form.querySelector('[name="nombre"]'), msg: "Escribí tu nombre." };
      }
      if (!trimVal(form, "whatsapp")) {
        return { el: form.querySelector('[name="whatsapp"]'), msg: "Dejá tu WhatsApp con código de país." };
      }
      if (!isPaisValid(form)) {
        return { el: form.querySelector('input[name="pais"]'), msg: "Elegí tu país o zona horaria." };
      }
      return null;
    }

    if (step === 2) {
      var radioMessages = {
        experiencia: "Elegí cuánto llevás escribiendo código.",
        ia_codear: "Elegí si ya usaste IA para codear.",
      };
      for (var r = 0; r < REQUIRED_RADIOS.length; r++) {
        var name = REQUIRED_RADIOS[r];
        if (!hasRadio(form, name)) {
          return {
            el: form.querySelector('input[name="' + name + '"]'),
            msg: radioMessages[name],
          };
        }
      }
      if (areaCount(form) < 1) {
        return {
          el: form.querySelector('input[name="areas"]'),
          msg: "Marcá al menos un área (o «Ninguna»).",
        };
      }
      if (trimVal(form, "costaria").length < COSTARIA_MIN_LEN) {
        return {
          el: form.querySelector('[name="costaria"]'),
          msg: "Contá en al menos 15 caracteres qué te costaría más implementar solo hoy.",
        };
      }
      return null;
    }

    return null;
  }

  function findFirstInvalid(form) {
    for (var s = 1; s <= TOTAL_STEPS; s++) {
      var invalid = validateStep(form, s);
      if (invalid) return invalid;
    }
    return null;
  }

  function setLoading(submitBtn, loading) {
    if (!submitBtn) return;
    var form = submitBtn.closest("form");
    submitBtn.disabled = loading;
    submitBtn.setAttribute("aria-busy", loading ? "true" : "false");
    var label = submitBtn.querySelector(".btn-label");
    var wait = submitBtn.querySelector(".btn-loading");
    if (label) label.hidden = loading;
    if (wait) wait.hidden = !loading;
    if (!loading && form) updateFormControls(form);
  }

  function getPickerNodes(picker) {
    var portal = picker._portalNodes;
    return {
      sheet: portal && portal.sheet ? portal.sheet : picker.querySelector(".field-picker__sheet"),
      backdrop:
        portal && portal.backdrop ? portal.backdrop : picker.querySelector(".field-picker__backdrop"),
    };
  }

  function portalPickerToBody(picker) {
    if (picker._portalNodes) return;
    var backdrop = picker.querySelector(".field-picker__backdrop");
    var sheet = picker.querySelector(".field-picker__sheet");
    picker._portalNodes = {};
    if (backdrop) {
      picker._portalNodes.backdrop = backdrop;
      picker._portalNodes.backdropHome = {
        parent: backdrop.parentNode,
        next: backdrop.nextSibling,
      };
      backdrop.classList.add("field-picker__backdrop--portal");
      document.body.appendChild(backdrop);
    }
    if (sheet) {
      picker._portalNodes.sheet = sheet;
      picker._portalNodes.sheetHome = { parent: sheet.parentNode, next: sheet.nextSibling };
      sheet.classList.add("field-picker__sheet--portal");
      document.body.appendChild(sheet);
    }
  }

  function restorePickerFromBody(picker) {
    var portal = picker._portalNodes;
    if (!portal) return;
    if (portal.backdrop && portal.backdropHome && portal.backdropHome.parent) {
      portal.backdrop.classList.remove("field-picker__backdrop--portal");
      portal.backdropHome.parent.insertBefore(portal.backdrop, portal.backdropHome.next);
    }
    if (portal.sheet && portal.sheetHome && portal.sheetHome.parent) {
      portal.sheet.classList.remove("field-picker__sheet--portal");
      portal.sheetHome.parent.insertBefore(portal.sheet, portal.sheetHome.next);
    }
    picker._portalNodes = null;
  }

  function syncPaisOtroWrap(form) {
    var wrap = document.getElementById("pais-otro-wrap");
    var otroInput = form.querySelector('[name="pais_otro"]');
    if (!wrap) return;

    var isOtro = trimVal(form, "pais") === "otro";
    if (isOtro) {
      wrap.classList.remove("hidden");
    } else {
      wrap.classList.add("hidden");
      if (otroInput) otroInput.value = "";
    }
  }

  function closeFieldPicker(picker) {
    if (!picker) return;
    var trigger = picker.querySelector(".field-picker__trigger");
    var nodes = getPickerNodes(picker);
    picker.classList.remove("is-open");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    if (nodes.sheet) nodes.sheet.setAttribute("hidden", "");
    if (nodes.backdrop) nodes.backdrop.setAttribute("hidden", "");
    restorePickerFromBody(picker);
    updatePickerTrigger(picker);
    if (!document.querySelector(".field-picker.is-open")) {
      document.body.classList.remove("field-picker-open");
    }
  }

  function openFieldPicker(picker) {
    if (!picker) return;
    var form = picker.closest("form");
    if (form) {
      form.querySelectorAll(".field-picker.is-open").forEach(function (p) {
        if (p !== picker) closeFieldPicker(p);
      });
    }
    ensurePickerSheetChrome(picker);
    portalPickerToBody(picker);
    var trigger = picker.querySelector(".field-picker__trigger");
    var nodes = getPickerNodes(picker);
    picker.classList.add("is-open");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
    if (nodes.sheet) nodes.sheet.removeAttribute("hidden");
    if (nodes.backdrop) nodes.backdrop.removeAttribute("hidden");
    document.body.classList.add("field-picker-open");
  }

  function getPickerSheetEl(picker) {
    var portal = picker._portalNodes;
    if (portal && portal.sheet) return portal.sheet;
    return picker.querySelector(".field-picker__sheet");
  }

  function ensurePickerSheetChrome(picker) {
    var sheet = getPickerSheetEl(picker) || picker.querySelector(".field-picker__sheet");
    if (!sheet) return;

    var mode = picker.getAttribute("data-mode") || "single";
    sheet.setAttribute("data-mode", mode);

    var id = picker.getAttribute("aria-labelledby");
    var label = id ? document.getElementById(id) : null;

    var header = sheet.querySelector(".field-picker__header");
    if (!header) {
      var orphanTitle = sheet.querySelector(":scope > .field-picker__title");
      header = document.createElement("div");
      header.className = "field-picker__header";
      var title = orphanTitle || document.createElement("p");
      if (!orphanTitle) title.className = "field-picker__title";
      var closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "field-picker__close";
      closeBtn.setAttribute("aria-label", "Cerrar");
      closeBtn.innerHTML = "&times;";
      header.appendChild(title);
      header.appendChild(closeBtn);
      sheet.insertBefore(header, sheet.firstChild);
    }

    var titleEl = header.querySelector(".field-picker__title");
    if (titleEl && label) {
      titleEl.textContent = "";
      var clone = label.cloneNode(true);
      clone.querySelectorAll(".opt").forEach(function (node) {
        node.remove();
      });
      while (clone.firstChild) {
        titleEl.appendChild(clone.firstChild);
      }
    }

    if (mode === "multi") {
      var doneBtn = sheet.querySelector(".field-picker__done");
      if (!doneBtn) {
        var footer = sheet.querySelector(".field-picker__footer");
        if (!footer) {
          footer = document.createElement("div");
          footer.className = "field-picker__footer";
          sheet.appendChild(footer);
        }
        doneBtn = document.createElement("button");
        doneBtn.type = "button";
        doneBtn.className = "btn btn-primary field-picker__done";
        doneBtn.textContent = "Listo";
        footer.appendChild(doneBtn);
      }
    }
  }

  function initPickerSheetChrome(form) {
    form.querySelectorAll(".field-picker[aria-labelledby]").forEach(ensurePickerSheetChrome);
  }

  function getPickerRoot(picker) {
    return getPickerSheetEl(picker) || picker.querySelector(".field-picker__sheet") || picker;
  }

  function getPickerLabels(picker) {
    var labels = [];
    getPickerRoot(picker).querySelectorAll("input:checked").forEach(function (inp) {
      var opt = inp.closest(".field-picker__option");
      if (opt) {
        var span = opt.querySelector("span");
        if (span) labels.push(span.textContent.trim());
      }
    });
    return labels;
  }

  function updatePickerTrigger(picker) {
    var trigger = picker.querySelector(".field-picker__trigger");
    var text = picker.querySelector(".field-picker__text");
    if (!trigger || !text) return;
    var mode = picker.getAttribute("data-mode") || "single";
    var placeholder = picker.getAttribute("data-placeholder") || "Elegí…";
    var labels = getPickerLabels(picker);
    if (labels.length) {
      text.textContent = mode === "single" ? labels[0] : labels.join(", ");
      trigger.classList.add("has-value");
    } else {
      text.textContent = placeholder;
      trigger.classList.remove("has-value");
    }
    getPickerRoot(picker).querySelectorAll(".field-picker__option").forEach(function (opt) {
      var inp = opt.querySelector("input");
      opt.classList.toggle("is-selected", !!(inp && inp.checked));
    });
  }

  function updateAllPickerTriggers(form) {
    form.querySelectorAll(".field-picker").forEach(updatePickerTrigger);
  }

  function syncFieldPickerLayout(form) {
    form.querySelectorAll(".field-picker").forEach(function (picker) {
      if (picker.classList.contains("is-open")) closeFieldPicker(picker);
      else restorePickerFromBody(picker);
      updatePickerTrigger(picker);
    });
  }

  function bindFieldPickers(form) {
    initPickerSheetChrome(form);
    form.querySelectorAll(".field-picker").forEach(function (picker) {
      ensurePickerSheetChrome(picker);
      var sheet = picker.querySelector(".field-picker__sheet");
      var trigger = picker.querySelector(".field-picker__trigger");
      var backdrop = picker.querySelector(".field-picker__backdrop");
      var mode = picker.getAttribute("data-mode") || "single";
      var doneBtn = sheet ? sheet.querySelector(".field-picker__done") : null;
      var closeBtn = sheet ? sheet.querySelector(".field-picker__close") : null;

      if (trigger) {
        trigger.addEventListener("click", function () {
          if (picker.classList.contains("is-open")) closeFieldPicker(picker);
          else openFieldPicker(picker);
        });
      }

      if (backdrop) {
        backdrop.addEventListener("click", function () {
          closeFieldPicker(picker);
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener("click", function () {
          closeFieldPicker(picker);
        });
      }

      if (doneBtn) {
        doneBtn.addEventListener("click", function () {
          closeFieldPicker(picker);
        });
      }

      picker.querySelectorAll("input").forEach(function (inp) {
        inp.addEventListener("change", function () {
          if (mode === "single") closeFieldPicker(picker);
          if (inp.name === "pais") syncPaisOtroWrap(form);
          updatePickerTrigger(picker);
          updateFormControls(form);
        });
      });

      updatePickerTrigger(picker);
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key !== "Escape") return;
      form.querySelectorAll(".field-picker.is-open").forEach(closeFieldPicker);
    });
  }

  function bindAreasExclusive(form) {
    var boxes = form.querySelectorAll('input[name="areas"]');
    boxes.forEach(function (box) {
      box.addEventListener("change", function () {
        if (box.value === AREA_NINGUNA && box.checked) {
          boxes.forEach(function (other) {
            if (other !== box) other.checked = false;
          });
        } else if (box.checked && box.value !== AREA_NINGUNA) {
          boxes.forEach(function (other) {
            if (other.value === AREA_NINGUNA) other.checked = false;
          });
        }
        updateFormControls(form);
      });
    });
  }

  function buildPayload(form) {
    var fd = new FormData(form);
    return {
      nombre: (fd.get("nombre") || "").toString().trim(),
      whatsapp: (fd.get("whatsapp") || "").toString().trim(),
      pais: resolvePaisForPayload(form),
      experiencia: (fd.get("experiencia") || "").toString(),
      origen: "",
      areas: collectAreas(form),
      tecnologias: collectAreas(form),
      ia_codear: (fd.get("ia_codear") || "").toString(),
      github: (fd.get("github") || "").toString().trim(),
      costaria: (fd.get("costaria") || "").toString().trim(),
      horas_semana: "",
      email: (fd.get("email") || "").toString().trim(),
      website: (fd.get("website") || "").toString(),
      utm_source: (fd.get("utm_source") || "").toString(),
      utm_medium: (fd.get("utm_medium") || "").toString(),
      utm_campaign: (fd.get("utm_campaign") || "").toString(),
      utm_content: (fd.get("utm_content") || "").toString(),
      utm_term: (fd.get("utm_term") || "").toString(),
    };
  }

  function submitPayload(url, payload) {
    return fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  }

  function initConfigWarn() {
    var warn = document.getElementById("config-warn");
    if (!warn) return;
    if (!getSubmitUrl(getConfig())) warn.classList.add("visible");
  }

  function onFormInteraction(ev, form) {
    var t = ev.target;
    if (!t || !t.name) return;
    clearFieldInvalid(t);
    if (t.name === "pais") syncPaisOtroWrap(form);
    updateFormControls(form);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initConfigWarn();

    var form = document.getElementById("apply-form");
    if (!form) return;

    fillUtmHiddenFields(form);
    syncPaisOtroWrap(form);
    bindAreasExclusive(form);
    bindFieldPickers(form);
    bindAutoGrowTextareas(form);
    syncFieldPickerLayout(form);
    window.addEventListener("resize", function () {
      syncFieldPickerLayout(form);
    });

    form.addEventListener("input", function (ev) {
      onFormInteraction(ev, form);
    });
    form.addEventListener("change", function (ev) {
      onFormInteraction(ev, form);
    });

    form.addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" || ev.defaultPrevented) return;
      if (ev.target && ev.target.tagName === "TEXTAREA") return;
      var step = getCurrentStep(form);
      if (step < TOTAL_STEPS) {
        ev.preventDefault();
        var nextBtn = document.getElementById("form-next");
        if (nextBtn && !nextBtn.disabled) nextBtn.click();
        return;
      }
      if (ev.target && ev.target.id !== "form-submit") {
        ev.preventDefault();
      }
    });

    setCurrentStep(form, 1);
    updateStepUi(form, 1);

    var prevBtn = document.getElementById("form-prev");
    var nextBtn = document.getElementById("form-next");

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goToStep(form, getCurrentStep(form) - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var step = getCurrentStep(form);
        hideError(form);
        var invalid = validateStep(form, step);
        if (invalid) {
          var marked = markFieldInvalid(invalid.el);
          scrollToInvalid(marked);
          showError(form, invalid.msg);
          return;
        }
        goToStep(form, step + 1);
      });
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      hideError(form);

      var cfg = getConfig();
      var submitUrl = getSubmitUrl(cfg);
      if (!submitUrl) {
        showError(form, "El formulario aún no está conectado. Volvé a intentar más tarde.");
        return;
      }

      if (!isFormComplete(form)) {
        var invalidSubmit = findFirstInvalid(form);
        if (invalidSubmit) {
          var invalidGroup = invalidSubmit.el.closest
            ? invalidSubmit.el.closest(".form-group[data-step]")
            : null;
          if (invalidGroup) {
            goToStep(form, Number(invalidGroup.getAttribute("data-step")), { silent: true });
          }
          var markedSubmit = markFieldInvalid(invalidSubmit.el);
          scrollToInvalid(markedSubmit);
          showError(form, invalidSubmit.msg);
        }
        return;
      }

      var honeypot = form.querySelector('[name="website"]');
      if (honeypot && honeypot.value.trim() !== "") {
        return;
      }

      var submitBtn = document.getElementById("form-submit");
      setLoading(submitBtn, true);

      var payload = buildPayload(form);

      submitPayload(submitUrl, payload)
        .then(function () {
          window.location.href = buildThankYouUrl(cfg);
        })
        .catch(function () {
          setLoading(submitBtn, false);
          showError(
            form,
            "No pudimos enviar la aplicación. Revisá tu conexión e intentá de nuevo."
          );
        });
    });
  });
})();
