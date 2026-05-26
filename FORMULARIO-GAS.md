# Formulario nativo + Google Apps Script

Continuar implementación en la landing `ingeniero-aumentado-por-ia/`. Spec de campos: [02-embudo § Formulario](../02-embudo-mensajes-y-entrevista.md#formulario-admision).

---

## Prompt para el agente (copiar y pegar)

```
Implementá el formulario de admisión nativo en ingeniero-aumentado-por-ia/ (reemplazar el flujo Tally).

Requisitos:
- Formulario en index.html (sección #aplicar), mismos estilos que la landing (css/styles.css).
- Campos según 02-embudo-mensajes-y-entrevista.md § Formulario: nombre, WhatsApp, país/zona; selects/radios para experiencia, cómo llegaste al código, IA para codear, horas/semana; checkboxes tecnologías (mín. 1); GitHub/GitLab opcional; texto "qué te costaría"; email opcional.
- Hidden: utm_source, utm_medium, utm_campaign, utm_content, utm_term (rellenar desde URL al cargar).
- Honeypot anti-spam (campo oculto que bots llenan).
- js/apply-form.js: preventDefault, validar obligatorios, POST JSON a window.LANDING_CONFIG.FORM_SUBMIT_URL con fetch, en éxito redirect a THANK_YOU_PATH preservando UTMs en query string.
- config.js / config.example.js: FORM_SUBMIT_URL (por ahora https://script.google.com/macros/s/REEMPLAZAR/exec), quitar TALLY_FORM_URL y tally-link.js del index.
- Estados: loading en botón, mensaje de error visible, gracias.html sin cambios (pixel Lead ahí).
- No commitear secretos. Documentar en FORMULARIO-GAS.md si falta algo.

URL del backend: usar placeholder hasta que el humano pegue la URL real del deploy de Apps Script.
```

---

## Qué hace el agente vs qué hacés vos

| Quién | Tarea |
|-------|--------|
| Agente | HTML, CSS form, `apply-form.js`, `config.js`, quitar Tally |
| Vos | Crear Apps Script + Sheet + pegar URL en `config.js` |

---

## Crear la app en Google (rápido)

### 1. Sheet

1. [sheets.new](https://sheets.new) → nombre ej. `Aplicaciones Grupo Mes 1`.
2. Fila 1 (headers): `timestamp`, `nombre`, `whatsapp`, `pais`, `experiencia`, `origen`, `tecnologias`, `ia_codear`, `github`, `costaria`, `horas_semana`, `email`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`.

### 2. Apps Script

1. En la Sheet: **Extensiones → Apps Script**.
2. Proyecto ej. `grupo-aplicaciones`.
3. Pegar el script de abajo (`Code.gs`). Ajustá `SHEET_ID` y `NOTIFY_EMAIL`.
4. Guardar → **Implementar** (paso 3).

```javascript
/** ID de la Sheet: /d/ESTE_ID/edit */
var SHEET_ID = "REEMPLAZAR_SHEET_ID";
/** Vacío = sin mail. Ej: "tu@gmail.com" */
var NOTIFY_EMAIL = "";

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) || "{}";
    var data = JSON.parse(raw);

    if ((data.website || "").toString().trim() !== "") {
      return jsonOut({ ok: false, error: "spam" });
    }
    if (!(data.nombre || "").trim() || !(data.whatsapp || "").trim() || !(data.pais || "").trim()) {
      return jsonOut({ ok: false, error: "missing_fields" });
    }

    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    sheet.appendRow([
      new Date(),
      data.nombre || "",
      data.whatsapp || "",
      data.pais || "",
      data.experiencia || "",
      data.origen || "",
      data.tecnologias || "",
      data.ia_codear || "",
      data.github || "",
      data.costaria || "",
      data.horas_semana || "",
      data.email || "",
      data.utm_source || "",
      data.utm_medium || "",
      data.utm_campaign || "",
      data.utm_content || "",
      data.utm_term || "",
    ]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: "Nueva aplicación — " + (data.nombre || "sin nombre"),
        body:
          "WhatsApp: " +
          (data.whatsapp || "") +
          "\nPaís: " +
          (data.pais || "") +
          "\nExperiencia: " +
          (data.experiencia || "") +
          "\nVer fila en la Sheet.",
      });
    }

    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
```

### 3. Deploy → URL que usa la landing

1. **Implementar → Nueva implementación** → tipo **Aplicación web**.
2. Ejecutar como: **Yo** · Quién accede: **Cualquiera** (anonimizado está bien para form público).
3. **Implementar** → copiar URL que termina en `/exec` (no `/dev`).
4. Pegar en `js/config.js`:

```js
FORM_SUBMIT_URL: "https://script.google.com/macros/s/AKfycb....../exec",
```

### 4. Probar

1. `index.html` local o GitHub Pages → envío de prueba.
2. Ver fila nueva en la Sheet + mail si activaste notificación.
3. Confirmar redirect a `gracias.html` y pixel (Events Manager / extensión Meta).

---

## Notas

- La URL `/exec` **es pública**; el script ignora POST con honeypot `website` lleno o sin nombre/WhatsApp/país.
- **Frontend:** `apply-form.js` usa `fetch` con `mode: 'no-cors'` y `Content-Type: text/plain` (compatible con GitHub Pages → Apps Script). Tras el POST redirige a `gracias.html` con UTMs; no lee el JSON de respuesta.
- **Tally:** ya no se usa; `tally-link.js` quedó obsoleto (podés borrarlo del repo de deploy).
- Cuando la URL real exista, reemplazar `REEMPLAZAR` en `config.js` y probar desde el celular con UTMs: `?utm_source=test&utm_campaign=manual`.

---

## Checklist mañana

- [x] Agente: formulario + `apply-form.js` en la landing
- [ ] Vos: Sheet + Apps Script + deploy `/exec`
- [ ] `config.js` con URL real (+ `META_PIXEL_ID` si corres ads)
- [ ] Prueba end-to-end + actualizar `TODO.md` (quitar Tally, marcar form propio)
