// Sessão do admin por cookie ASSINADO (HMAC-SHA256) com validade.
// Uso exclusivo no servidor. O valor do cookie não pode ser forjado sem conhecer o segredo.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "fiipro_admin";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 8;

// Usa ADMIN_SESSION_SECRET se existir; caso contrário, reaproveita ADMIN_PASSWORD (já configurada).
function getSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD;
  return secret && secret.length > 0 ? secret : null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(`fiipro-admin:${payload}`).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function createAdminToken(): string | null {
  const key = getSecret();
  if (!key) return null;
  const exp = String(Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS);
  return `${exp}.${sign(exp, key)}`;
}

export function verifyAdminToken(token: string | undefined): boolean {
  const key = getSecret();
  if (!key || !token) return false;
  const [exp, signature] = token.split(".");
  if (!exp || !signature || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(signature, sign(exp, key));
}

// Compara a senha em tempo constante (via hash, para igualar os tamanhos).
export function passwordMatches(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const hash = (value: string) => createHmac("sha256", "fiipro-pw-compare").update(value).digest();
  return timingSafeEqual(hash(input), hash(password));
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Acesso administrativo não autorizado");
  }
}
