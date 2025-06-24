import { loginError } from "@/errors";
import { localize, pre } from "@/utils";
import cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";

const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .post(async (req, res) => {
    const { client, user, locale } = await pre(req, res, {
      prefix: "comments.post",
    });
    try {
      if (!user) throw loginError(locale);
      const { comment } = req.body;
      if (!comment)
        throw new Error(
          localize(locale)(
            "Vous devez sélectionner une citation à commenter",
            "You must select a quote to comment on",
          ),
        );

      await client.connect();
      let query = 'INSERT INTO "public"."comments" (';
      let values: string[] = [];
      let commentValues: string[] = [];
      let fieldId = 1;
      let fields: string[] = [];

      if (comment.note_id) {
        fields.push(`"note_id"`);
        values.push(`$${fieldId}`);
        commentValues.push(comment.note_id);
        fieldId++;
      }
      if (comment.is_feedback) {
        fields.push("is_feedback");
        values.push(`$${fieldId}`);
        commentValues.push("true");
        fieldId++;
      }

      fields.push(`"html"`);
      values.push(`$${fieldId}`);
      commentValues.push(comment.html);
      fieldId++;

      fields.push(`"created_by"`);
      values.push(`$${fieldId}`);
      commentValues.push(user.id);
      fieldId++;

      query += fields.join(",");
      query += ") VALUES (";
      query += values.join(",");
      query += ") RETURNING *";
      const res2 = await client.query(query, commentValues);
      if (res2.rowCount !== 1)
        throw new Error(
          localize(locale)(
            "Le commentaire n'a pas pu être ajouté",
            "The comment could not be added",
          ),
        );

      await client.end();
      res.json({ ...res2.rows[0], comment_email: user.email });
    } catch (error: any) {
      console.log(" ~ .post ~ error:", error);
      await client.end();
      res.send({ error: error.message });
    }
  });

export default handler;
