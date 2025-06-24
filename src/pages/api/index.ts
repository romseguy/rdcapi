import cors from "cors";
import nextConnect from "next-connect";
import sql from "@/sql";
import { NextApiRequest, NextApiResponse } from "next";
import { pre } from "@/utils";

const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .get(async (req, res) => {
    const { client, user, locale } = await pre(req, res, {
      prefix: "index.get",
    });

    try {
      const libraries = await sql`SELECT * FROM libraries;`;
      const books = await sql`SELECT * FROM books;`;
      const notes =
        await sql`SELECT public.notes.*, auth.users.email AS note_email FROM public.books
        INNER JOIN public.notes ON public.books.id = public.notes.book_id
        INNER JOIN auth.users ON auth.users.id = public.notes.created_by
        ;`;
      const comments = await sql`
      SELECT public.comments.*, auth.users.email AS comment_email FROM public.comments
      INNER JOIN auth.users ON auth.users.id = public.comments.created_by
      `;

      const data = {
        libraries,
        books,
        notes,
        comments,
      };

      res.json(data);
    } catch (error: any) {
      console.log(" ~ .get ~ error:", error);
      res.send({ error: error.message });
    }
  })
  .post(async (req, res) => {
    console.log(req.body);
    res.send("");
  });

export default handler;
