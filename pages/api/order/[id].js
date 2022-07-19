import { connectToDatabase } from "../../../util/mongodb";

export default async function handler(req, res) {
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    res.status(404).json({ error: "unauthorized" });
  }

  console.log("order id is:", req.query.id);

  const { db } = await connectToDatabase();
  let data = await db
    .collection("tracking")
    .find({ _id: req.query.id.toString() })
    .toArray();

  if (data.length == 0) {
    console.log("No such id");
    return res.status(404).json({ data: [] });
  } else {
    console.log(`Found an item with id ${req.query.id}`);
    return res.status(200).json({ data: data[0] });
  }
}
