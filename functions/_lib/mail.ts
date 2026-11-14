import type { Env } from "./http";

const DISCLAIMER = "Zenia es una herramienta de bienestar. No reemplaza la atención profesional.";

export async function enviarMagicLink(env: Env, to: string, token: string): Promise<boolean> {
  if (!env.EMAIL || !env.EMAIL_FROM) return false;
  const origin = (env.APP_ORIGIN || "https://imzenia.com").replace(/\/$/, "");
  const url = `${origin}/entrar?token=${encodeURIComponent(token)}`;
  const text = [
    "Este es tu link para entrar al piloto de Zenia. Vence en 7 días.",
    "",
    url,
    "",
    DISCLAIMER,
  ].join("\n");
  const html = `<p>Este es tu link para entrar al piloto de Zenia. Vence en 7 días.</p><p><a href="${url}">${url}</a></p><p>${DISCLAIMER}</p>`;
  try {
    await env.EMAIL.send({
      to,
      from: { email: env.EMAIL_FROM, name: "Zenia" },
      subject: "Tu link para entrar a Zenia",
      text,
      html,
    });
    return true;
  } catch {
    return false;
  }
}
