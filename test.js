const mongoose = require("mongoose");
const fs = require("fs");
const { MongoServerClosedError } = require("mongodb");

mongoose.connect();

// User Model
const Product = mongoose.model(
  "product",
  new mongoose.Schema(
    {
      name: String,
      price: Number,
      productID: Number,
      quantity: Number,
      image: Buffer,
      imageAlt: String,
      imageTitle: String,
      description: String,
    },
    { collection: "product" }
  )
);

const data1 = {
  name: "鲜炖燕窝150ml x6",
  price: 20,
  productID: 1,
  quantity: 20,
  image: fs.readFileSync(`${__dirname}\\public\\images\\100ml.webp`),
  imageAlt: "鲜炖燕窝150ml.webp",
  imageTitle: "鲜炖燕窝150mlx6",
  description: "",
};

const data2 = {
  name: "鲜炖燕窝100ml",
  price: 4,
  productID: 2,
  quantity: 20,
  image: fs.readFileSync(`${__dirname}\\public\\images\\100ml2.webp`),
  imageAlt: "鲜炖燕窝100ml.webp",
  imageTitle: "鲜炖燕窝100ml",
  description: "",
};

const data3 = {
  name: "浓缩燕窝120mlx3",
  price: 15,
  productID: 3,
  quantity: 15,
  image: fs.readFileSync(`${__dirname}\\public\\images\\120mlx3.webp`),
  imageAlt: "浓缩燕窝120mlx3.webp",
  imageTitle: "浓缩燕窝120mlx3",
  description: "",
};

const data4 = {
  name: "小盏200克",
  price: 30,
  productID: 4,
  quantity: 5,
  image: fs.readFileSync(`${__dirname}\\public\\images\\200zai.webp`),
  imageAlt: "小盏200克.webp",
  imageTitle: "小盏200克",
  description: "",
};

const data5 = {
  name: "浓缩燕窝350ml",
  price: 23,
  productID: 5,
  quantity: 5,
  image: fs.readFileSync(`${__dirname}\\public\\images\\compressed1.webp`),
  imageAlt: "浓缩燕窝350ml.webp",
  imageTitle: "浓缩燕窝350ml",
  description: "",
};

const data6 = {
  name: "浓缩燕窝350ml 新包装",
  price: 23,
  productID: 6,
  quantity: 5,
  image: fs.readFileSync(`${__dirname}\\public\\images\\compressed2.webp`),
  imageAlt: "浓缩燕窝350ml 新包装.webp",
  imageTitle: "浓缩燕窝350ml 新包装",
  description: "",
};

const data7 = {
  name: "大条100克",
  price: 50,
  productID: 7,
  quantity: 10,
  image: fs.readFileSync(`${__dirname}\\public\\images\\datiao100g.webp`),
  imageAlt: "大条100克.webp",
  imageTitle: "大条100克",
  description: "",
};

const data8 = {
  name: "新年礼盒",
  price: 25,
  productID: 8,
  quantity: 2,
  image: fs.readFileSync(`${__dirname}\\public\\images\\lihe1.webp`),
  imageAlt: "新年礼盒.webp",
  imageTitle: "新年礼盒",
  description: "",
};

const data9 = {
  name: "小条100克 + 中条100克",
  price: 90,
  productID: 9,
  quantity: 4,
  image: fs.readFileSync(`${__dirname}\\public\\images\\tiao.webp`),
  imageAlt: "小条100克 + 中条100克.webp",
  imageTitle: "小条100克 + 中条100克",
  description: "",
};

const data10 = {
  name: "小条30克/50克",
  price: 70,
  productID: 10,
  quantity: 3,
  image: fs.readFileSync(`${__dirname}\\public\\images\\tiao30g.webp`),
  imageAlt: "小条30克/50克.webp",
  imageTitle: "小条30克/50克",
  description: "",
};

Product.insertMany([
  data1,
  data2,
  data3,
  data4,
  data5,
  data6,
  data7,
  data8,
  data9,
  data10,
])
  .then(function () {
    console.log("Data inserted"); // Success
  })
  .catch(function (error) {
    console.log(error); // Failure
  });

// run();
// async function run() {
//   try {
//     const product = await Product.find({}, { image: 0, _id: 0, __v: 0 });
//     console.log(product[0].imageAlt);
//   } catch (error) {
//     console.log(error);
//   }
//   mongoose.connection.close(() =>
//     console.log("Connection Closed Successfully")
//   );
// }

// const product = new Product(data10);
// product
//   .save()
//   .then(() => console.log("Product Saved Successfully!"))
//   .then(() =>
//     mongoose.connection.close(() =>
//       console.log("Connection Closed successfully!")
//     )
//   )
//   .catch((err) => console.log(`Error in Saving User: ${err}`));

// const { Console } = require("console");
// const { MongoClient, ServerApiVersion } = require("mongodb");
// // const fs = require("fs");
// // console.log("Current directory: " + process.cwd());
// var fs = require("fs"),
//   mongo = require("mongodb"),
//   ObjectId = mongo.ObjectID,
//   Binary = mongo.Binary;
// const uri =
// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverApi: ServerApiVersion.v1,
// });
// var doc = {};
// let imageFile = fs.readFileSync(`${__dirname}\\public\\images\\100ml2.webp`);
// doc.imageFile = new Binary(imageFile);
// console.log(typeof imageFile);
// client.connect(async (err) => {
//   const collection = client.db("gzy").collection("product");
//   // perform actions on the collection object
//   // const doc = {
//   //   name: "条",
//   //   price: 20,
//   //   productID: 123,
//   //   quantity: 5,
//   //   image:  fs.readFileSync(`${__dirname}\\public\\images\\100ml2.webp`),
//   //   imageAlt: "tiao.webp",
//   //   imageTitle: "Bird's Nest 100g dry",
//   //   description: "",
//   // };
//   await collection.insertOne(doc);

//   client.close();
// });

// await db.collection("product").insertOne();
