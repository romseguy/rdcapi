import { bookError, loginError } from "@/errors";
import { localize, pre } from "@/utils";
import cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";

const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .post(async (req, res) => {
    const { client, user, locale } = await pre(req, res, {
      prefix: "notes.post",
    });

    try {
      if (!user) throw loginError(locale);
      const { note } = req.body;
      if (!note.book_id) throw bookError(locale);

      await client.connect();
      const query =
        'INSERT INTO "public"."notes" ("desc", "book_id", "created_by") VALUES ($1, $2, $3) RETURNING *';
      const values = [
        note.desc ? note.desc : note.desc_en,
        note.book_id,
        user.id,
      ];

      const res2 = await client.query(query, values);
      if (res2.rowCount !== 1)
        throw new Error(
          localize(locale)(
            "La citation n'a pas pu être ajoutée",
            "The quote could not be added",
          ),
        );

      await client.end();
      res.send(res2.rows[0]);
    } catch (error: any) {
      console.log(" ~ .post ~ error:", error);
      await client.end();
      res.send({ error: error.message });
    }
  });

export default handler;
