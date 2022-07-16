import { connectToDatabase } from "../../../util/mongodb";
const redis = require("redis");

export default async function handler(req, res) {
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    res.status(404).json({ message: "unauthorized" });
  }
  res.status(200).json({ message: "success" });
}
