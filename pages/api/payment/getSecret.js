import Stripe from "stripe";
import { connectToDatabase } from "../../../util/mongodb";
import { serialize } from "cookie";
const jwt = require("jsonwebtoken");
const stripe = new Stripe(process.env.NEXT_PUBLIC_SECRET_KEY);
//ASDASD
async function validateData(token) {
  const { db } = await connectToDatabase();
  for (let i = 0; i < token.length; i++) {
    // go thru each item (which only has id and amount keys) and check if the id exist, if so
    // check if the amount is correct
    // lastly, also add a price and imageTitle key into the object
    const ObjectId = require("mongodb").ObjectId;
    let data = await db
      .collection("product")
      .find({ _id: ObjectId(token[i].id.toString()) })
      .toArray();
    data = await JSON.parse(JSON.stringify(data)); // this will return a list of items to us
    console.log("here");
    if (data.length == 0) {
      // invalid data, go ahead and return false
      console.log("This item doesn't exist, it's not in sales anymore!");
      return 1;
    } else if (
      parseInt(token[i].amount) <= 0 ||
      parseInt(token[i].amount > parseInt(data[0].quantity))
    ) {
      console.log(
        "The amount you are trying to buy exceeded our stock, please try lowering the amount!"
      );
      return 2;
    } else {
      token[i].price = data[0].price;
      // add locale here
      token[i].imageTitle = data[0].imageTitle;
      token[i].quantity = data[0].quantity;
    }
  }
  return 3;
}

export default async function handler(req, res) {
  /*TODO: more secured here!! create a secret or smtg */
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    return res.status(404).json({ message: "unauthorized" });
  }
  console.log("accepting payment...");

  const success_url =
    process.env.NODE_ENV === "production"
      ? "https://www.guanzhiyan.com/success"
      : "http://localhost:3000/success";
  const cancel_url =
    process.env.NODE_ENV === "production"
      ? "https://www.guanzhiyan.com/failed"
      : "http://localhost:3000/failed";

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
    // todo: return failed url here too
    return res.status(404).json({
      cancel_url,
      errorEn: "Something's wrong with your shopping cart, Please retry!",
      error: "您的购物篮出错了，请重新尝试！",
      errorZhc: "您的購物籃出錯了，請重新嘗試！",
      redirect: true,
    });
  }
  const valid = await validateData(token);
  if (valid != 3) {
    // the shopping cart is invalid, so we reset the data
    let newToken = jwt.sign(JSON.stringify([]), process.env.secret); // make it empty
    res.setHeader("Set-Cookie", serialize("cart", newToken, { path: "/" }));
    let error;
    let errorEn;
    let errorZhc;
    if (valid == 1) {
      errorEn =
        "Some items in your shopping cart are sold out, please try again!";
      error = "有些在您的购物篮的东西已经卖完了，请重新尝试！";
      errorZhc = "有些在您的購物籃的東西已經賣完了，請重新嘗試！";
    } else {
      errorEn =
        "Some items in your shopping cart are more than what we have, please try lowering the amount!";
      error = "有些在您的购物篮的东西超出了我们目前的存货，请重新尝试！";
      errorZhc = "有些在您的購物籃的東西超出了我們目前的存貨，請重新嘗試！";
    }
    return res.status(404).json({
      cancel_url,
      error,
      errorEn,
      errorZhc,
      redirect: true,
    });
  }
  /**Create a meta data, where we need the amount and id */
  let metadata = {};
  token.forEach((item) => {
    metadata[item.id] = item.amount;
  });

  if (req.cookies.referrer) {
    metadata["referrer"] = req.cookies.referrer.toString();
  }
  let total = 0;
  let description = "";

  token.forEach((item) => {
    total += parseFloat(item.price) * 100 * parseInt(item.amount);
    description += `${item.imageTitle} : ${item.price} x ${item.amount} | `;
  });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "myr",
      payment_method: req.body.id,
      confirm: true,
      description,
      payment_method_types: ["card"],
      metadata,
      shipping: {
        address: {
          city: req.body.city,
          country: "Malaysia",
          line1: req.body.line1,
          line2: req.body.line2,
          postal_code: req.body.postal_code,
          state: req.body.state,
        },
        name: req.body.name,
        phone: req.body.phone,
      },
      receipt_email: req.body.email,
    });

    console.log("Done creating payment intent, going back to frontend....");

    // save paymentIntentID into the cookie
    let sessionID = jwt.sign(paymentIntent.id, process.env.secret);
    res.setHeader(
      "Set-Cookie",
      serialize("checkoutToken", sessionID, { path: "/" })
    );

    return res.status(200).json({
      success_url,
      cancel_url,
      error: false,
    });
  } catch (err) {
    console.log("Error 500! Programmer please check:", err);
    res.status(500).json({
      cancel_url,
      errorEn: err.message,
      error:
        "您的行用卡出错了，可能是资金不足，被盗/遗失卡，过期，或者是错误的卡验证码，请重试或者用另一种卡",
      errorZhc:
        "您的行用卡出錯了，可能是資金不足，被盜/遺失卡，過期，或者是錯誤的卡驗證碼，請重試或者用另一種卡",
    });
  }
}
