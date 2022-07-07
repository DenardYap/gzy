// GET and SET items in the cart
import { connectToDatabase } from "../../../../util/mongodb";
const redis = require("redis");

// return every single item in the cart, for display in shopping cart, check out, and cart page
export default async function handler(req, res) {
  const { id } = req.query;
  console.log(`Deleting cart item ${id}...`);
  const client = redis.createClient({
    url: process.env.NEXT_PUBLIC_REDIS_ENDPOINT,
    password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  let curData = await client.get("cartItem");
  curData = await JSON.parse(curData);
  for (let i = 0; i < curData.length; i++) {
    if (curData[i]._id.toString() === id.toString()) {
      curData.splice(i, 1);
      await client.set("cartItem", JSON.stringify(curData));

      console.log("Closing client connection...");
      await client.quit();
      return res.status(200).json({ message: "successfully deleted" });
    }
  }

  console.log("Closing client connection...");
  await client.quit();
  return res.status(200).json({ message: "id doesn't exist" });
}
