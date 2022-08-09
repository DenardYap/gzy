import { serialize } from "cookie";
const jwt = require("jsonwebtoken");

export default async function handler(req, res) {
  /*Empty Card*/
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    return res.status(404).json({ message: "unauthorized" });
  }
}
