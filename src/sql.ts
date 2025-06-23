import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
//@ts-expect-error
const sql = postgres(connectionString);

export default sql;
