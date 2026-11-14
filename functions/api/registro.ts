import { checked, clip, Env, json, newToken, origenDe, readForm, sameOrigin, sha256, validEmail } from "../_lib/http";
import { enviarMagicLink } from "../_lib/mail";

const OK = "Listo. Te mandamos un link a tu email para entrar. Revisá también spam.";
const EMAIL_INVALIDO = "Ese email no parece válido. ¿Lo mirás de nuevo?";
const YA_REGISTRADO = "Ya estás adentro, te reenviamos el link.";
const ESPERA = "Se llenó esta tanda. Te anotamos para la próxima.";
const ERROR = "No pudimos anotarte ahora. Probá de nuevo en un rato.";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ status: "error", message: ERROR }, 403);

  let data: Record<string, string>;
  try {
    data = await readForm(request);
  } catch {
    return json({ status: "error", message: ERROR }, 400);
  }

  const email = (data.email || "").toLowerCase();
  if (!validEmail(email)) {
    return json({ status: "invalid", message: EMAIL_INVALIDO, field: "email" }, 400);
  }
  if (!checked(data.consentimiento)) {
    return json({ status: "invalid", message: "Necesitamos tu consentimiento para anotarte.", field: "consentimiento" }, 400);
  }

  const now = new Date().toISOString();
  const origen = origenDe(request);
  const nombre = clip(data.nombre, 120) || null;
  const novedades = checked(data.novedades) ? 1 : 0;

  try {
    const existing = await env.DB.prepare("SELECT id, estado FROM registros WHERE email = ?")
      .bind(email)
      .first<{ id: number; estado: string }>();

    if (existing?.estado === "piloto") {
      const sent = await crearLink(env, existing.id, email, now);
      if (!sent) return json({ status: "error", message: ERROR }, 502);
      return json({ status: "exists", message: YA_REGISTRADO });
    }
    if (existing?.estado === "espera") {
      return json({ status: "waitlist", message: ESPERA });
    }

    const cupo = Number(env.CUPO || "50");
    const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM registros WHERE estado = 'piloto'").first<{ n: number }>();
    const estado = (row?.n ?? 0) >= cupo ? "espera" : "piloto";

    const inserted = await env.DB.prepare(
      `INSERT INTO registros (
        email, nombre, consentimiento, consentimiento_at, origen_url, novedades,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term, ref,
        estado, created_at
      ) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        email,
        nombre,
        now,
        origen,
        novedades,
        clip(data.utm_source, 120) || null,
        clip(data.utm_medium, 120) || null,
        clip(data.utm_campaign, 120) || null,
        clip(data.utm_content, 120) || null,
        clip(data.utm_term, 120) || null,
        clip(data.ref, 120) || null,
        estado,
        now,
      )
      .run();

    if (estado === "espera") return json({ status: "waitlist", message: ESPERA });

    const id = inserted.meta.last_row_id;
    const sent = await crearLink(env, id, email, now);
    if (!sent) {
      await env.DB.prepare("DELETE FROM magic_links WHERE registro_id = ?").bind(id).run();
      await env.DB.prepare("DELETE FROM registros WHERE id = ?").bind(id).run();
      return json({ status: "error", message: ERROR }, 502);
    }
    return json({ status: "ok", message: OK });
  } catch {
    return json({ status: "error", message: ERROR }, 500);
  }
};

async function crearLink(env: Env, registroId: number, email: string, now: string): Promise<boolean> {
  const token = newToken();
  const tokenHash = await sha256(token);
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare(
    "INSERT INTO magic_links (registro_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)",
  )
    .bind(registroId, tokenHash, expires, now)
    .run();
  return enviarMagicLink(env, email, token);
}
