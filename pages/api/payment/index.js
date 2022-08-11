import Stripe from "stripe";
import { connectToDatabase } from "../../../util/mongodb";
import { serialize } from "cookie";
import { CardCvcElement, Elements } from "@stripe/react-stripe-js";
const jwt = require("jsonwebtoken");
const stripe = new Stripe(process.env.SECRET_KEY_TEST);
//ASDASD
async function validateData(token) {
  const { db } = await connectToDatabase();
  for (let i = 0; i < token.length; i++) {
    // go thru each item (which only has id and amount keys) and check if the id exist, if so
    // check if the amount is correct
    // lastly, also add a price and imageTitle key into the object
    const ObjectId = require("mongodb").ObjectId;
    data = await db
      .collection("product")
      .find({ _id: ObjectId(token[i].id.toString()) })
      .toArray();
    data = await JSON.parse(JSON.stringify(data)); // this will return a list of items to us
    console.log("here");
    if (data.length == 0) {
      // invalid data, go ahead and return false
      console.log(
        "This id doesn't exist, the shopping cart is altered in some way"
      );
      return false;
    } else if (
      parseInt(token[i].amount) <= 0 ||
      parseInt(token[i].amount > parseInt(data[0].quantity))
    ) {
      console.log(
        "The amount is not correct, the shopping cart is altered in some way"
      );
      return false;
    } else {
      token[i].price = data[0].price;
      // add locale here
      token[i].imageTitle = data[0].imageTitle;
      token[i].quantity = data[0].quantity;
    }
  }
  return true;
}

export default async function handler(req, res) {
  /*TODO: more secured here!! create a secret or smtg */
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    return res.status(404).json({ message: "unauthorized" });
  }
  console.log("accepting payment...");
  let token;
  try {
    token = jwt.verify(req.cookies.cart, process.env.secret);
    // decrypt shopping cart item into a list of objects
  } catch (err) {
    console.log("error in derypting cookies in payment.js:", err);
    if (err.name == "JsonWebTokenError") {
      let newToken = jwt.sign(JSON.stringify([]), process.env.secret); // make it empty
      res.setHeader(
        "Set-Cookie",
        serialize("cart", newToken, {
          path: "/",
        })
      );
    }
    return res.status(404).json({ error: "unauthorized cookie" });
  }
  const valid = await validateData(token);
  if (!valid) {
    // the shopping cart is invalid, so we reset the data
    let newToken = jwt.sign(JSON.stringify([]), process.env.secret); // make it empty
    res.setHeader("Set-Cookie", serialize("cart", newToken, { path: "/" }));
    return res.status(404).json({
      error: "Invalid shopping cart item, item has been altered in some way",
    });
  }
  console.log("token is", token);
  /**Create a meta data, where we need the amount and id */
  let metadata = {};
  token.forEach((item) => {
    metadata[item.id] = item.amount;
  });

  if (req.cookies.referrer) {
    metadata["referrer"] = req.cookies.referrer.toString();
  }

  token = token.map((item) => {
    return {
      price_data: {
        currency: "myr",
        product_data: {
          name: item.imageTitle,
        },
        unit_amount: parseFloat(item.price) * 100,
      },
      quantity: parseInt(item.amount),
    };
  });

  const success_url =
    process.env.NODE_ENV === "production"
      ? "https://www.guanzhiyan.com/success"
      : "http://localhost:3000/success";
  const cancel_url =
    process.env.NODE_ENV === "production"
      ? "https://www.guanzhiyan.com/failed"
      : "http://localhost:3000/failed";

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: token,
      success_url,
      cancel_url,
      metadata,
      phone_number_collection: {
        enabled: true,
      },
      shipping_address_collection: {
        allowed_countries: ["MY"],
      },
    });
    console.log(`redirecting to ${session.url}...`);

    // save paymentIntentID into the cookie
    let sessionID = jwt.sign(session.id, process.env.secret);
    res.setHeader(
      "Set-Cookie",
      serialize("checkoutToken", sessionID, { path: "/" })
    );

    return res.status(200).json({
      url: session.url,
    });
  } catch (err) {
    console.log("Error 500! Programmer please check:", err);
    res.status(500).json({ error: "internal server error" });
  }
}
