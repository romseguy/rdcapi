import cors from "cors";
import nextConnect from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";

import { Client } from "pg";
import format from "pg-format";
import sql from "@/sql";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .delete(async (req, res) => {
    const prefix = new Date() + " ~ comments.delete ~ ";
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
        throw new Error("Vous devez sélectionner un commentaire à supprimer");

      client = new Client({
        connectionString: process.env.DATABASE_URL,
      });
      await client.connect();
      const query = format(
        'DELETE FROM "public"."comments" WHERE "id" = \'%s\' AND "created_by" = \'%s\' RETURNING *',
        id,
        user.id,
      );
      console.log("🚀 ~ .delete ~ query:", query);
      const res2 = await client.query(query);
      if (res2.rowCount !== 1)
        throw new Error("Le commentaire n'a pas pu être supprimé");

      res.send({});
    } catch (error) {
      console.log(prefix + "error:", error);
      res.send({ error, message: error.message });
    } finally {
      await client.end();
    }
  });

export default handler;
