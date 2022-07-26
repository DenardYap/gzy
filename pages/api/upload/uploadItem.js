export const config = {
  api: {
    // bodyParser: {
    //   sizeLimit: "8mb",
    // },
    responseLimit: "8mb",
  },
};
const aws = require("aws-sdk");

export default async function handler(req, res) {
  if (
    req.headers.authorization != process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER
  ) {
    return res.status(404).json({ message: "unauthorized" });
  }

  console.log("uploading item...");

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

  var buf = Buffer.from(
    req.body.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );

  const params = {
    Bucket: bucketName,
    Key: `${req.query.key}.jpg`,
    Expires: new Date(),
    Body: buf,
    CacheControl: "no-cache",
    ContentEncoding: "base64",
    ContentType: "image/jpeg", // to be changed
  };

  const uploadedImage = await s3
    .upload(params, (err, data) => {
      if (err) {
        console.log("Error!");
      }
    })
    .promise();
  console.log("done uploading");
  res.status(200).json({ message: "done" });
}
