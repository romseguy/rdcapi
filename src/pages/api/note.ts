import cors from "cors";
import nextConnect from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";

import { Client } from "pg";
import format from "pg-format";
import sql from "@/sql";

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
    try {
      const note = req.body.note;
      console.log("🚀 ~ .put ~ note:", note);

      const client = new Client({
        connectionString: process.env.DATABASE_URL,
      });
      await client.connect();
      const query = format(
        'UPDATE "public"."notes" SET "desc" = \'%s\' WHERE "id" = \'%s\'',
        note.desc,
        note.id,
      );
      await client.query(query);
      await client.end();

      res.send("o");
    } catch (error) {
      console.log("🚀 ~ .put ~ error:", error);
      res.send({ error, message: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const id = req.query.id;
      console.log("🚀 ~ .delete ~ id:", id);

      const client = new Client({
        connectionString: process.env.DATABASE_URL,
      });
      await client.connect();
      const query = format(
        'DELETE FROM "public"."notes" WHERE "id" = \'%s\'',
        id,
      );
      await client.query(query);
      await client.end();

      res.send("o");
    } catch (error) {
      console.log("🚀 ~ .delete ~ error:", error);
      res.send({ error, message: error.message });
    }
  });

export default handler;
