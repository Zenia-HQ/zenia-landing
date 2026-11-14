import { checked, clip, Env, json, origenDe, readForm, sameOrigin, validEmail } from "../_lib/http";

const OK = "Gracias. Te escribimos en los próximos días.";
const ERROR = "No pudimos enviar tu pedido ahora. Probá de nuevo en un rato.";
const RANGOS = new Set(["1 a 49", "50 a 199", "200 a 999", "1.000 o más"]);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ status: "error", message: ERROR }, 403);

  let data: Record<string, string>;
  try {
    data = await readForm(request);
  } catch {
    return json({ status: "error", message: ERROR }, 400);
  }

  const email = (data.email || "").toLowerCase();
  if (!data.empresa) return json({ status: "invalid", message: "Completá este campo.", field: "empresa" }, 400);
  if (!data.cargo) return json({ status: "invalid", message: "Completá este campo.", field: "cargo" }, 400);
  if (!RANGOS.has(data.empleados || "")) {
    return json({ status: "invalid", message: "Elegí un rango.", field: "empleados" }, 400);
  }
  if (!validEmail(email)) {
    return json({ status: "invalid", message: "Ese email no parece válido. ¿Lo mirás de nuevo?", field: "email" }, 400);
  }
  if (!checked(data.consentimiento)) {
    return json({ status: "invalid", message: "Necesitamos tu consentimiento para contactarte.", field: "consentimiento" }, 400);
  }
  if (!checked(data.contacto_ok)) {
    return json({ status: "invalid", message: "Necesitamos tu ok para escribirte.", field: "contacto_ok" }, 400);
  }

  const now = new Date().toISOString();
  try {
    await env.DB.prepare(
      `INSERT INTO empresas (
        nombre, empresa, cargo, empleados, email, mensaje,
        consentimiento, consentimiento_at, contacto_ok, origen_url,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term, ref, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        clip(data.nombre, 120) || null,
        clip(data.empresa, 160),
        clip(data.cargo, 120),
        data.empleados,
        email,
        clip(data.mensaje, 2000) || null,
        now,
        origenDe(request),
        clip(data.utm_source, 120) || null,
        clip(data.utm_medium, 120) || null,
        clip(data.utm_campaign, 120) || null,
        clip(data.utm_content, 120) || null,
        clip(data.utm_term, 120) || null,
        clip(data.ref, 120) || null,
        now,
      )
      .run();
    return json({ status: "ok", message: OK });
  } catch {
    return json({ status: "error", message: ERROR }, 500);
  }
};
