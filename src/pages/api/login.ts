import cors from "cors";
import nextConnect from "next-connect";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { SignInWithPasswordCredentials } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .get(async (req, res) => {
    const prefix = new Date() + " ~ GET /login ~ ";

    try {
      if (process.env.NODE_ENV === "production") {
        const supabase = createPagesServerClient({ req, res });
        const access_token = req.headers.at as string;
        const refresh_token = req.headers.rt as string;
        const {
          data: { user, session },
        } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (!user) throw new Error("Cet utilisateur est introuvable");

        res.json(user);
      } else res.json({});
    } catch (error) {
      console.log(prefix + "error:", error);
      res.send({ error, message: error.message });
    }
  })
  .post(async (req, res) => {
    const prefix = new Date() + " ~ POST /login ~ ";

    try {
      if (process.env.NODE_ENV === "production") {
        const supabase = createPagesServerClient({ req, res });
        const { email, password } = req.body;
        const creds: SignInWithPasswordCredentials = { email, password };
        const resp = await supabase.auth.signInWithPassword(creds);
        if (resp.error) {
          if (password.length >= 6) {
            const respp = await supabase.auth.signUp(creds);
            if (respp.error) throw respp.error;
          } else {
            throw new Error("Identifiants incorrects");
          }
          return res.json(respp.data);
        }
        res.json(resp.data);
      } else res.json({});
    } catch (error) {
      console.log(prefix + "error:", error);
      res.send({ error, message: error.message });
    }
  });

export default handler;
