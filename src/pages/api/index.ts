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

      const libraries = await sql`SELECT * FROM libraries;`;
      const books = await sql`SELECT * FROM books WHERE library_id = 1;`;
      const notes =
        await sql`SELECT * FROM books INNER JOIN notes ON books.id = notes.book_id;`;
      // console.log("🚀 ~ .get ~ libraries:", libraries);
      // console.log("🚀 ~ .get ~ books:", books);

      // const books =
      //   await sql`SELECT * FROM libraries INNER JOIN books ON libraries.id = books.library_id;`;

      const data = {
        libraries,
        books,
        notes,
      };

      res.json(data);
    } catch (error) {
      res.send("n");
    }
  });

//handler.use(cors());

export default handler;
