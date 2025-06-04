import cors from "cors";
import nextConnect from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";

import { Client } from "pg";
import format from "pg-format";

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
      const sql = format(
        'UPDATE "public"."notes" SET "desc" = \'%s\' WHERE id = \'1\'',
        note.desc,
      );
      await client.query(sql);
      await client.end();

      res.send("o");
    } catch (error) {
      console.log("🚀 ~ .put ~ error:", error);
      res.send({ error, message: error.message });
    }
  });

export default handler;
