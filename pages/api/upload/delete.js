import { connectToDatabase } from "../../../util/mongodb";
const redis = require("redis");

export default async function handler(req, res) {
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    return res.status(404).json({ message: "unauthorized" });
  }

  console.log("deleting the item...");

  const { db } = await connectToDatabase();
  try {
    const ObjectId = require("mongodb").ObjectId;
    await db.collection("product").deleteOne({ _id: ObjectId(req.query.id) });
    console.log("deleted item!");
  } catch (err) {
    console.log(
      "Error in deleting the item from databse in upload/delete.js",
      err
    );
    return res.status(404).json({ err });
  }

  //update the redis cache
  try {
    let client = redis.createClient({
      url: process.env.NEXT_PUBLIC_REDIS_ENDPOINT,
      password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
    });
    client.on("error", (err) => console.log("Redis Client Error", err));

    await client.connect();

    // get rid of this item in cache
    await client.hDel("mainCart", req.query.id.toString());
    await client.quit();
    res.status(200).json({ message: "success" });
  } catch (err) {
    console.log("Error in updating the cache in upload/delete.js", err);
    return res.status(404).json({ err });
  }
}
