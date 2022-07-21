export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};
import { connectToDatabase } from "../../../util/mongodb";
const aws = require("aws-sdk");
const path = require("path");
const util = require("util");
import nextConnect from "next-connect";
import multer from "multer";

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/images",
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
});

import formidable from "formidable";

// const redis = require("redis");
let fs = require("fs");

export default async function handler(req, res) {
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    res.status(404).json({ message: "unauthorized" });
  }

  console.log("uploading image...");

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
  //   console.log(req.body);
  var buf = Buffer.from(
    req.body.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );

  const params = {
    Bucket: bucketName,
    Key: `main_aimg${req.query.num}.jpg`,
    // Key: `last_testing${req.query.num}.jpg`,
    Expires: new Date(),
    Body: buf,
    CacheControl: "no-cache",
    // ContentType: "image/jpg",

    ContentEncoding: "base64",
    ContentType: "image/jpeg",
  };
  console.log("uploading image2...");

  const uploadedImage = await s3
    .upload(params, (err, data) => {
      if (err) {
        console.log("Error!");
      }
    })
    .promise();
  console.log("done uploading");
  res.status(200).json({ message: "done" });

  // console.log("promise successful");
  // return res.status(200).json({ filepath });
  // .then((data) => {
  //   res.status(200).json({ filepath: data });
  // })
  // .catch((err) => {
  //   console.log("Error!", err);
  //   res.status(404).json({ message: "Something is wrong in getURL.js" });
  // });
  // .then(() =>
  // );
}
