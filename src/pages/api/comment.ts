import cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";

import { commentError, loginError } from "@/errors";
import { localize, pre } from "@/utils";
import format from "pg-format";

const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .delete(async (req, res) => {
    const { client, user, locale } = await pre(req, res, {
      prefix: "comment.delete",
    });

    try {
      if (!user) throw loginError(locale);
      const id = req.query.id;
      if (!id) throw commentError(locale);

      await client.connect();
      const query = format(
        'DELETE FROM "public"."comments" WHERE "id" = \'%s\' RETURNING *',
        id,
      );
      const res2 = await client.query(query);
      if (res2.rowCount !== 1)
        throw new Error(
          localize(locale)(
            "Le commentaire n'a pas pu être supprimé",
            "The comment could not be deleted",
          ),
        );

      await client.end();
      res.send({});
    } catch (error: any) {
      console.log(" ~ .delete ~ error:", error);
      await client.end();
      res.send({ error: error.message });
    }
  });

export default handler;
