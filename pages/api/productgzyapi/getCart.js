// GET and SET items in the cart
import { connectToDatabase } from "../../../util/mongodb";
import { serialize } from "cookie";
import Stripe from "stripe";
const redis = require("redis");
const jwt = require("jsonwebtoken");
const stripe = new Stripe(process.env.NEXT_PUBLIC_SECRET_KEY_TEST);

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
    mainData = await db.collection("product").find().toArray();
    mainData = await JSON.parse(JSON.stringify(mainData)); // this will return a list of items to us
    // fetch the mainData from db and cache it
    mainData.forEach(async (item) => {
      await client.hSet("mainCart", item._id, JSON.stringify(item));
    });
  }
  return mainData;
}

// return every single item in the cart, for display in shopping cart, check out, and cart page
// also update the cache if necessary
export default async function handler(req, res) {
  // decrypt jwt key in the cookies and send it back to the front end
  // the cart may not be updated yet
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    return res.status(404).json({ message: "unauthorized" });
  }

  if (req.cookies.checkoutToken != null) {
    console.log("decrypting checkoutToken...");
    try {
      let paymentIntentID = jwt.verify(
        req.cookies.checkoutToken,
        process.env.secret
      );
      // session = parseInt(session)
      // Todo: might need to change to payment intent object
      let paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID);
      // empty cart
      if (paymentIntent.status == "succeeded") {
        // res.setHeader("Set-Cookie", serialize("cart", newToken, { path: "/" }));
        // then, go ahead and delete the cookies

        // clear out referrer, checkout token and cart items
        res.setHeader("Set-Cookie", [
          "cart=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
          "checkoutToken=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
          "referrer=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
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
      return res.status(200).json({ data: [] });
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
