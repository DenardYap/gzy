export const config = {
  api: {
    bodyParser: false,
  },
};

import Stripe from "stripe";
import { buffer } from "micro";
import { connectToDatabase } from "../../../util/mongodb";
import { serialize } from "cookie";
import { calculateObjectSize } from "bson";
const stripe = require("stripe");
const redis = require("redis");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
async function sendEmail(
  amount,
  email,
  name,
  phone,
  line1,
  line2,
  postal_code,
  city,
  state,
  country,
  paymentIntentID
) {
  console.log("sending email...");
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    port: 587,
    secure: false, // true for 465, false for other ports
    service: "hotmail",
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL,
      pass: process.env.NEXT_PUBLIC_PASSWORD,
    },
  });

  let text = `Total Cost is: RM${parseInt(amount).toFixed(
    2
  )}\nCustomer Name: ${name}\nCustomer Email: ${email}\nCustomer Phone: ${phone}\nAddress Line 1: ${line1}\nAddress Line 2: ${line2}\nPostal Code: ${postal_code}\nArea/City: ${city}\nState: ${state}\nCountry: ${country}\n\n\nClick this link https://dashboard.stripe.com/test/payments/${paymentIntentID} for more information`;
  // send mail with defined transport object
  let to = "bernerd@umich.edu, mameehy@hotmail.com, maggieykw@hotmail.com";

  let info = await transporter.sendMail({
    from: '"Guan Zhi Yan Bot" <mameehy@hotmail.com>', // sender address
    to, // list of receivers
    subject: "GUAN ZHI YAN NEW ORDER!", // Subject line
    text, // plain text body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  // Preview only available when sending through an Ethereal account
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

async function checkCaches(client) {
  let mainData;
  console.log("checking caches...");
  try {
    mainData = await client.hGetAll("mainCart");
  } catch (error) {
    console.log("Error in fetching data in update.js in api", error);
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
  console.log("caches OK");
  return mainData;
}

async function updateRedis(token) {
  const client = redis.createClient({
    url: process.env.NEXT_PUBLIC_REDIS_ENDPOINT,
    password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  checkCaches(client); //this ensure the cache is full and not empty

  console.log("updating redis...");
  // go ahead and update all the quantity
  let newAmounts = {};
  for (let i = 0; i < token.length; i++) {
    let curData = await client.hGet("mainCart", token[i].id);
    curData = JSON.parse(curData);
    curData.quantity = (
      parseInt(curData.quantity) - parseInt(token[i].amount)
    ).toString();
    newAmounts[token[i].id] = curData.quantity;
    await client.hSet("mainCart", token[i].id, JSON.stringify(curData));
  }
  await client.quit();
  console.log("Redis updated");
  return newAmounts;
}
async function updateDatabase(token) {
  // first update our cache
  let newAmounts = await updateRedis(token);
  console.log("updating database...");
  const { db } = await connectToDatabase();
  const ObjectId = require("mongodb").ObjectId;
  for (let i = 0; i < token.length; i++) {
    await db
      .collection("product")
      .updateOne(
        { _id: ObjectId(token[i].id) },
        { $set: { quantity: newAmounts[token[i].id] } }
      );
    console.log(
      `Updated id ${token[i].id}, new amount is now ${newAmounts[token[i].id]}`
    );
  }
}
// const endpointSecret =
//   process.env.NODE_ENV == "development"
//     ? "whsec_34a50072c5f86b2159e747b942a3814dd4c09d5bb7315b88390e7e38ef60174d"
//     : process.env.NEXT_PUBLIC_END_POINT_SECRET; //to be changed

export default async function handler(req, res) {
  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);
  console.log("webhooking...");
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      // process.env.NEXT_PUBLIC_END_POINT_SECRET
      "whsec_34a50072c5f86b2159e747b942a3814dd4c09d5bb7315b88390e7e38ef60174d"
    );
  } catch (err) {
    console.log("Error!", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  console.log("handling event...");
  switch (event.type) {
    case "checkout.session.completed":
      res.status(200).send(`Updating database and sending emails...`);
      console.log("Handling success payment, updating database...");
      const session = event.data.object;
      let token = [];

      let listOfKeys = Object.keys(session.metadata);
      // format token in a way my function updateDatabase likes
      for (let i = 0; i < listOfKeys.length; i++) {
        let curKey = listOfKeys[i];
        let curVal = session.metadata[curKey];
        token.push({ id: curKey, amount: curVal });
      }
      updateDatabase(token);
      sendEmail(
        session.amount_total / 100,
        session.customer_details.email,
        session.customer_details.name,
        session.customer_details.phone,
        session.shipping.address.line1,
        session.shipping.address.line2,
        session.shipping.address.postal_code,
        session.shipping.address.city,
        session.shipping.address.state,
        session.shipping.address.country,
        session.payment_intent
      );
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
    //   res.status(404).json({ message: `Unhandled event type ${event.type}` });
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ message: "successfully updated database" });
}
