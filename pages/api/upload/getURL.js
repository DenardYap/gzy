import { connectToDatabase } from "../../../util/mongodb";
const aws = require("aws-sdk");
const path = require("path");
export const config = {
  api: {
    bodyParser: false,
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

  /**First upload the image onto our server */

  const form = new formidable.IncomingForm();
  let fileName = path.join(__dirname, `main_aimg${req.query.num}.webp`);
  // let fileName = `C:\\Users\\user\\Desktop\\projects\\gzy\\public\\images\\main_aimg${req.query.num}.jpg`;
  form.parse(req, async function (err, fields, files) {
    // await saveFile(files.file);
    console.log("fileName is:", fileName);
    const data = fs.readFileSync(files.file.filepath);
    fs.writeFileSync(fileName, data);
    await fs.unlinkSync(files.file.filepath);
    let Body = fs.createReadStream(fileName);
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
  res.status(200).json({ message: "successfully uploaded/updated the image." });
  // return res.status(200).json({ url: uploadURL });
}
