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

  if (req.body.id == null) {
    res.status(404).json({ error: "Please present a valid body" });
  }
  const { db } = await connectToDatabase();

  let curData = await db
    .collection("tracking")
    .find({ _id: req.body.id })
    .toArray();
  // maybe need to parse and stringify again??

  // go ahead adn return this data from our database
  res.status(200).json({ data: curData[0] });
}
