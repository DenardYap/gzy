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
import { getIdTokenResult } from "firebase/auth";
const stripe = require("stripe");
const redis = require("redis");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
let AWS = require("aws-sdk");

// a webhook that sends email when a payment is received
async function sendEmail(
  items_bought,
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
  paymentIntentID,
  referrer
) {
  console.log("sending email...");
  AWS.config.update({
    region: "us-east-2",
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  });

  // create reusable transporter object using the default SMTP transport

  let referrerMap = {
    1: "Yap Kah Ying",
    2: "Yap Kah Wan",
  };
  let r = undefined;
  if (referrer != undefined) {
    try {
      r = referrerMap[parseInt(referrer)];
    } catch (err) {
      console.log("Cannot parse referrer", err);
    }
  }
  if (r == undefined) {
    r = "No one";
  }
  let Data = `Total Cost is: RM${parseInt(amount).toFixed(
    2
  )}<br>Customer Name: ${name}<br>Customer Email: ${email}<br>Customer Phone: ${phone}<br>Address Line 1: ${line1}<br>Address Line 2: ${line2}<br>Postal Code: ${postal_code}<br>Area/City: ${city}<br>State: ${state}<br>Country: ${country}<br>Referrer: ${r}<br><br>ITEMS BOUGHT:<br>`;

  for (let i = 0; i < items_bought.length; i++) {
    Data += `${items_bought[i].imageTitle}: ${
      items_bought[i].amount
    } x RM${parseFloat(items_bought[i].price).toFixed(2)}<br>`;
  }
  Data += `<br><br><br>Click this link https://dashboard.stripe.com/payments/${paymentIntentID} for more information`;
  // send mail with defined transport object
  let ToAddresses = [
    "bernerd@umich.edu",
    "mameehy@hotmail.com",
    "gzypdykl@gmail.com",
    "guanzhiyanpd@gmail.com",
    "maggieykw@hotmail.com",
  ];

  // Create sendEmail params
  var params = {
    Destination: {
      /* required */
      // CcAddresses: [
      //   "",
      //   /* more items */
      // ],
      ToAddresses,
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data,
        },
        Text: {
          Charset: "UTF-8",
          Data,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "GUAN ZHI YAN NEW ORDER!",
      },
    },
    Source: "gzypdykl@gmail.com" /* required */,
    ReplyToAddresses: [
      "gzypdykl@gmail.com",
      /* more items */
    ],
  };

  // Create the promise and SES service object
  var sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
    .sendEmail(params)
    .promise();

  // Handle promise's fulfilled/rejected states
  sendPromise
    .then(function (data) {
      console.log(data.MessageId);
    })
    .catch(function (err) {
      console.log("Error in sending email!");
      console.error(err, err.stack);
    });

  // console.log("Message sent: %s", info.messageId);
  let customerContent = `Dear ${name}, thanks for your purchase at Guan Zhi Yan Trading, we will ship out your order as soon as possible.<br>To keep track of your package, please click on this link https://www.guanzhiyan.com/order/${paymentIntentID}.<br><br>If you have any concerns, questions, or feedbacks, feel free to email to gzypdykl@gmail.com or phone us at +60126380981 (Malaysia).`;

  var params2 = {
    Destination: {
      /* required */
      // CcAddresses: [
      //   "",
      //   /* more items */
      // ],
      ToAddresses: [email],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: customerContent,
        },
        Text: {
          Charset: "UTF-8",
          Data: customerContent,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Your order has been placed",
      },
    },
    Source: "gzypdykl@gmail.com" /* required */,
    ReplyToAddresses: [
      "gzypdykl@gmail.com",
      /* more items */
    ],
  };

  // Create the promise and SES service object
  var sendPromise2 = new AWS.SES({ apiVersion: "2010-12-01" })
    .sendEmail(params2)
    .promise();

  // Handle promise's fulfilled/rejected states
  sendPromise2
    .then(function (data) {
      console.log(data.MessageId);
    })
    .catch(function (err) {
      console.log("Error in sending email!");
      console.error(err, err.stack);
    });
  console.log("sent customer email!");
  return 1;
}

async function updateTracking(session, token) {
  console.log("updating tracking...");
  const { db } = await connectToDatabase();
  const client = redis.createClient({
    url: process.env.NEXT_PUBLIC_REDIS_ENDPOINT,
    password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();

  let curData = await client.hGetAll("mainCart");
  let items_bought = [];
  for (let i = 0; i < token.length; i++) {
    // token has id, and amount

    let newCurData = await JSON.parse(curData[token[i].id]);
    let curRow = {
      amount: token[i].amount,
      id: token[i].id,
      price: newCurData.price,
      image: newCurData.image,
      imageTitle: newCurData.imageTitle,
      imageTitleZhc: newCurData.imageTitleZhc,
      imageTitleEn: newCurData.imageTitleEn,
    };
    items_bought.push(curRow);
  }

  await db.collection("tracking").insertOne({
    timestamp: new Date(),
    items_bought,
    amount: session.amount / 100,
    line_1: session.shipping.address.line1,
    line_2: session.shipping.address.line2,
    email: session.receipt_email,
    name: session.shipping.name,
    phone: session.shipping.phone,
    postal_code: session.shipping.address.postal_code,
    city: session.shipping.address.city,
    state: session.shipping.address.state,
    country: session.shipping.address.country,
    _id: session.id,
    status: 1, // 1 (new) -> 2 (updated) -> 3 (completed) (delete completed?)
  });
  console.log("updated tracking...");
  await client.quit();

  // return a list of items bought
  return items_bought;
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
  await checkCaches(client); //this ensure the cache is full and not empty

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
  return 1;
}

export default async function handler(req, res) {
  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);
  console.log("webhooking...");
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.NEXT_PUBLIC_END_POINT_SECRET
      // process.env.NEXT_PUBLIC_END_POINT_SECRET_TEST
      // process.env.NEXT_PUBLIC_END_POINT_SECRET_LOCAL
    );
  } catch (err) {
    console.log("Error!", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  console.log("handling event...");
  let databaseUpdated;
  let emailSent;
  switch (event.type) {
    case "payment_intent.succeeded":
      console.log("Handling success payment, updating database...");
      // res.status(200).send(`SUCCESS!`);
      const session = event.data.object;
      let token = [];

      let listOfKeys = Object.keys(session.metadata);
      // format token in a way my function updateDatabase likes
      for (let i = 0; i < listOfKeys.length; i++) {
        let curKey = listOfKeys[i];
        if (curKey == "referrer") continue;
        let curVal = session.metadata[curKey];
        token.push({ id: curKey, amount: curVal });
      }
      databaseUpdated = await updateDatabase(token);
      let items_bought = await updateTracking(session, token);
      emailSent = await sendEmail(
        items_bought,
        session.amount / 100,
        session.receipt_email,
        session.shipping.name,
        session.shipping.phone,
        session.shipping.address.line1,
        session.shipping.address.line2,
        session.shipping.address.postal_code,
        session.shipping.address.city,
        session.shipping.address.state,
        session.shipping.address.country,
        session.id,
        session.metadata["referrer"]
      );
      // let revalidateRoute =
      //   process.env.NODE_ENV == "production"
      //     ? "https://www.guanzhiyan.com/api/revalidate"
      //     : "http://localhost:3000/api/revalidate";
      // await fetch(revalidateRoute, {
      //   method: "POST",
      //   headers: {
      //     Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     operation: 2,
      //     id: session.payment_intent,
      //   }),
      // });
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
    //   res.status(404).json({ message: `Unhandled event type ${event.type}` });
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ databaseUpdated, emailSent });
}
