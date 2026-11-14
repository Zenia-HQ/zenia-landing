export interface Env {
  DB: D1Database;
  CUPO?: string;
  APP_ORIGIN?: string;
  EMAIL_FROM?: string;
  EMAIL?: {
    send(message: {
      to: string;
      from: { email: string; name?: string };
      subject: string;
      text: string;
      html: string;
    }): Promise<{ messageId?: string }>;
  };
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

export async function readForm(request: Request): Promise<Record<string, string>> {
  const form = await request.formData();
  const out: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") out[key] = value.trim();
  }
  return out;
}

export function checked(value: string | undefined): boolean {
  return value === "on" || value === "true" || value === "1";
}

export function validEmail(value: string): boolean {
  if (!value || value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function clip(value: string | undefined, max: number): string {
  return (value || "").slice(0, max);
}

export function origenDe(request: Request): string {
  const referer = request.headers.get("referer");
  if (referer) return referer.slice(0, 500);
  return new URL(request.url).origin + "/";
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
