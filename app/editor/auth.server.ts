import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createCookie, redirect } from "react-router";

function key() {
  return process.env.PORTFOLIO_ADMIN_KEY?.trim() ?? "";
}
export function adminConfigured() {
  return key().length >= 32;
}
function cookie() {
  if (!adminConfigured())
    throw new Response("Owner sign-in has not been configured.", {
      status: 503,
    });
  return createCookie("portfolio_owner", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 60 * 60,
    secrets: [createHash("sha256").update(key()).digest("hex")],
  });
}
function equal(a: string, b: string) {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}
export function checkAdminKey(value: string) {
  return adminConfigured() && equal(value, key());
}
export async function ownerSession(
  request: Request,
): Promise<{ csrf: string; expires: number } | null> {
  if (!adminConfigured()) return null;
  const session = await cookie().parse(request.headers.get("Cookie"));
  return session &&
    typeof session.csrf === "string" &&
    typeof session.expires === "number" &&
    session.expires > Date.now()
    ? session
    : null;
}
export async function requireOwner(request: Request) {
  const session = await ownerSession(request);
  if (!session) throw redirect("/admin/login", { headers: privateHeaders });
  return session;
}
export async function signInCookie() {
  return cookie().serialize({
    csrf: randomBytes(24).toString("hex"),
    expires: Date.now() + 8 * 60 * 60 * 1000,
  });
}
export async function signOutCookie() {
  return cookie().serialize({}, { maxAge: 0 });
}
export function checkOrigin(request: Request) {
  const expected = new URL(request.url).origin;
  if (
    request.headers.get("Origin") !== expected ||
    request.headers.get("Sec-Fetch-Site") === "cross-site"
  )
    throw new Response("Request origin was not accepted.", {
      status: 403,
      headers: privateHeaders,
    });
}
export function checkCsrf(
  request: Request,
  session: { csrf: string },
  form: FormData,
) {
  checkOrigin(request);
  if (!equal(String(form.get("csrf") ?? ""), session.csrf))
    throw new Response("Please reload the editor and try again.", {
      status: 403,
      headers: privateHeaders,
    });
}
const attempts = new Map<string, { count: number; since: number }>();
export function allowLogin(request: Request) {
  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  for (const [id, record] of attempts)
    if (now - record.since > 10 * 60 * 1000) attempts.delete(id);
  const record = attempts.get(address) ?? { count: 0, since: now };
  record.count++;
  attempts.set(address, record);
  return record.count <= 10;
}
export const privateHeaders = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "same-origin",
  "X-Frame-Options": "DENY",
};
