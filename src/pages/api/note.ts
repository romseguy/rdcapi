import { loginError, noteError } from "@/errors";
import { localize, pre } from "@/utils";
import cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";

const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .get(async (req, res) => {
    const { client, user, locale } = await pre(req, res, {
      prefix: "note.get",
    });
    try {
      const id = req.query.id;
      if (!id) throw new Error("Vous devez sélectionner une citation");

      await client.connect();
      const res2 = client.query("SELECT * FROM notes WHERE id=$1", [id]);
      if (res2.rowCount !== 1)
        throw new Error("La citation n'a pas été trouvée");
      await client.end();
      res.json(res2.row[0]);
    } catch (error: any) {
      console.log(" ~ .get ~ error:", error);
      await client.end();
      res.send({ error: error.message });
    }
  })
  .put(async (req, res) => {
    const { client, user, locale } = await pre(req, res, {
      prefix: "note.put",
    });

    try {
      if (!user) throw loginError(locale);
      const { note } = req.body;
      if (!note) throw noteError(locale);

      await client.connect();
      let query = 'UPDATE "public"."notes" SET ';
      let values: string[] = [];
      let fieldId = 1;
      let fields: string[] = [];

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

      await client.query(query, values);
      await client.end();
      res.send({});
    } catch (error: any) {
      console.log(" ~ .put ~ error:", error);
      await client.end();
      res.send({ error: error.message });
    }
  })
  .delete(async (req, res) => {
    const { client, user, locale } = await pre(req, res, {
      prefix: "note.delete",
    });
    try {
      if (!user) throw loginError(locale);
      const id = req.query.id;
      if (!id) throw noteError(locale);

      await client.connect();
      const query = 'DELETE FROM "public"."notes" WHERE "id" = $1 RETURNING *';

      const res2 = await client.query(query, [id]);
      if (res2.rowCount !== 1)
        throw new Error(
          localize(locale)(
            "La citation n'a pas pu être supprimée",
            "The quote could not be deleted",
          ),
        );

      await client.end();
      //res.send(res2.row[0]);
      res.send({});
    } catch (error: any) {
      console.log(" ~ .delete ~ error:", error);
      await client.end();
      res.send({ error: error.message });
    }
  });

export default handler;
