import cors from "cors";
import nextConnect from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

import { Client } from "pg";
import format from "pg-format";

const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .post(async (req, res) => {
    const prefix = "🚀 ~ comments.post ~ ";
    let client;

    try {
      const supabase = createPagesServerClient({ req, res });
      const {
        data: { user, session },
      } = await supabase.auth.setSession({
        access_token: req.headers.at,
        refresh_token: req.headers.rt,
      });
      if (!user) throw new Error("Vous devez être identifié");

      const { comment } = JSON.parse(req.body);
      console.log("🚀 ~ .post ~ comment:", comment);

      if (!comment || !comment.note_id)
        throw new Error("Vous devez sélectionner une citation à commenter");

      client = new Client({
        connectionString: process.env.DATABASE_URL,
      });
      await client.connect();
      const sql = format(
        'INSERT INTO "public"."comments" ("html", "note_id", "created_by") VALUES (\'%s\', \'%s\', \'%s\') RETURNING *',
        comment.html,
        comment.note_id,
        user.id,
      );
      console.log("🚀 ~ .post ~ sql:", sql);
      const res2 = await client.query(sql);
      if (res2.rowCount !== 1)
        throw new Error("Le commentaire n'a pas pu être ajouté");

      res.json({ ...res2.rows[0], email: user.email });
    } catch (error) {
      console.log(prefix + "error:", error);
      res.send({ error, message: error.message });
    } finally {
      await client.end();
    }
  });

export default handler;
