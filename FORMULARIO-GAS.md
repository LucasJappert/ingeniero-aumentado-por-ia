# Google Sheet + Apps Script — guía desde cero

Backend del formulario de la landing. **No hace falta otro `TODO.md`:** seguí esta checklist y marcá los ítems en [TODO.md del proyecto](../TODO.md) (fase **A1**).

**Tiempo estimado:** 30–45 min la primera vez.

---

## Qué vas a lograr

```
Landing (index.html)
    → POST JSON a Apps Script (/exec)
        → fila en pestaña "Aplicaciones" (+ semáforo 🟢🟡🔴)
    → redirect a gracias.html

(Opcional) eventos de sección → pestaña "Eventos"
```

---

## Checklist rápida

- [ ] **1.** Crear Google Sheet
- [ ] **2.** Copiar ID de la Sheet en `Code.gs`
- [ ] **3.** Pegar script en Apps Script
- [ ] **4.** Autorizar y publicar como **app web**
- [ ] **5.** Copiar URL `/exec` → `js/config.js`
- [ ] **6.** Probar envío local o en GitHub Pages
- [ ] **7.** Ver fila nueva en la Sheet
- [ ] **8.** (Opcional) Activar eventos en la landing

---

## 1. Crear la Google Sheet

1. Entrá a [Google Sheets](https://sheets.google.com) con tu cuenta Google.
2. **En blanco** → nombre del archivo: `Aplicaciones — Ingeniero Aumentado Mes 1`.
3. Renombrá la primera pestaña a **`Aplicaciones`** (clic derecho en la pestaña → Cambiar nombre).
4. **No hace falta** escribir los encabezados a mano: el script los crea en la primera fila al recibir datos.

### Copiar el ID de la Sheet

En la barra de direcciones del navegador ves algo como:

```
https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit
```

El **ID** es la parte larga entre `/d/` y `/edit`:

```
1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

Guardalo: lo vas a pegar en el script.

---

## 2. Abrir Apps Script desde la Sheet

1. En la Sheet: menú **Extensiones** → **Apps Script**.
2. Se abre un proyecto con un archivo `Código.gs` (o `Code.gs`).
3. **Borrá** todo lo que trae por defecto.
4. Abrí en tu computadora el archivo del repo:

   `ingeniero-aumentado-por-ia/google-apps-script/Code.gs`

5. **Copiá y pegá** todo el contenido en Apps Script.
6. En la línea `SHEET_ID`, reemplazá `PEGAR_ID_DE_LA_SHEET_AQUI` por tu ID (entre comillas).

```javascript
var SHEET_ID = "1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890";
```

7. (Opcional) Email cuando llega una aplicación:

```javascript
var NOTIFY_EMAIL = "tu@gmail.com";
```

8. **Guardar** (Ctrl+S). Podés renombrar el proyecto: `Formulario Ingeniero Aumentado`.

---

## 3. Publicar como app web (lo más importante)

1. En Apps Script: botón **Implementar** (arriba a la derecha) → **Nueva implementación**.
2. Engranaje ⚙ → tipo **App web**.
3. Configuración recomendada:

   | Campo | Valor |
   |-------|--------|
   | Descripción | `Formulario landing v1` |
   | Ejecutar como | **Yo** (tu cuenta) |
   | Quién tiene acceso | **Cualquier persona** |

   > **Cualquier persona** es necesario para que la landing en GitHub Pages pueda enviar datos sin login.

4. **Implementar** → Google pide **autorizar**:
   - Elegí tu cuenta → Avanzado → Ir a … (no seguro) → Permitir.
   - Es normal en proyectos personales; el script solo escribe en *tu* Sheet y opcionalmente te manda mail.

5. Copiá la **URL de la app web**. Debe terminar en **`/exec`**:

   ```
   https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxx/exec
   ```

6. Si más adelante cambiás el código: **Implementar** → **Administrar implementaciones** → lápiz → **Nueva versión** → Implementar. La URL `/exec` suele **seguir igual**.

---

## 4. Conectar la landing

1. En el repo del sitio:

   ```bash
   cd ingeniero-aumentado-por-ia
   cp js/config.example.js js/config.js
   ```

2. Editá `js/config.js`:

   ```javascript
   window.LANDING_CONFIG = {
     META_PIXEL_ID: "",  // después, fase A3
     FORM_SUBMIT_URL: "https://script.google.com/macros/s/TU_URL/exec",
     THANK_YOU_PATH: "gracias.html",
   };
   ```

3. `config.js` suele estar en `.gitignore` — no se sube a GitHub (bien para no exponer URLs si querés). En **GitHub Pages** tenés que tener `config.js` en el servidor: o lo commiteás solo con la URL del script (no es secreto crítico) o lo generás en el deploy.

---

## 5. Probar

### Opción A — local

```bash
cd ingeniero-aumentado-por-ia
python3 -m http.server 8080
```

Abrí: `http://localhost:8080/?utm_source=test&utm_campaign=manual`

- Completá los 2 pasos del formulario.
- Deberías ir a `gracias.html`.
- En la Sheet: nueva fila en **Aplicaciones** con semáforo.

### Opción B — producción

Después del push a GitHub Pages, misma prueba con la URL pública.

### Si no funciona

| Síntoma | Qué revisar |
|---------|-------------|
| Aviso amarillo en la landing | `FORM_SUBMIT_URL` vacío o con `REEMPLAZAR` |
| No aparece fila | ¿Implementaste como **app web** con `/exec`? ¿`SHEET_ID` correcto? |
| Error al autorizar | Volvé a implementar y autorizá de nuevo |
| Fila llega pero sin UTMs | Probá con `?utm_source=test` en la URL |

### Probar el script directo (opcional)

En el navegador abrí la URL `/exec` con **GET**: deberías ver JSON `{"ok":true,"service":"ingeniero-aumentado-form",...}`.

---

## 6. Pestañas de la Sheet

### Aplicaciones

| Columna | Contenido |
|---------|-----------|
| timestamp | Fecha/hora del envío |
| semaforo | 🟢 🟡 🔴 (automático, orientativo) |
| notas | Vacío — para vos (WA, entrevista) |
| nombre, whatsapp, pais, … | Respuestas del formulario |
| utm_* | De la URL del anuncio |

**Semáforo (automático):**

- 🟢 — ≥6 meses experiencia + (SQL en áreas o link GitHub) + respuesta “costaría” con sustancia
- 🔴 — poca experiencia + solo “Ninguna” + respuesta muy corta
- 🟡 — el resto (revisás vos antes del WhatsApp)

Ver criterio humano: [02-embudo § Semáforo](../02-embudo-mensajes-y-entrevista.md#formulario-admision).

### Eventos (opcional — fase monitoreo)

Si activás `js/landing-events.js` en `index.html`, se crea la pestaña **Eventos** con:

- `landing_view`, `section_programa`, `section_profe`, `form_visible`, `form_step_2`, `thank_you_view`
- UTMs + `session_id` anónimo

Sirve para ver en qué paso se cae la gente que viene de Instagram.

---

## 7. Eventos en la landing (opcional)

En `index.html`, antes de `</body>`:

```html
<script src="js/landing-events.js" defer></script>
```

En `gracias.html`, igual. Usa la misma `FORM_SUBMIT_URL`.

No bloquea el envío del formulario si falla el tracking.

---

## 8. Seguridad y límites

- **Honeypot:** campo oculto `website` — si lo completa un bot, el script ignora la fila.
- **Cuotas Google:** para un piloto de 5–20 aplicaciones/día estás muy por debajo del límite gratuito.
- **No guardes** contraseñas ni datos de tarjeta en la Sheet.

---

## Archivos relacionados

| Archivo | Rol |
|---------|-----|
| `google-apps-script/Code.gs` | Código a pegar en Apps Script |
| `js/apply-form.js` | Envía aplicaciones |
| `js/landing-events.js` | Eventos opcionales |
| `js/config.js` | URL `/exec` + Pixel |
| [sitio-web.md](../sitio-web.md) | Resumen deploy |

---

[← Volver al TODO del proyecto](../TODO.md)
