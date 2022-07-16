import { serialize } from "cookie";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "../../../util/mongodb";
const nodemailer = require("nodemailer");
const redis = require("redis");
export default async function handler(req, res) {
  let transporter = nodemailer.createTransport({
    port: 587,
    secure: false, // true for 465, false for other ports
    service: "hotmail",
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL,
      pass: process.env.NEXT_PUBLIC_PASSWORD,
    },
  });

  let to = "bernerd@umich.edu, mameehy@hotmail.com"; //maggieykw@hotmail.com

  await transporter.sendMail({
    from: '"Guan Zhi Yan Bot" <mameehy@hotmail.com>', // sender address
    to, // list of receivers
    subject: "GUAN ZHI YAN NEW ORDER!", // Subject line
    text: "testing testing testing", // plain text body
  });
  res.status(200).json({ message: "success" });
}
