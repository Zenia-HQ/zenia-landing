# Zenia — landing del piloto

Sitio estático, sin build y sin dependencias. Se publica tal cual.

```
index.html            la página entera
assets/css/site.css   tokens del design system Zenia + estilos
assets/img/           isotipo, íconos de app, favicon, imagen Open Graph
site.webmanifest      PWA
AGENTS.md             instrucciones del proyecto para el agente
.cursor/rules/        reglas de Cursor (marca, estilos, html, backend)
HANDOFF.md            contrato de formularios, eventos y pendientes
```

## Correr en local

```bash
python3 -m http.server 4173
# http://localhost:4173
```

## Publicar

Cualquier host estático sirve. Con Cloudflare Pages:

```bash
npx wrangler pages deploy . --project-name zenia-landing
```

Netlify: arrastrar la carpeta. Vercel: `npx vercel --prod`.

**Antes de publicar:** reemplazar `DOMINIO-DEFINITIVO` en `index.html` (4 apariciones) por el
dominio real, o la vista previa del link en WhatsApp queda sin imagen.

## Lo que falta

Está en `HANDOFF.md`: los dos endpoints, los estados de los formularios, las páginas legales y
el analytics real.
