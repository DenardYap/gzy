import { serialize } from "cookie";
const jwt = require("jsonwebtoken");

export default async function handler(req, res) {
  // error checking for request body, it must include amount, max, and invalid
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    return res.status(404).json({ message: "unauthorized" });
  }

  try {
    if (req.body.referrer) {
      if (!parseInt(req.body.referrer)) {
        // not a int referrer for some reasons
        console.log("Referrer not a number", err);
        return res.status(404).json({ error: "Referrer not a number" });
      }

      await res.setHeader(
        "Set-Cookie",
        serialize("referrer", req.body.referrer, { path: "/" })
      );
      return res.status(200).json({ message: "success" });
    }
  } catch (err) {
    console.log("Something's wrong in settign referrer cookie", err);
    return res
      .status(404)
      .json({ error: "Something's wrong in settign referrer cookie" });
  }
}
