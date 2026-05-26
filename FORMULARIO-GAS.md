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

1. [sheets.new](https://sheets.new) → nombre ej. `Aplicaciones Cohorte Mes 1`.
2. Fila 1 (headers): `timestamp`, `nombre`, `whatsapp`, `pais`, `experiencia`, `origen`, `tecnologias`, `ia_codear`, `github`, `costaria`, `horas_semana`, `email`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`.

### 2. Apps Script

1. En la Sheet: **Extensiones → Apps Script**.
2. Proyecto ej. `cohorte-aplicaciones`.
3. Pegar script que reciba `POST` JSON, valide honeypot, append fila, opcional `MailApp.sendEmail` a tu Gmail.
4. En el script: constante `SHEET_ID` = ID de la URL de la Sheet (`/d/ESTE_ID/edit`).

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

- La URL `/exec` **es pública**; el script debe ignorar POST sin honeypot vacío y campos mínimos.
- `fetch` desde GitHub Pages: el script debe responder con CORS (`doPost` + headers) o usar `mode: 'no-cors'` y aceptar respuesta opaca — el agente debe elegir la opción que funcione con Apps Script.
- Cuando la URL real exista, reemplazar `REEMPLAZAR` en `config.js` y probar desde el celular con UTMs: `?utm_source=test&utm_campaign=manual`.

---

## Checklist mañana

- [ ] Agente: formulario + `apply-form.js` commiteado
- [ ] Vos: Sheet + Apps Script + deploy `/exec`
- [ ] `config.js` con URL real
- [ ] Prueba end-to-end + actualizar `TODO.md` (quitar Tally, marcar form propio)
