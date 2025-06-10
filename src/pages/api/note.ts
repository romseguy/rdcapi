import cors from "cors";
import nextConnect from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";

import { Client } from "pg";
import sql from "@/sql";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .get(async (req, res) => {
    const prefix = new Date() + " ~ GET /note ~ ";
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    try {
      const id = req.query.id;
      if (!id)
        throw new Error("Vous devez sélectionner une citation à supprimer");

      await client.connect();
      const res2 = client.query("SELECT * FROM notes WHERE id=$1", [id]);
      if (res2.rowCount !== 1)
        throw new Error("La citation n'a pas été trouvée");
      await client.end();
      res.json(res2.row[0]);
    } catch (error) {
      await client.end();
      res.send({ error, message: error.message });
    }
  })
  .put(async (req, res) => {
    const prefix = new Date() + " ~ PUT /note ~ ";
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

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
      if (!note)
        throw new Error("Vous devez sélectionner une citation à modifier");

      await client.connect();
      const query =
        'UPDATE "public"."notes" SET "desc" = $1, "desc_en" = $2 WHERE "id" = $3 RETURNING *';
      const res2 = await client.query(query, [
        note.desc,
        note.desc_en || "",
        note.id,
      ]);
      if (res2.rowCount !== 1)
        throw new Error("La citation n'a pas pu être modifiée");
      await client.end();
      //res.send(res2.row[0]);
      res.send("o");
    } catch (error) {
      await client.end();
      res.send({ error, message: error.message });
    }
  })
  .delete(async (req, res) => {
    const prefix = new Date() + " ~ DELETE /note ~ ";
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    try {
      const id = req.query.id;
      if (!id)
        throw new Error("Vous devez sélectionner une citation à supprimer");

      const supabase = createPagesServerClient({ req, res });
      const {
        data: { user, session },
      } = await supabase.auth.setSession({
        access_token: req.headers.at,
        refresh_token: req.headers.rt,
      });
      if (!user) throw new Error("Vous devez être identifié");

      await client.connect();
      const query = 'DELETE FROM "public"."notes" WHERE "id" = $1 RETURNING *';
      const res2 = await client.query(query, [id]);
      if (res2.rowCount !== 1)
        throw new Error("La citation n'a pas pu être supprimée");
      await client.end();
      res.send(res2.row[0]);
    } catch (error) {
      await client.end();
      console.log(prefix + "error:", error);
      res.send({ error, message: error.message });
    }
  });

export default handler;
