// GET and SET items in the cart
import { connectToDatabase } from "../../../util/mongodb";
import { serialize } from "cookie";
import Stripe from "stripe";
const redis = require("redis");
const jwt = require("jsonwebtoken");
const stripe = new Stripe(process.env.SECRET_KEY_TEST);

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
    data.forEach(async (item) => {
      await client.hSet("mainCart", item._id, JSON.stringify(item));
    });
  }
  return mainData;
}

// return every single item in the cart, for display in shopping cart, check out, and cart page
export default async function handler(req, res) {
  // decrypt jwt key in the cookies and send it back to the front end
  // the cart may not be updated yet
  if (req.cookies.checkoutToken != null) {
    console.log("decrypting checkoutToken...");
    try {
      let session = jwt.verify(req.cookies.checkoutToken, process.env.secret);
      // session = parseInt(session)
      let checkoutSession = await stripe.checkout.sessions.retrieve(session);
      // empty cart
      if (checkoutSession.status == "complete") {
        // res.setHeader("Set-Cookie", serialize("cart", newToken, { path: "/" }));
        // then, go ahead and delete the cookies

        res.setHeader("Set-Cookie", [
          "cart=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
          "checkoutToken=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
        ]);
        console.log("checkoutToken deleted...");
        return res.status(200).json({ data: [] });
      }
    } catch (err) {
      console.log("error in retrieving payment intent", err);
      // if (err.name == "JsonWebTokenError") {
      res.setHeader("Set-Cookie", [
        "cart=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
        "checkoutToken=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
      ]);
      // }
    }
  }
  const client = redis.createClient({
    url: process.env.NEXT_PUBLIC_REDIS_ENDPOINT,
    password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();

  let data = [];
  if (req.cookies.cart == null) {
    // cart is empty
    console.log("Closing connections...");
    await client.quit();
    return res.status(200).json({ data });
  } else {
    try {
      // check if cache is empty, update if necessary
      let mainData = await checkCaches(client);

      let decrypted = jwt.verify(req.cookies.cart, process.env.secret);
      let curData;
      for (let i = 0; i < decrypted.length; i++) {
        curData = JSON.parse(mainData[decrypted[i].id]);
        curData.amount = decrypted[i].amount;
        data.push(curData);
      }
      console.log("Closing connections...");
      await client.quit();
      console.log("Successfully fetched data at the back end");
      return res.status(200).json({ data });
    } catch (err) {
      console.log("Error in decrypting cart cookie: " + err);
      // reset cookie here
      console.log("Closing connections...");
      await client.quit();
      // reset token if it's invalid
      if (err.name == "JsonWebTokenError") {
        let newToken = jwt.sign(JSON.stringify([]), process.env.secret); // make it empty
        res.setHeader(
          "Set-Cookie",
          serialize("cart", newToken, {
            path: "/",
          })
        );
        // return res.status(404).json({})
      }
      return res.status(404).json({ data: [] });
    }
  }
}
