import cors from "cors";
import nextConnect from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

import { Client } from "pg";
import format from "pg-format";

const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .post(async (req, res) => {
    const prefix = new Date() + " ~ notes.post ~ ";
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

      const note = req.body.note;
      console.log("🚀 ~ .post ~ note:", note);

      if (!note.book_id) throw new Error("Vous devez sélectionner un livre");

      client = new Client({
        connectionString: process.env.DATABASE_URL,
      });
      await client.connect();
      const query = format(
        'INSERT INTO "public"."notes" ("desc", "book_id", "created_by") VALUES (\'%s\', \'%s\', \'%s\') RETURNING *',
        note.desc,
        note.book_id,
        user.id,
      );
      console.log("🚀 ~ .post ~ query:", query);
      const res2 = await client.query(query);
      if (res2.rowCount !== 1)
        throw new Error("La citation n'a pas pu être ajoutée");

      res.send("o");
    } catch (error) {
      console.log(prefix + "error:", error);
      res.send({ error, message: error.message });
    } finally {
      await client.end();
    }
  });

export default handler;
