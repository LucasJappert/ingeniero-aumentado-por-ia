/**
 * Ingeniero Aumentado por IA — backend del formulario + eventos de landing
 *
 * 1. Creá una Google Sheet y copiá su ID en SHEET_ID (ver FORMULARIO-GAS.md).
 * 2. Pegá este archivo en Apps Script (Extensions → Apps Script).
 * 3. Implementá como app web (Implementar → Nueva implementación → App web).
 * 4. Copiá la URL /exec a js/config.js → FORM_SUBMIT_URL
 */

var SHEET_ID = "PEGAR_ID_DE_LA_SHEET_AQUI";
var NOTIFY_EMAIL = ""; // ej. "tu@gmail.com" o "" para no enviar mail

var TAB_APPLICATIONS = "Aplicaciones";
var TAB_EVENTS = "Eventos";

function doPost(e) {
  try {
    var body = parseBody_(e);
    if (!body || typeof body !== "object") {
      return jsonResponse_({ ok: false, error: "empty_body" });
    }

  if (body.type === "event") {
      return handleEvent_(body);
    }

    return handleApplication_(body);
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  var p = e && e.parameter ? e.parameter : {};
  if (p.type === "event" && p.event) {
    return handleEvent_({
      type: "event",
      event: p.event,
      section: p.section || "",
      page: p.page || "",
      page_path: p.page_path || "",
      session_id: p.session_id || "",
      utm_source: p.utm_source || "",
      utm_medium: p.utm_medium || "",
      utm_campaign: p.utm_campaign || "",
      utm_content: p.utm_content || "",
      utm_term: p.utm_term || "",
    });
  }
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, service: "ingeniero-aumentado-form", version: 4 })
  ).setMimeType(ContentService.MimeType.JSON);
}

function handleApplication_(data) {
  if (isHoneypot_(data)) {
    return jsonResponse_({ ok: true, skipped: "honeypot" });
  }

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = getOrCreateSheet_(ss, TAB_APPLICATIONS, APPLICATION_HEADERS_);
  ensureHeaders_(sheet, APPLICATION_HEADERS_);

  var semaforo = calcSemaforo_(data);
  var row = [
    new Date(),
    semaforo,
    "",
    clean_(data.nombre),
    clean_(data.whatsapp),
    clean_(data.pais),
    clean_(data.experiencia),
    clean_(data.areas || data.tecnologias),
    clean_(data.ia_codear),
    clean_(data.costaria),
    clean_(data.github),
    clean_(data.email),
    clean_(data.utm_source),
    clean_(data.utm_medium),
    clean_(data.utm_campaign),
    clean_(data.utm_content),
    clean_(data.utm_term),
  ];

  sheet.appendRow(row);

  if (NOTIFY_EMAIL) {
    try {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: semaforo + " Nueva aplicación — " + clean_(data.nombre),
        body: formatApplicationEmail_(data, semaforo),
      });
    } catch (mailErr) {
      // No fallar el POST si el mail falla
    }
  }

  return jsonResponse_({ ok: true, semaforo: semaforo });
}

function handleEvent_(data) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = getOrCreateSheet_(ss, TAB_EVENTS, EVENT_HEADERS_);
  ensureHeaders_(sheet, EVENT_HEADERS_);

  sheet.appendRow([
    new Date(),
    clean_(data.event),
    clean_(data.section),
    clean_(data.page),
    clean_(data.page_path),
    clean_(data.session_id),
    clean_(data.utm_source),
    clean_(data.utm_medium),
    clean_(data.utm_campaign),
    clean_(data.utm_content),
    clean_(data.utm_term),
  ]);

  return jsonResponse_({ ok: true });
}

var APPLICATION_HEADERS_ = [
  "timestamp",
  "semaforo",
  "notas",
  "nombre",
  "whatsapp",
  "pais",
  "experiencia",
  "areas",
  "ia_codear",
  "costaria",
  "github",
  "email",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

var EVENT_HEADERS_ = [
  "timestamp",
  "event",
  "section",
  "page",
  "page_path",
  "session_id",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

function calcSemaforo_(data) {
  var exp = clean_(data.experiencia);
  var areas = clean_(data.areas || data.tecnologias).toLowerCase();
  var costaria = clean_(data.costaria);
  var github = clean_(data.github);

  var shortExp = exp === "nada" || exp === "menos-6m";
  var longExp = exp === "6m-2a" || exp === "2-5a" || exp === "5a-mas";
  var onlyNinguna =
    areas.indexOf("ninguna") !== -1 &&
    areas.indexOf("frontend") === -1 &&
    areas.indexOf("backend") === -1 &&
    areas.indexOf("full stack") === -1 &&
    areas.indexOf("base de datos") === -1 &&
    areas.indexOf("devops") === -1;
  var hasSql = areas.indexOf("base de datos") !== -1;
  var hasGit = github.length > 8;
  var weakAnswer = costaria.length < 25;

  if (shortExp && onlyNinguna && weakAnswer) {
    return "🔴";
  }
  if (longExp && (hasSql || hasGit) && costaria.length >= 25) {
    return "🟢";
  }
  return "🟡";
}

function formatApplicationEmail_(data, semaforo) {
  return [
    "Semáforo: " + semaforo,
    "",
    "Nombre: " + clean_(data.nombre),
    "WhatsApp: " + clean_(data.whatsapp),
    "País: " + clean_(data.pais),
    "Experiencia: " + clean_(data.experiencia),
    "Áreas: " + clean_(data.areas || data.tecnologias),
    "IA: " + clean_(data.ia_codear),
    "",
    "¿Qué le costaría?:",
    clean_(data.costaria),
    "",
    "GitHub: " + (clean_(data.github) || "(no)"),
    "Email: " + (clean_(data.email) || "(no)"),
    "",
    "UTM: " +
      [
        clean_(data.utm_source),
        clean_(data.utm_medium),
        clean_(data.utm_campaign),
        clean_(data.utm_content),
      ]
        .filter(Boolean)
        .join(" / "),
  ].join("\n");
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return null;
  }
  return JSON.parse(e.postData.contents);
}

function isHoneypot_(data) {
  return clean_(data.website).length > 0;
}

function clean_(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

function getOrCreateSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  return sheet;
}

function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() > 0) {
    return;
  }
  sheet.appendRow(headers);
  sheet.setFrozenRows(1);
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
