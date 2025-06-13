import cors from "cors";
import nextConnect from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

const handler = nextConnect<NextApiRequest, NextApiResponse>()
  .use(cors())
  .post(async (req, res) => {});

export default handler;
