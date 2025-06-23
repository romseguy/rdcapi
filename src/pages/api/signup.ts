import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { SignUpWithPasswordCredentials } from "@supabase/supabase-js";

const email = "";
const password = "";

export default async function handler(req, res) {
  const cookieStore = { get() {}, set() {}, remove() {} };
  const supabase = createRouteHandlerClient<any>({
    cookies: () => cookieStore,
  });

  try {
    const creds: SignUpWithPasswordCredentials = {
      email,
      password,
    };
    const resp = await supabase.auth.signUp(creds);
    if (resp.error) throw resp.error;
    res.send({});
  } catch (error: any) {
    console.log(" ~ handler ~ error:", error);
    res.send({ error: error.message });
  }
}
