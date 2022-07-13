import { serialize } from "cookie";
const jwt = require("jsonwebtoken");

export default async function handler(req, res) {
  /*Empty Card*/
  let newToken = jwt.sign(JSON.stringify([]), process.env.secret); // make it empty
  res.setHeader("Set-Cookie", serialize("cart", newToken, { path: "/" }));

  return res.status(200).json({ message: "Cart is emptied" });
}
