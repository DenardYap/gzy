// GET and SET items in the cart
import { serialize } from "cookie";

const jwt = require("jsonwebtoken");
// return every single item in the cart, for display in shopping cart, check out, and cart page
export default async function handler(req, res) {
  /**TODO: ADD A CREDENTIAL HERE SO NOT EVERYONE CAN ALTER MY ITEM. */
  const { id } = req.query;
  console.log(`Deleting cart item ${id}...`);

  // update the cookies

  if (req.cookies.cart == null) {
    return res.status(400).json({ error: "cart is empty" });
  } else {
    try {
      let decrypted = jwt.verify(req.cookies.cart, process.env.secret);
      // decrypted = await JSON.parse(decrypted);

      for (let i = 0; i < decrypted.length; i++) {
        if (decrypted[i].id === id) {
          decrypted.splice(i, 1);
          const token = jwt.sign(JSON.stringify(decrypted), process.env.secret);
          res.setHeader(
            "Set-Cookie",
            serialize("cart", token, {
              path: "/",
            })
          );
          return res.status(200).json({ message: "deleted sucessfully" });
        }
      }
    } catch (err) {
      console.log("Error in decrypting cookies in delete.js:", err);
      if (err.name == "JsonWebTokenError") {
        let newToken = jwt.sign(JSON.stringify([]), process.env.secret); // make it empty
        res.setHeader(
          "Set-Cookie",
          serialize("cart", newToken, {
            path: "/",
          })
        );
      }
      return res.status(404).json({ error: "unauthorized cookies" });
    }
  }
  return res.status(200).json({ message: "id doesn't exist" });
}
