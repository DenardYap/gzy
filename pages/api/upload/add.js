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
    let curInsertData = {
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
    };
    let newData = await db.collection("product").insertOne(curInsertData);
    // then update cache

    client = redis.createClient({
      url: process.env.NEXT_PUBLIC_REDIS_ENDPOINT,
      password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
    });
    client.on("error", (err) => console.log("Redis Client Error", err));
    await client.connect();
    curInsertData._id = newData.insertedId.toString(); //id?
    await client.hSet(
      "mainCart",
      newData.insertedId.toString(),
      JSON.stringify(curInsertData)
    );
    // });
    await client.quit();

    //revalidate the routes
    // let revalidateRoute =
    //   process.env.NODE_ENV == "production"
    //     ? "https://www.guanzhiyan.com/api/revalidate"
    //     : "http://localhost:3000/api/revalidate";
    // let res2 = await fetch(revalidateRoute, {
    //   method: "POST",
    //   headers: {
    //     Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     operation: 1,
    //     id: newData.insertedId.toString(),
    //   }),
    // });
    // if (!res2.ok) {
    //   console.log("Error in add.js api!!!");

    //   console.log(res2);
    //   res2 = await res2.json();
    //   console.log(res2.err);
    //   return res.status(200).json({ err });
    // }

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
