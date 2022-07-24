const aws = require("aws-sdk");
import formidable from "formidable";

export default async function handler(req, res) {
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    return res.status(404).json({ message: "unauthorized" });
  }

  const region = "ap-southeast-1";
  const bucketName = "guanzhiyan";
  const accessKeyId = process.env.ACCESS_KEY_ID;
  const secretAccessKey = process.env.SECRET_ACCESS_KEY;
  const s3 = new aws.S3({
    region,
    accessKeyId,
    secretAccessKey,
    signatureVersion: "v4",
  });
  const params = {
    Bucket: bucketName,
    Fields: {
      acl: "public-read",
      key: `bernerd_test${req.query.num}.jpg`, // totally random
      "Content-Type": "image/jpg",
    },
    Conditions: [
      ["content-length-range", 0, 1000000], // content length restrictions: 0-1MB
      { "Cache-Control": "no-store" },
      { acl: "public-read" },
    ],
    Expires: 10,
  };

  const data = await s3.createPresignedPost(params);
  console.log("Done generating data.", data);
  return res.status(200).json({ data });
}
