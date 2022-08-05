import { connectToDatabase } from "../../../util/mongodb";
export default async function handler(req, res) {
  // as of now (7/26/2022) this doesn't seem to be supported by AWS, though this is
  // the best of both world for getStaticProps and getServerSideProps, in the future
  // when it's supported it will be a nice feature to have

  // Check for secret to confirm this is a valid request
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    return res.status(404).json({ message: "unauthorized" });
  }

  const { db } = await connectToDatabase();
  // 62ea2a51979f8c8c0d0cc586

  await db.collection("total_user").updateOne({}, { $inc: { total: 1 } });
  console.log("updated user...");
  return res.status(200).json({ message: "successfully incremented" });
}
