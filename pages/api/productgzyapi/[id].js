// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { connectToDatabase } from "../../../util/mongodb";
const redis = require("redis");
// import { useRouter } from "next/router";

export default async function handler(req, res) {
  // establish a conenction
  // const client = redis.createClient({
  //   url: process.env.NEXT_PUBLIC_REDIS_ENDPOINT,
  //   password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
  // });
  // client.on("error", (err) => console.log("Redis Client Error", err));
  // await client.connect();
  // let data;
  // try {
  //   data = await client.get("cartItem");
  // } catch (error) {
  //   // try
  //   console.log("Redis get error", error);
  //   client.quit(); //closing client
  //   res.status(500).json({ message: "cannot get cartItem" });
  //   /*might need to do more here*/
  // } //catch
  // if (data == null) {
  //   console.log("cache miss");
  //   const { id } = req.query;
  //   const { db } = await connectToDatabase();
  //   data = await db
  //     .collection("product")
  //     .find({ _id: parseInt(id) })
  //     .toArray();
  //   data = JSON.stringify(data);
  //   await client.set("cartItem", data);
  //   data = JSON.parse(data);
  //   return res.status(200).json({ data: data[0] });
  // }
  // /**TODO
  //  * Return only the one item with the correct data
  //  */
  // return res.status(200).json({ data: JSON.parse(data) });
}
