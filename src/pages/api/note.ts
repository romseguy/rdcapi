import cors from "cors";
import nextConnect from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";

import { Client } from "pg";
import sql from "@/sql";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

const checkLogin = process.env.NEXT_PUBLIC_ENV === "production";

const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .get(async (req, res) => {
    const prefix = new Date() + " ~ GET /note ~ ";
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
      if (checkLogin) {
        const supabase = createPagesServerClient({ req, res });
        const {
          data: { user, session },
        } = await supabase.auth.setSession({
          access_token: req.headers.at,
          refresh_token: req.headers.rt,
        });
        if (!user) throw new Error("Vous devez être identifié");
      }

      const { note } = JSON.parse(req.body);
      if (!note)
        throw new Error("Vous devez sélectionner une citation à modifier");

      await client.connect();
      let query = 'UPDATE "public"."notes" SET ';
      let values = [];
      let fieldId = 1;
      let fields = [];

      if (note.desc) {
        fields.push(`"desc" = $${fieldId}`);
        values.push(note.desc);
        fieldId++;
      }
      if (note.desc_en) {
        fields.push(`"desc_en" = $${fieldId}`);
        values.push(note.desc_en);
        fieldId++;
      }
      if (note.page) {
        fields.push(`"page" = $${fieldId}`);
        values.push(note.page);
        fieldId++;
      }

      query += fields.join(",");

      query += ` WHERE "id" = $${fieldId} RETURNING *`;
      values.push(note.id);

      //console.log(prefix + "sql", query);
      //console.log(prefix + "values", values);

      const res2 = await client.query(query, values);
      if (res2.rowCount !== 1)
        throw new Error("La citation n'a pas pu être modifiée");
      await client.end();
      //res.send(res2.row[0]);
      res.send({});
    } catch (error) {
      await client.end();
      res.send({ error, message: error.message });
    }
  })
  .delete(async (req, res) => {
    const prefix = new Date() + " ~ DELETE /note ~ ";
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
      const id = req.query.id;
      if (!id)
        throw new Error("Vous devez sélectionner une citation à supprimer");

      if (checkLogin) {
        const supabase = createPagesServerClient({ req, res });
        const {
          data: { user, session },
        } = await supabase.auth.setSession({
          access_token: req.headers.at,
          refresh_token: req.headers.rt,
        });
        if (!user) throw new Error("Vous devez être identifié");
      }

      await client.connect();
      const query = 'DELETE FROM "public"."notes" WHERE "id" = $1 RETURNING *';
      const res2 = await client.query(query, [id]);
      if (res2.rowCount !== 1)
        throw new Error("La citation n'a pas pu être supprimée");
      await client.end();
      //res.send(res2.row[0]);
      res.send({});
    } catch (error) {
      await client.end();
      console.log(prefix + "error:", error);
      res.send({ error, message: error.message });
    }
  });

export default handler;
