import { connectToDatabase } from "../../../util/mongodb";
const aws = require("aws-sdk");
const path = require("path");
export const config = {
  api: {
    bodyParser: false,
    // bodyParse: {
    // sizeLimit: "4mb",
    // },
  },
};
import formidable from "formidable";

// const redis = require("redis");
let fs = require("fs");

export default async function handler(req, res) {
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    res.status(404).json({ message: "unauthorized" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async function (err, fields, files) {
    const Body = fs.readFileSync(files.file.filepath);

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
      Key: `main_aimg${req.query.num}.jpg`,
      // Key: `last_testing${req.query.num}.jpg`,
      Expires: new Date(),
      Body,
      CacheControl: "no-cache",
    };
    // console.log(req.body);
    const uploadedImage = await s3.upload(params).promise();
    // putObject too
    console.log(
      `Successfully updated main_aimg${req.query.num}.jpg at ${uploadedImage.Location}`
    );
    // const uploadURL = await s3.getSignedUrlPromise("putObject", params).then();
  });
  // const region = "ap-southeast-1";
  // const bucketName = "guanzhiyan";
  // const accessKeyId = process.env.ACCESS_KEY_ID;
  // const secretAccessKey = process.env.SECRET_ACCESS_KEY;
  // const s3 = new aws.S3({
  //   region,
  //   accessKeyId,
  //   secretAccessKey,
  //   signatureVersion: "v4",
  // });
  // const params = {
  //   Bucket: bucketName,
  //   Key: `main_timg${req.query.num}.webp`,
  //   Expires: 10,
  //   // CacheControl: "no-cache",
  // };
  // const uploadURL = await s3
  //   .getSignedUrlPromise("putObject", params)
  //   .then(console.log("generated link..."));
  // console.log("done");
  res.status(200).json({ message: "asd" });
  // res.status(200).json({ __dirname: __dirname, fileName: fileName });
}
