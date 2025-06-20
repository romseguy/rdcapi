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
    const prefix = new Date() + " ~ comment.delete ~ ";
    console.log(prefix);
    const client =
      process.env.NEXT_PUBLIC_ENV === "production"
        ? new Client({
            connectionString: process.env.DATABASE_URL,
          })
        : {
            connect() {},
            end() {},
            query(sql, values) {
              return { rowCount: 1 };
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

      const id = req.query.id;
      console.log(prefix + "id", id);

      if (!id)
        throw new Error("Vous devez sélectionner un commentaire à supprimer");

      await client.connect();
      const query = format(
        'DELETE FROM "public"."comments" WHERE "id" = \'%s\' RETURNING *',
        id,
      );
      console.log(prefix + "query", query);
      const res2 = await client.query(query);
      if (res2.rowCount !== 1)
        throw new Error("Le commentaire n'a pas pu être supprimé");

      await client.end();
      res.send({});
    } catch (error) {
      console.log(prefix + "error:", error);
      await client.end();
      res.send({ error, message: error.message });
    }
  });

export default handler;
