# Zenia — landing del piloto

Sitio estático de una sola página. Sin build, sin dependencias, sin framework.
Único objetivo: que quien llega se registre al piloto. El tráfico entra por un link que
alguien manda por WhatsApp y se abre en el celular, muchas veces con datos móviles.

## Dónde está cada cosa

| Archivo | Qué tiene |
|---|---|
| `.cursor/rules/00-marca-y-lenguaje.mdc` | **Las reglas que no se negocian.** Siempre activas. |
| `.cursor/rules/10-estilos.mdc` | Tokens y reglas visuales. Se activa con archivos CSS. |
| `.cursor/rules/20-html.mdc` | Estructura, accesibilidad y medición. Se activa con HTML. |
| `.cursor/rules/30-backend.mdc` | Contrato de los endpoints. Se pide con `@30-backend`. |
| `HANDOFF.md` | Contrato completo, eventos, pendientes por dueño, deploy. |
| `README.md` | Cómo correrlo y publicarlo. |

## Antes de cualquier otra cosa

Leé `HANDOFF.md`. Y antes de publicar, reemplazá `DOMINIO-DEFINITIVO` en `index.html`
(4 apariciones): sin eso la vista previa del link en WhatsApp queda sin imagen, y esa vista
previa es la primera pantalla de la landing.

## Qué falta

Los dos endpoints, los estados de los formularios en pantalla, `/terminos` y `/privacidad`,
y el analytics real. Todo está especificado en `HANDOFF.md`.
