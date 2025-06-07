import cors from "cors";
import nextConnect from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";

import { Client } from "pg";
import format from "pg-format";
import sql from "@/sql";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .get(async (req, res) => {
    try {
      const note = await sql`SELECT * FROM notes WHERE id=${req.query.id}`;
      res.json(note[0]);
    } catch (error) {
      res.send("n");
    }
  })
  .put(async (req, res) => {
    const prefix = new Date() + " ~ note.put ~ ";
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
      console.log("🚀 ~ .put ~ note:", note);

      if (!note)
        throw new Error("Vous devez sélectionner une citation à modifier");

      client = new Client({
        connectionString: process.env.DATABASE_URL,
      });
      await client.connect();
      // const query = format(
      //   'UPDATE "public"."notes" SET "desc" = \'%s\' WHERE "id" = \'%s\'',
      //   note.desc,
      //   note.id,
      // );
      // console.log("🚀 ~ .put ~ query:", query);
      const query =
        'UPDATE "public"."notes" SET "desc" = $1, "desc_en" = $2 WHERE "id" = $3';
      await client.query(query, [note.desc, note.desc_en || "", note.id]);

      res.send("o");
    } catch (error) {
      console.log(prefix + "error:", error);
      res.send({ error, message: error.message });
    } finally {
      await client.end();
    }
  })
  .delete(async (req, res) => {
    const prefix = new Date() + " ~ note.delete ~ ";
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

      const id = req.query.id;
      console.log("🚀 ~ .delete ~ id:", id);

      if (!id)
        throw new Error("Vous devez sélectionner une citation à supprimer");

      client = new Client({
        connectionString: process.env.DATABASE_URL,
      });
      await client.connect();
      const query = format(
        'DELETE FROM "public"."notes" WHERE "id" = \'%s\' RETURNING *',
        id,
      );
      console.log("🚀 ~ .delete ~ query:", query);
      const res2 = await client.query(query);
      if (res2.rowCount !== 1)
        throw new Error("La citation n'a pas pu être supprimée");

      res.send("o");
    } catch (error) {
      console.log(prefix + "error:", error);
      res.send({ error, message: error.message });
    } finally {
      await client.end();
    }
  });

export default handler;
