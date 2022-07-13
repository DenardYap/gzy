// GET and SET items in the cart
import { connectToDatabase } from "../../../util/mongodb";
import { serialize } from "cookie";
const jwt = require("jsonwebtoken");
// handling logics for both incrementing and decremnting amount
export default async function handler(req, res) {
  // error checking for request body, it must include amount, max, and invalid

  /**TODO: ADD A CREDENTIAL HERE SO NOT EVERYONE CAN ALTER MY ITEM. */
  if (req.body.amount == null)
    return res
      .status(500)
      .json({ error: "Please include an amount in the body" });
  if (req.body.max == null)
    return res.status(500).json({ error: "Please include a max in the body" });
  if (req.body.id == null)
    return res.status(500).json({ error: "Please include an id in the body" });

  // TODO: double req.body.amount!
  console.log("Setting cart item...");
  if (req.cookies.cart == null) {
    const body = await JSON.stringify([
      {
        amount: req.body.amount,
        id: req.body.id,
      },
    ]);
    let token = jwt.sign(body, process.env.secret);
    res.setHeader("Set-Cookie", serialize("cart", token, { path: "/" }));
    return res
      .status(200)
      .json({ message: "successfully updated cookie and cart" });
  } else {
    // go ahead and find that id and update the amount
    let decrypted;
    try {
      decrypted = jwt.verify(req.cookies.cart, process.env.secret);
    } catch (err) {
      console.log("error in derypting cookies in setCart.js");
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
    // console.log("decrypted data is...", decrypted);
    // decrypted = await JSON.parse(decrypted);
    for (let i = 0; i < decrypted.length; i++) {
      if (decrypted[i].id.toString() === req.body.id.toString()) {
        console.log("found item at index", i);
        let newAmount =
          parseInt(decrypted[i].amount) + parseInt(req.body.amount);
        if (newAmount <= 0) {
          return res
            .status(404)
            .json({ error: "You cannot have negative amount of items!" });
        } else if (newAmount > parseInt(req.body.max)) {
          return res.status(404).json({
            error: `The amount of item in your cart exceeded the limit, please make sure it's no more than ${req.body.max}`,
          });
        } // else if

        decrypted[i].amount = newAmount;
        decrypted = JSON.stringify(decrypted);

        let token = jwt.sign(decrypted, process.env.secret);
        res.setHeader(
          "Set-Cookie",
          serialize("cart", token, {
            path: "/",
          })
        );

        return res
          .status(200)
          .json({ message: "successfully updated cookie and cart" });
      } // if
    } // for
    // if reached here, this item doesn't exist yet
    decrypted.push({
      amount: req.body.amount,
      id: req.body.id,
    });

    decrypted = JSON.stringify(decrypted);
    let token = jwt.sign(decrypted, process.env.secret);
    res.setHeader("Set-Cookie", serialize("cart", token, { path: "/" }));

    return res
      .status(200)
      .json({ message: "successfully updated cookie and cart" });
  } // else
  // establish connection
}
