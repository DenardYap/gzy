// GET and SET items in the cart
import { connectToDatabase } from "../../../util/mongodb";
const redis = require("redis");
function parseJSONstr(s) {
  s = s
    .replace(/\\n/g, "\\n")
    .replace(/\\'/g, "\\'")
    .replace(/\\"/g, '\\"')
    .replace(/\\&/g, "\\&")
    .replace(/\\r/g, "\\r")
    .replace(/\\t/g, "\\t")
    .replace(/\\b/g, "\\b")
    .replace(/\\f/g, "\\f");
  // remove non-printable and other non-valid JSON chars
  s = s.replace(/[\u0000-\u0019]+/g, "");
  return s;
}
// return every single item in the cart, for display in shopping cart, check out, and cart page
export default async function handler(req, res) {
  console.log("Getting cart item...");
  const client = redis.createClient({
    url: process.env.NEXT_PUBLIC_REDIS_ENDPOINT,
    password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();

  let data = [];
  let curData = await client.get("cartItem");
  if (curData != null) {
    console.log("Item is in RAM");
    data = await JSON.parse(curData);
  }

  console.log("Closing client connection...");
  await client.quit();
  return res.status(200).json({ data });
}
