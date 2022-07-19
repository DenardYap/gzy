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

  // for future when we implement tracking number...
  // if (req.body.id == null || req.body.tracking_number == null) {
  //   res.status(404).json({ error: "Please present a valid body" });
  // }

  // for now just manually upload the statuses
  if (req.body.id == null || req.body.status == null) {
    res.status(404).json({ error: "Please present a valid body" });
  }

  console.log("uploading tracking number...");
  const { db } = await connectToDatabase();

  await db.collection("tracking").updateOne(
    { _id: req.body.id },
    // { $set: { tracking_number: req.body.tracking_number, status: 2 } }
    { $set: { status: req.body.status } }
  );
  // res.status(200).json({ message: "successfully updated tracking number" });
  res.status(200).json({ message: "successfully updated status of order" });
}
