import cors from "cors";
import nextConnect from "next-connect";
import sql from "@/sql";
import { NextApiRequest, NextApiResponse } from "next";

// const cors = Cors({
//   methods: ["POST", "GET", "HEAD"],
// });

// const init = (req, res) => {
//   return new Promise((resolve, reject) => {
//     cors(req, res, (result) => {
//       resolve(result);
//     });
//   });
// };

//const handler = async (req, res) => {
const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .get(async (req, res) => {
    try {
      //await init(req, res);

      //const users = await sql`SELECT * FROM "auth"."users";`;

      const libraries = await sql`SELECT * FROM libraries;`;
      const books = await sql`SELECT * FROM books;`;
      const notes =
        await sql`SELECT public.notes.*, auth.users.email FROM public.books
        INNER JOIN public.notes ON public.books.id = public.notes.book_id
        INNER JOIN auth.users ON auth.users.id = public.notes.created_by
        ;`;
      const comments = await sql`
      SELECT public.comments.*, auth.users.email FROM public.comments
      INNER JOIN public.notes ON public.comments.note_id = public.notes.id
              INNER JOIN auth.users ON auth.users.id = public.notes.created_by
      `;
      // const books =
      //   await sql`SELECT * FROM libraries INNER JOIN books ON libraries.id = books.library_id;`;

      const data = {
        libraries,
        books,
        notes,
        comments,
      };

      res.json(data);
    } catch (error) {
      res.send("n");
    }
  });

//handler.use(cors());

export default handler;
