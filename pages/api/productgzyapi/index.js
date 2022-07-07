// GET and SET items in the cart
import { connectToDatabase } from "../../../util/mongodb";
const redis = require("redis");

// return every single item in the cart, for display in shopping cart, check out, and cart page
export default async function handler(req, res) {
  console.log("Getting cart item...");
  const client = redis.createClient({
    url: process.env.NEXT_PUBLIC_REDIS_ENDPOINT,
    password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();

  let data = client.get("mainCache");
  if (data == null) {
    //empty
    console.log("cache miss");
    const { db } = await connectToDatabase();
    data = await db.collection("product").find().toArray();
    data = JSON.parse(JSON.stringify(data));
    // add an amount key to the list for later
    data = data.map((item) => ({ ...item, amount: 0 }));
    data = JSON.stringify(data);
    await client.set("mainCache", data);
  } //if
  else {
    console.log("cache hit");
  } // else
  data = await JSON.parse(data);

  console.log("Closing client connection...");
  await client.quit();
  return res.status(200).json({ data });
}
