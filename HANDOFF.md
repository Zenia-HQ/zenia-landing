# Handoff — landing del piloto de Zenia

Este repo es una landing estática que ya se puede publicar. Lo que falta es backend,
analytics real y tres textos legales. Abajo está todo lo que un agente necesita para
terminarla sin volver a preguntar.

## Estado

| Pieza | Estado |
|---|---|
| Maquetado, copy, marca, responsive | Hecho |
| Metadatos Open Graph e imagen de preview | Hecho (falta reemplazar el dominio) |
| PWA manifest e íconos | Hecho |
| Captura de UTM / `ref` y compartir por WhatsApp | Hecho (JS al final de `index.html`) |
| Endpoints `/api/registro` y `/api/empresas` | **Falta** |
| Estados de los formularios en pantalla | **Falta** |
| Páginas `/terminos` y `/privacidad` | **Falta** |
| Analytics real (hoy empuja a `window.dataLayer`) | **Falta** |

## Primer paso obligatorio

Buscar `DOMINIO-DEFINITIVO` en `index.html` y reemplazarlo por el dominio real. Son cuatro
apariciones (canonical, `og:url`, `og:image`). Sin eso la vista previa del link en WhatsApp
no carga la imagen, y esa vista previa es la primera pantalla de la landing.

## Contrato de los formularios

### `POST /api/registro`

Campos: `email` (obligatorio), `nombre`, `consentimiento` (obligatorio, sin premarcar),
`novedades`, más `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `ref`.

Guardar siempre el consentimiento con timestamp y la URL de origen: es lo que pide la
Ley 25.326.

Respuestas y el texto exacto que va en pantalla:

| Caso | Texto |
|---|---|
| OK | "Listo. Te mandamos un link a tu email para entrar. Revisá también spam." |
| Email inválido | "Ese email no parece válido. ¿Lo mirás de nuevo?" |
| Ya registrado | "Ya estás adentro, te reenviamos el link." |
| Cupos completos | "Se llenó esta tanda. Te anotamos para la próxima." |
| Error del servidor | "No pudimos anotarte ahora. Probá de nuevo en un rato." |

El acceso es por magic link, sin contraseña. Cupo de la primera tanda: 50 a 100 personas —
cuando se llena, el formulario sigue aceptando registros pero devuelve el estado de lista de
espera.

### `POST /api/empresas`

Campos: `nombre`, `empresa` (obligatorio), `cargo` (obligatorio), `empleados` (obligatorio,
rangos 1 a 49 / 50 a 199 / 200 a 999 / 1.000 o más), `email` (obligatorio),
`mensaje`, `consentimiento` (obligatorio), `contacto_ok` (obligatorio), más UTM y `ref`.

Confirmación: "Gracias. Te escribimos en los próximos días."
No rechazar emails personales en pantalla; la calificación es interna.

En este formulario está permitido hablar de bienestar del equipo, hábitos, rendimiento
sostenible y beneficio para colaboradores. **No** se puede usar: riesgo psicosocial,
ausentismo por salud, prevención, screening.

## Estados en pantalla

Hoy los formularios hacen un POST normal. Lo que falta es resolverlos sin recargar:
deshabilitar el botón mientras envía, y reemplazar el formulario por el mensaje de la tabla
de arriba dentro de la misma tarjeta, conservando el disclaimer de bienestar. Los errores de
campo van en `--alert` con `aria-describedby`; el foco se mueve al primer campo con error.

## Eventos a instrumentar

El JS al final de `index.html` ya empuja estos eventos a `window.dataLayer`. Reemplazar ese
push por el SDK que se elija (GA4, Plausible, PostHog) sin cambiar los nombres:

`visita` · `cta-nav` · `cta-hero` · `cta-cierre` · `cta-compartir` · `cta-planes-aviso` ·
`link-empresas-nav` · `link-ayuda` · `link-terminos` · `link-privacidad` ·
`form-registro-inicio` · `form-registro-submit` · `form-registro-error` ·
`form-empresas-inicio` · `form-empresas-submit` · `scroll-25` · `scroll-50` · `scroll-75` ·
`scroll-100`.

La métrica que la página tiene que mover es visitante → cuenta creada. Umbral de trabajo:
15 % o más en tráfico cálido.

El parámetro `ref` identifica al socio o a la persona que trajo cada registro, y se conserva
cuando alguien vuelve a compartir el link desde la página.

## Pendientes que pueden cambiar el copy

| # | Pendiente | Dueño | Qué dice hoy la página |
|---|---|---|---|
| 1 | Consentimiento, Términos y Privacidad | Diego | Texto borrador; los links apuntan a `/terminos` y `/privacidad`, que todavía no existen |
| 2 | Líneas de ayuda definitivas | Pablo | Las públicas: 135 (CABA y GBA), SAME 107, 911 |
| 3 | Duración del piloto y escuchas diarias | Los tres | "Dura entre 10 y 21 días, unos minutos por día" |
| 4 | Dominio y email de contacto | Federico / Gus | `DOMINIO-DEFINITIVO` en los metadatos; no hay link de Contacto |
| 5 | Disponibilidad de la marca Zenia en INPI | Federico | Logo e isotipo salen de `assets/img/`; el wordmark es texto en Bricolage, se cambia en un lugar |
| 6 | Botón de contacto por WhatsApp y pedido de teléfono | Los tres | No incluidos |

## Si la landing se muda a un framework

El HTML es una sola página semántica y el CSS es un archivo con tokens en `:root`. Para pasar
a Astro, Next o lo que sea: los tokens van tal cual a un `globals.css`, cada `<section>` es un
componente, y el copy conviene sacarlo a un archivo de contenido (JSON o MDX) para que los
socios lo editen sin tocar código. No hay dependencias, no hay build.

Recomendación: **Astro en Cloudflare Pages**, con los dos endpoints como funciones. Es lo más
liviano para una página que tiene que abrir rápido con datos móviles.

## Dos detalles de la caja

**Regenerar la imagen Open Graph.** La fuente está en `tools/og-image.html`. Se abre en el
navegador a 1200×630 y se captura, o con Playwright:

```js
await page.setViewportSize({ width: 1200, height: 630 });
await page.goto('file://.../tools/og-image.html', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'assets/img/og-image.png' });
```

**Autohostear las fuentes.** Hoy Bricolage Grotesque y Hanken Grotesk se piden a Google Fonts.
Para tráfico que llega con datos móviles conviene servirlas desde el mismo dominio:

```bash
npm i @fontsource-variable/bricolage-grotesque @fontsource/hanken-grotesk
```

y copiar los `.woff2` latinos a `assets/fonts/` con sus `@font-face` en `site.css`
(Bricolage: usar el archivo `-opsz-` para conservar el eje óptico). Ahorra dos conexiones
externas y un render-blocking en el primer paint.
