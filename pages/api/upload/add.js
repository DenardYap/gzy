import { connectToDatabase } from "../../../util/mongodb";
const redis = require("redis");

export default async function handler(req, res) {
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    return res.status(404).json({ message: "unauthorized" });
  }
  console.log("adding item...");
  if (
    req.body.price == null ||
    req.body.quantity == null ||
    req.body.imageTitle == null ||
    req.body.imageTitleEn == null ||
    req.body.imageTitleZhc == null ||
    req.body.description == null ||
    req.body.descriptionEn == null ||
    req.body.descriptionZhc == null ||
    req.body.type == null ||
    req.body.image == null
  ) {
    return res.status(500).json({ error: "Body format is incorrect" });
  }
  let client = null;
  try {
    const { db } = await connectToDatabase();

    await db.collection("product").insertOne({
      price: req.body.price.toString(),
      quantity: req.body.quantity.toString(),
      image: req.body.image.toString(),
      imageTitle: req.body.imageTitle.toString(),
      imageTitleZhc: req.body.imageTitleZhc.toString(),
      imageTitleEn: req.body.imageTitleEn.toString(),
      description: req.body.description.toString(),
      descriptionZhc: req.body.descriptionZhc.toString(),
      descriptionEn: req.body.descriptionEn.toString(),
      type: req.body.type.toString(),
    });
    // then update cache

    client = redis.createClient({
      url: process.env.NEXT_PUBLIC_REDIS_ENDPOINT,
      password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
    });
    client.on("error", (err) => console.log("Redis Client Error", err));
    await client.connect();

    let data;
    data = await db.collection("product").find().toArray();
    data = await JSON.parse(JSON.stringify(data)); // this will return a list of items to us
    // fetch the data from db and cache it
    data.forEach(async (item) => {
      await client.hSet("mainCart", item._id, JSON.stringify(item));
    });
    await client.quit();
    return res.status(200).json({ message: "updated successfully" });
  } catch (err) {
    if (client) {
      await client.quit();
    }
    console.log("Error in /upload/add.js:", err);
    return res
      .status(404)
      .json({ error: "error in trying to update database in upload/add.js" });
  }
}
