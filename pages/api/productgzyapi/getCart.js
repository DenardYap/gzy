// GET and SET items in the cart
import { connectToDatabase } from "../../../util/mongodb";
import { serialize } from "cookie";
const redis = require("redis");
const jwt = require("jsonwebtoken");

async function checkCaches(client) {
  let mainData;
  try {
    mainData = await client.hGetAll("mainCart");
  } catch (error) {
    console.log("Error in fetching data in getCart.js", error);
  }
  if (Object.keys(mainData).length == 0) {
    console.log("cache miss");
    const { db } = await connectToDatabase();
    data = await db.collection("product").find().toArray();
    data = await JSON.parse(JSON.stringify(data)); // this will return a list of items to us
    // fetch the data from db and cache it
    data = data.map((item) => ({ ...item, amount: 0 }));
    data.forEach(async (item) => {
      await client.hSet("mainCart", item._id, JSON.stringify(item));
    });
  }
  return mainData;
}

// return every single item in the cart, for display in shopping cart, check out, and cart page
export default async function handler(req, res) {
  // decrypt jwt key in the cookies and send it back to the front end
  const client = redis.createClient({
    url: process.env.NEXT_PUBLIC_REDIS_ENDPOINT,
    password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();

  let data = [];
  if (req.cookies.cart == null) {
    // cart is empty
    await client.quit();
    return res.status(200).json({ data });
  } else {
    try {
      // check if cache is empty, update if necessary
      let mainData = await checkCaches(client);

      let decrypted = jwt.verify(req.cookies.cart, process.env.secret);
      // decrypted = await JSON.parse(decrypted);
      let curData;
      for (let i = 0; i < decrypted.length; i++) {
        curData = JSON.parse(mainData[decrypted[i].id]);
        curData.amount = decrypted[i].amount;
        data.push(curData);
      }
      await client.quit();
      console.log("Successfully fetched data at the back end");
      return res.status(200).json({ data });
    } catch (err) {
      console.log("Error in decrypting cart cookie: " + err);
      // reset cookie here
      await client.quit();
      // reset toke if it's invalid
      if (err.name == "JsonWebTokenError") {
        let newToken = jwt.sign(JSON.stringify([]), process.env.secret); // make it empty
        res.setHeader("Set-Cookie", serialize("cart", newToken, { path: "/" }));
        // return res.status(404).json({})
      }
      return res.status(404).json({ data: [] });
    }
  }
  await client.quit();
  return res.status(404).json({ error: "unknown error" });
}
