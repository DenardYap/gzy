import { connectToDatabase } from "../../../util/mongodb";
const aws = require("aws-sdk");
const path = require("path");
const util = require("util");
export const config = {
  api: {
    bodyParser: false,
    // bodyParse: {
    // sizeLimit: "4mb",
    // },
  },
};
import formidable from "formidable";
import { rejects } from "assert";
import { resolve } from "path";

// const redis = require("redis");
let fs = require("fs");

export default async function handler(req, res) {
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    res.status(404).json({ message: "unauthorized" });
  }

  console.log("uploading image...");

  const form = new formidable.IncomingForm();

  const formPromised = async (req) => {
    return new Promise(async (res, rej) => {
      form.parse(req, async function (err, fields, files) {
        if (err) rej(err);
        // const Body = fs.readFileSync(files.file.filepath);
        const Body = fs.readFileSync(process.cwd() + "\\clean.jpg");

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
        const uploadedImage = await s3.putObject(params).promise();
        // putObject too
        console.log(
          `Successfully updated main_aimg${req.query.num}.jpg at ${uploadedImage.Location}`
        );
        res(files.file.filepath);
        // const uploadURL = await s3.getSignedUrlPromise("putObject", params).then();
      });
    });
  };
  // const filepath = await formPromised(req);
  formPromised(req)
    .then((filepath) => {
      res.status(200).json({ filepath });
    })
    .catch((err) => {
      res.status(404).json({ error: err });
    });
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
