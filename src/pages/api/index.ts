import cors from "cors";
import nextConnect from "next-connect";
import sql from "@/sql";

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
const handler = nextConnect()
  .use(cors())
  .get(async (req, res) => {
    try {
      //await init(req, res);
      const data = await sql`SELECT * FROM books`;
      res.json(data);
    } catch (error) {
      res.send("n");
    }
  });

//handler.use(cors());

export default handler;
