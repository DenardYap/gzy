import { serialize } from "cookie";
import { connectToDatabase } from "../../../util/mongodb";
const redis = require("redis");
const jwt = require("jsonwebtoken");

export default async function handler(req, res) {
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    res.status(404).json({ error: "unauthorized" });
  }

  const { db } = await connectToDatabase();

  let curData = await db
    .collection("tracking")
    .find()
    .sort({ timestamp: -1 })
    .toArray();

  // TODO: cache in the near future

  // maybe need to parse and stringify again??

  // go ahead adn return this data from our database
  res.status(200).json({ data: curData });
}
