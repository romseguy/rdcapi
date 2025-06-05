import cors from "cors";
import nextConnect from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

import { Client } from "pg";
import format from "pg-format";

const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .post(async (req, res) => {
    try {
      const supabase = createPagesServerClient({ req, res });
      const {
        data: { user, session },
      } = await supabase.auth.setSession({
        access_token: req.headers.at,
        refresh_token: req.headers.rt,
      });
      if (!user) throw new Error("Vous devez être identifié");

      const comment = req.body.comment;
      console.log("🚀 ~ .post ~ comment:", comment);

      if (!comment.note_id)
        throw new Error("Vous devez sélectionner une citation");

      const client = new Client({
        connectionString: process.env.DATABASE_URL,
      });
      await client.connect();
      const sql = format(
        'INSERT INTO "public"."comments" ("html", "note_id", "created_by") VALUES (\'%s\', \'%s\', \'%s\')',
        comment.html,
        comment.note_id,
        user.id,
      );
      await client.query(sql);
      await client.end();

      res.send("o");
    } catch (error) {
      console.log("🚀 ~ .post ~ error:", error);
      res.send({ error, message: error.message });
    }
  });

export default handler;
