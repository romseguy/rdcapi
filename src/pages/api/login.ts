import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { SignInWithPasswordCredentials } from "@supabase/supabase-js";

const email = "";
const password = "";

export default async function handler(req, res) {
  const cookieStore = { get() {}, set() {}, remove() {} };
  const supabase = createRouteHandlerClient<any>({
    cookies: () => cookieStore,
  });

  try {
    const creds: SignInWithPasswordCredentials = { email, password };
    const resp = await supabase.auth.signInWithPassword(creds);
    if (resp.error) throw resp.error;
    res.send("o");
  } catch (error) {
    res.send("n");
  }
}
