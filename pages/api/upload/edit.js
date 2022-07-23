import { connectToDatabase } from "../../../util/mongodb";
const redis = require("redis");

export default async function handler(req, res) {
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    res.status(404).json({ message: "unauthorized" });
  }

  let listName = [
    "price",
    "quantity",
    "imageTitle",
    "imageTitleEn",
    "imageTitleZhc",
    "description",
    "descriptionEn",
    "descriptionZhc",
    "type",
  ];
  const { db } = await connectToDatabase();
  const ObjectId = require("mongodb").ObjectId;
  try {
    let curData = {};
    for (let i = 0; i < listName.length; i++) {
      if (req.body[listName[i]] != null) {
        // this item is present
        curData[listName[i]] = req.body[listName[i]];
      }
    }

    await db
      .collection("product")
      .updateOne({ _id: ObjectId(req.body.id) }, { $set: curData });

    console.log("data updated");
  } catch (err) {
    console.log("Something's wrong in upload/edit.js:", err);
    return res.status(404).json({ err });
  }

  // then update the cache
  try {
    let client = redis.createClient({
      url: process.env.NEXT_PUBLIC_REDIS_ENDPOINT,
      password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
    });
    client.on("error", (err) => console.log("Redis Client Error", err));
    await client.connect();

    let data;
    data = await db
      .collection("product")
      .find({ _id: ObjectId(req.body.id) })
      .toArray();
    data = await JSON.parse(JSON.stringify(data)); // this will return a list of items to us

    await client.HSET("mainCart", req.body.id, JSON.stringify(data[0])); //reset the data
    console.log("cache updated");
    await client.quit();
    return res.status(200).json({ message: "data updated" });
  } catch (err) {
    console.log(
      "Something is wrong in upload/edit.js when updating the cache:",
      err
    );
    return res.status(404).json({ err });
  }
}
