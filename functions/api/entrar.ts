import { Env, json, sha256 } from "../_lib/http";

const OK = "Listo. Tu lugar en el piloto está confirmado.";
const INVALIDO = "Ese link no sirve o ya venció. Volvé a registrarte.";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!token) return json({ status: "invalid", message: INVALIDO }, 400);

  try {
    const tokenHash = await sha256(token);
    const link = await env.DB.prepare(
      `SELECT magic_links.id, magic_links.expires_at, magic_links.used_at, registros.estado
       FROM magic_links
       JOIN registros ON registros.id = magic_links.registro_id
       WHERE magic_links.token_hash = ?`,
    )
      .bind(tokenHash)
      .first<{ id: number; expires_at: string; used_at: string | null; estado: string }>();

    if (!link || link.estado !== "piloto" || link.expires_at < new Date().toISOString()) {
      return json({ status: "invalid", message: INVALIDO }, 400);
    }
    if (!link.used_at) {
      await env.DB.prepare("UPDATE magic_links SET used_at = ? WHERE id = ?")
        .bind(new Date().toISOString(), link.id)
        .run();
    }
    return json({ status: "ok", message: OK });
  } catch {
    return json({ status: "invalid", message: INVALIDO }, 500);
  }
};
