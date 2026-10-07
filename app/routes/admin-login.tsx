import {
  Form,
  Link,
  data,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import {
  adminConfigured,
  ownerSession,
  checkAdminKey,
  signInCookie,
  allowLogin,
  checkOrigin,
  privateHeaders,
} from "../editor/auth.server";
import "../editor.css";
export async function loader({ request }: LoaderFunctionArgs) {
  if (await ownerSession(request)) return redirect("/admin");
  return data({ configured: adminConfigured() }, { headers: privateHeaders });
}
export async function action({ request }: ActionFunctionArgs) {
  checkOrigin(request);
  if (!allowLogin(request))
    return data(
      { error: "Too many attempts. Please try again in ten minutes." },
      { status: 429, headers: privateHeaders },
    );
  const form = await request.formData();
  if (!checkAdminKey(String(form.get("key") ?? "")))
    return data(
      { error: "That access key was not accepted." },
      { status: 401, headers: privateHeaders },
    );
  return redirect("/admin", {
    headers: { ...privateHeaders, "Set-Cookie": await signInCookie() },
  });
}
export function meta() {
  return [
    { title: "Owner sign-in · Haseeb Arshad" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}
export function headers() {
  return privateHeaders;
}
export default function AdminLogin() {
  const { configured } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const busy = useNavigation().state !== "idle";
  return (
    <div className="owner-editor ph-no-capture">
      <main id="main-content" className="owner-login">
        <Link to="/">← Back to the portfolio</Link>
        <p className="owner-kicker mt-10">A private workspace</p>
        <h1>A place for unfinished things.</h1>
        <p>
          Capture an idea, shape a project, and decide what’s ready to be
          shared.
        </p>
        {!configured ? (
          <div className="owner-message">
            Owner access has not been configured on this server. The editor
            setup guide in the project explains the remaining step.
          </div>
        ) : (
          <Form method="post" className="owner-panel" autoComplete="off">
            <label htmlFor="owner-key">Owner access key</label>
            <input
              id="owner-key"
              name="key"
              type="password"
              required
              minLength={32}
              autoComplete="off"
              className="mb-5"
            />
            {result?.error && (
              <p role="alert" className="owner-message error">
                {result.error}
              </p>
            )}
            <button className="owner-button primary" disabled={busy}>
              {busy ? "Signing in…" : "Open my editor"}
            </button>
            <p className="owner-help mt-4">
              Your session lasts eight hours. Sign out when you’re finished.
            </p>
          </Form>
        )}
      </main>
    </div>
  );
}
