# Sitio web — Ingeniero Aumentado por IA

Página estática en GitHub Pages: **landing** → **Tally** → **gracias.html** (evento **Lead** del Meta Pixel).

**URL:** [lucasjappert.github.io/ingeniero-aumentado-por-ia](https://lucasjappert.github.io/ingeniero-aumentado-por-ia/)

**Repo:** [github.com/LucasJappert/ingeniero-aumentado-por-ia](https://github.com/LucasJappert/ingeniero-aumentado-por-ia)

## Archivos

| Archivo | Rol |
|---------|-----|
| `index.html` | Landing pública |
| `gracias.html` | Thank-you + `fbq('track', 'Lead')` |
| `js/config.js` | Pixel ID + URL del formulario Tally |
| `js/config.example.js` | Plantilla de config |
| `js/meta-pixel.js` | Carga del píxel y eventos |
| `js/tally-link.js` | Pasa `utm_*` de la URL al link de Tally |

## Publicar cambios

```bash
cd ingeniero-aumentado-por-ia
git add -A && git commit -m "Actualizar sitio" && git push
```

GitHub Pages: Settings → Pages → branch **`main`** → **`/ (root)`**.

## Formulario en Tally

1. [tally.so](https://tally.so) → nuevo formulario.
2. Campos (alineados al embudo — **sin GitHub obligatorio**):

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| Nombre completo | Texto corto | Sí |
| WhatsApp (con código país) | Teléfono | Sí |
| País / zona horaria | Lista o texto | Sí |
| ¿Cuánto llevás escribiendo código? | Opción única: &lt;6 meses · 6 mes–2 años · 2–5 años · 5+ años | Sí |
| ¿Cómo llegaste al código? | Opción única: Bootcamp · Autodidacta · Carrera/técnica · 1er empleo dev | Sí |
| Tecnologías que ya usaste | **Múltiple** (checkboxes): Python · JS/TS · SQL · Git · APIs REST · Framework web · Ninguna aún | Sí (≥1) |
| ¿Usaste IA para codear? | Opción única: Cursor/Copilot diario · ChatGPT ocasional · Poco/nada · No conozco Cursor | Sí |
| Link GitHub o GitLab | URL | **No** |
| ¿Qué te costaría implementar hoy? | Texto largo (1–3 frases) | Sí |
| ¿Podés 6–10 h/semana? | Opción única: Sí · No estoy seguro · No | Sí |
| Email | Email | No |

**Criterio rápido:** [02-embudo § Formulario](../02-embudo-mensajes-y-entrevista.md#formulario-admision) (repo de planes).

3. **Campos ocultos** UTM (opcional): `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`.

4. **Tras enviar** → redirect a:

```
https://lucasjappert.github.io/ingeniero-aumentado-por-ia/gracias.html
```

5. **Publish** → `https://tally.so/r/xxxxx` → `js/config.js` → `TALLY_FORM_URL` → commit + push.

## Meta Pixel

1. [Events Manager](https://business.facebook.com/events_manager) → ID del píxel → `js/config.js` → `META_PIXEL_ID`.
2. Eventos: `PageView` en `index.html`, **`Lead`** en `gracias.html`.
3. Verificar con [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper).

## Probar en local

```bash
cp js/config.example.js js/config.js
# Editar META_PIXEL_ID y TALLY_FORM_URL

python3 -m http.server 8080
# http://localhost:8080/?utm_source=test
```

## Ads Instagram

URL del anuncio (no Tally directo):

```
https://lucasjappert.github.io/ingeniero-aumentado-por-ia/?utm_source=instagram&utm_medium=paid&utm_campaign=cohorte-mes1&utm_content=anti-vibe
```

Checklist completo: **[TODO.md](../TODO.md)** (Fase A) en el repo de planes.

---

[← Índice del proyecto](../00-proyecto-e-indice.md)
