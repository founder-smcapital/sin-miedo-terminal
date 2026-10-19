import { auth } from "./firebase";

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  new Headers(init.headers).forEach((value, key) => headers.set(key, value));

  await auth.authStateReady();
  const user = auth.currentUser;
  if (user) {
    headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
  }

  return fetch(input, { ...init, headers });
}

export const isVercelRuntime = __VERCEL_RUNTIME__;
