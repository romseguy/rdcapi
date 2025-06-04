import cors from "cors";
import nextConnect from "next-connect";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { SignInWithPasswordCredentials } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .get(async (req, res) => {
    try {
      const supabase = createPagesServerClient({ req, res });
      const access_token = req.query.at;
      const refresh_token = req.query.rt;
      const {
        data: { user, session },
      } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      res.json(user);
    } catch (error) {
      res.send("n");
    }
  })
  .post(async (req, res) => {
    try {
      const supabase = createPagesServerClient({ req, res });
      const { email, password } = req.body;
      const creds: SignInWithPasswordCredentials = { email, password };
      const resp = await supabase.auth.signInWithPassword(creds);
      if (resp.error) {
        const respp = await supabase.auth.signUp(creds);
        if (respp.error) throw respp.error;
        return res.json(resp.data);
      }
      res.json(resp.data);
    } catch (error) {
      res.send("n");
    }
  });

export default handler;
