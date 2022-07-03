// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { connectToDatabase } from "../../../util/mongodb";
// import { useRouter } from "next/router";

export default async function handler(req, res) {
  // const router = useRouter();
  const { productID } = req.query;
  const { db } = await connectToDatabase();
  let data = await db
    .collection("product")
    .find({ productID: parseInt(productID) })
    .toArray();
  data = JSON.parse(JSON.stringify(data));
  res.status(200).json({ data });
  // res.status(200).json(data);
}
