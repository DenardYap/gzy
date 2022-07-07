// GET and SET items in the cart
import { connectToDatabase } from "../../../util/mongodb";
const redis = require("redis");
// handling logics for both incrementing and decremnting amount
export default async function handler(req, res) {
  // error checking for request body, it must include amount, max, and invalid
  if (req.body.amount == null)
    return res
      .status(500)
      .json({ invalid: "Please include an amount in the body" });
  if (req.body.max == null)
    return res
      .status(500)
      .json({ invalid: "Please include a max in the body" });
  if (req.body.id == null)
    return res
      .status(500)
      .json({ invalid: "Please include an id in the body" });
  console.log("Setting cart item...");

  // establish connection
  const client = redis.createClient({
    url: process.env.NEXT_PUBLIC_REDIS_ENDPOINT,
    password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  let data = await client.get("cartItem");

  // cartItem miss
  // 1) Go to mainCache and cache cartItem, if mainCache miss
  // 2) Go to database and cache both
  if (data == null) {
    //cache miss
    let curData;
    // if item amount doesn't make sense, send a 404
    if (parseInt(req.body.amount) <= 0) {
      console.log("Closing client connection...");
      await client.quit();
      return res
        .status(404)
        .json({ error: "You cannot have negative amount of items!" });
    } else if (parseInt(req.body.amount) > parseInt(req.body.max)) {
      console.log("Closing client connection...");
      await client.quit();
      return res.status(404).json({
        error: `The amount of item in your cart exceeded the limit, please make sure it's no more than ${req.body.max}`,
      });
    }

    // find the data in main cache
    let mainCacheData = await client.get("mainCache");
    if (mainCacheData != null) {
      // main cache hit
      console.log("Main cache hit in setting cart item");
      mainCacheData = await JSON.parse(mainCacheData);
      for (let i = 0; i < mainCacheData.length; i++) {
        if (mainCacheData[i]._id.toString() == req.body.id.toString()) {
          // found the item!
          curData = [mainCacheData[i]];
          curData[0].amount = req.body.amount;
          curData = await JSON.stringify(curData);
          await client.set("cartItem", curData);

          console.log("Closing client connection...");
          await client.quit();
          return res
            .status(200)
            .json({ message: "Successfully cached cart cache" });
        } //if
      } //for
    } // big if
    // if main cache miss, go to database
    // cache both main cache and database
    let mainCurData;
    console.log("Main cache missed in setting cart item");
    const { db } = await connectToDatabase();
    mainCurData = await db.collection("product").find().toArray();
    mainCurData = await JSON.parse(JSON.stringify(mainCurData));
    // add an amount key to the list for later
    mainCurData = mainCurData.map((item) => ({ ...item, amount: 0 }));
    for (let i = 0; i < mainCurData.length; i++) {
      if (mainCurData[i]._id.toString() == req.body.id.toString()) {
        // found the item!
        curData = [mainCurData[i]];
        curData[0].amount = req.body.amount;
        curData = await JSON.stringify(curData);
        await client.set("cartItem", curData);
        break;
      }
    } //for

    /*TODO: add an item doesn't exist????*/

    mainCurData = await JSON.stringify(mainCurData);
    await client.set("mainCache", mainCurData);

    console.log("Closing client connection...");
    await client.quit();
    return res
      .status(200)
      .json({ message: "Successfully cached both main and cart caches" });
  } // big if

  data = await JSON.parse(data);

  //cart hit, find the item and update it
  for (let i = 0; i < data.length; i++) {
    if (data[i]._id.toString() == req.body.id.toString()) {
      let newAmount = parseInt(data[i].amount) + parseInt(req.body.amount);
      if (newAmount > parseInt(req.body.max)) {
        console.log("Closing client connection...");
        await client.quit();
        return res.status(404).json({
          error: `The amount of item in your cart exceeded the limit, please make sure it's no more than ${req.body.max}`,
        });
      } else if (newAmount < 0) {
        console.log("Closing client connection...");
        await client.quit();
        return res
          .status(404)
          .json({ error: `You cannot have negative amount of item!` });
      }
      data[i].amount = newAmount;
      // update cache
      data = await JSON.stringify(data);
      await client.set("cartItem", data);

      console.log("Closing client connection...");
      await client.quit();
      return res
        .status(200)
        .json({ message: "Successfully cached cart cache" });
    }
  }

  // if reach here, means we either got an empty list or this item doesn't exist yet
  // similar code as above... prob need to modularize in the future
  console.log("Item doesn't exist in cache... yet");
  console.log("Recaching...");
  let curData;
  // if item amount doesn't make sense, send a 404
  if (parseInt(req.body.amount) <= 0) {
    console.log("Closing client connection...");
    await client.quit();
    return res
      .status(404)
      .json({ error: "You cannot have negative amount of items!" });
  } else if (parseInt(req.body.amount) > parseInt(req.body.max)) {
    console.log("Closing client connection...");
    await client.quit();
    return res.status(404).json({
      error: `The amount of item in your cart exceeded the limit, please make sure it's no more than ${req.body.max}`,
    });
  }

  // find the data in main cache
  let mainCacheData = await client.get("mainCache");
  if (mainCacheData != null) {
    // main cache hit
    console.log("Main cache hit in setting cart item");
    mainCacheData = await JSON.parse(mainCacheData);
    for (let i = 0; i < mainCacheData.length; i++) {
      if (mainCacheData[i]._id.toString() == req.body.id.toString()) {
        // found the item!
        curData = mainCacheData[i];
        curData.amount = req.body.amount;
        data.push(curData);
        data = await JSON.stringify(data);
        await client.set("cartItem", data);

        console.log("Closing client connection...");
        await client.quit();
        return res
          .status(200)
          .json({ message: "Successfully cached cart cache" });
      } //if
    } //for
  }
  // if main cache miss, go to database
  // cache both main cache and database
  let mainCurData;
  console.log("Main cache missed in setting cart item");
  const { db } = await connectToDatabase();
  mainCurData = await db.collection("product").find().toArray();
  mainCurData = await JSON.parse(JSON.stringify(mainCurData));
  // add an amount key to the list for later
  mainCurData = mainCurData.map((item) => ({ ...item, amount: 0 }));
  for (let i = 0; i < mainCurData.length; i++) {
    if (mainCurData[i]._id.toString() == req.body.id.toString()) {
      // found the item!
      curData = mainCurData[i];
      curData.amount = req.body.amount;
      data.push(curData);
      data = await JSON.stringify(data);
      await client.set("cartItem", data);
      break;
    } //if
  } //for

  /*TODO: add an item doesn't exist????*/

  mainCurData = await JSON.stringify(mainCurData);
  await client.set("mainCache", mainCurData);

  console.log("Closing client connection...");
  await client.quit();
  return res
    .status(200)
    .json({ message: "Successfully cached both main and cart caches" });
}
