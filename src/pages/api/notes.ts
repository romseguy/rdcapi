import cors from "cors";
import nextConnect from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

import { Client } from "pg";
import format from "pg-format";

const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .post(async (req, res) => {
    const prefix =
      process.env.NEXT_PUBLIC_ENV + " ~ " + new Date() + " ~ notes.post ~ ";
    const client =
      process.env.NEXT_PUBLIC_ENV === "production"
        ? new Client({
            connectionString: process.env.DATABASE_URL,
          })
        : {
            connect() {},
            end() {},
            query(sql, values) {
              return { rowCount: 1, rows: [{ id: "999" }] };
            },
          };

    try {
      const supabase = createPagesServerClient({ req, res });
      const {
        data: { user, session },
      } = await supabase.auth.setSession({
        access_token: req.headers.at,
        refresh_token: req.headers.rt,
      });
      if (!user) throw new Error("Vous devez être identifié");

      const { note } = JSON.parse(req.body);

      if (!note.book_id) throw new Error("Vous devez sélectionner un livre");

      await client.connect();
      const query =
        'INSERT INTO "public"."notes" ("desc", "book_id", "created_by") VALUES ($1, $2, $3) RETURNING *';
      const values = [note.desc, note.book_id, user.id];
      const res2 = await client.query(query, values);
      if (res2.rowCount !== 1)
        throw new Error("La citation n'a pas pu être ajoutée");

      await client.end();
      res.send(res2.rows[0]);
    } catch (error) {
      await client.end();
      console.log(prefix + "error:", error);
      res.send({ error, message: error.message });
    }
  });

export default handler;
