import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../../next-i18next.config";
import { connectToDatabase } from "../../util/mongodb";
import styles from "../../styles/ProductPage.module.css";
import Image from "next/image";
import { cartContext } from "../_app";
import { useContext, useRef, useState } from "react";

export default function ItemPage(props) {
  const imageRef = useRef(null);
  const itemRef = useRef(null);
  const [cartToggle, toggleCart] = useContext(cartContext);

  const rootRoute =
    process.env.NODE_ENV == "production"
      ? process.env.NEXT_PUBLIC_productAPIpro
      : process.env.NEXT_PUBLIC_productAPIdev;
  function increment() {
    if (parseInt(itemRef.current.value) !== parseInt(props.data[0].quantity)) {
      itemRef.current.value = (parseInt(itemRef.current.value) + 1).toString();
    }
  }
  function decrement() {
    if (itemRef.current.value !== "0") {
      itemRef.current.value = (parseInt(itemRef.current.value) - 1).toString();
    }
  }

  async function handleBuy() {
    // make sure the item doesn't exceed the max limit
    // also make sure the item is not 0
    if (itemRef.current.value === "0") {
      alert("Please make sure item quantity is at least 1");
    } else if (
      parseInt(itemRef.current.value) > parseInt(itemRef.current.max)
    ) {
      alert(
        `Please make sure the item quantity is no more than ${itemRef.current.max}`
      );
    } else if (itemRef.current.value[0] === "0") {
      alert("Please make sure the item quantity doesn't start with 0");
    } else {
      let body = {
        max: props.data[0].quantity,
        id: props.data[0]._id,
        amount: itemRef.current.value,
      };
      itemRef.current.value = "0";
      let res = await fetch(rootRoute + process.env.NEXT_PUBLIC_BACKENDSET, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(body),
      });
      if (res.status == 404) {
        res = await res.json();
        alert(res.error);
        return;
      } else if (res.status == 500) {
        //programmer's error
        console.log("500 error, programmer please check");
        return;
      }
      res = await res.json();
      toggleCart();
      console.log("Done adding to cart!");
    } // else
  }

  return (
    <>
      <div className={styles.mainDiv}>
        <div className="flex justify-center">
          <div className="border-2 border-solid border-slate-400 shadow-xl h-fit w-fit ">
            <Image
              ref={imageRef}
              src={props.data[0].image}
              quality={100}
              height={"500%"}
              width={"500%"}
              alt={props.data[0].imageAlt}
              loading="lazy"
            ></Image>
          </div>
        </div>
        <div className={styles.textDiv}>
          <h2 className="text-6xl text-slate-800 items-end flex  rounded">
            {props.data[0].imageTitle}
          </h2>
          <h3 className="text-4xl text-gray-500 items-center flex  rounded">
            RM{parseInt(props.data[0].price).toFixed(2)}
          </h3>
          <hr className="border-black mr-[1em]"></hr>
          <div className=" rounded flex items-center bg-slate-200 justify-center">
            <div className="shadow-md flex bg-slate-800 w-fit m-[1em] justify-center items-center">
              <div
                onClick={increment}
                className="text-3xl px-[0.2em] hover:cursor-pointer text-white"
              >
                +
              </div>
              <input
                ref={itemRef}
                id="qty"
                type="number"
                min="0"
                max={props.data[0].quantity}
                defaultValue="0"
                step="1"
                className="text-center
              text-xl
              w-[3em]
              h-[2.5em]
              text-slate-900
              bg-white bg-clip-padding
              border border-solid border-black
              transition
              ease-in-out 
              focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              />

              <div
                onClick={decrement}
                className="text-3xl px-[0.2em] hover:cursor-pointer text-white"
              >
                -
              </div>
            </div>
            <button
              onClick={handleBuy}
              className="shadow-md text-xl bg-orange-600 text-white rounded p-2 text-center  hover:shadow-2xl hover:bg-orange-400  transition-all w-fit h-[2.5em]"
            >
              Add to Cart
            </button>
          </div>
          <p className="text-xl text-slate-700 inline-block break-words rounded pt-[1em]">
            {props.data[0].description}
          </p>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps({ params, locale }) {
  const ObjectId = require("mongodb").ObjectId;
  const { db } = await connectToDatabase();
  let data = await db
    .collection("product")
    .find({ _id: ObjectId(params.id.toString()) })
    .toArray();
  data = JSON.parse(JSON.stringify(data));

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      data,
    },
  };
}
export async function getStaticPaths({ locales }) {
  const { db } = await connectToDatabase();
  let data = await db.collection("product").find().toArray();

  data = JSON.parse(JSON.stringify(data));

  /* For dynamic route, i18next need to do this */
  // credit: https://stackoverflow.com/questions/70596939/how-to-generate-dynamic-paths-for-non-default-locales-in-next-js
  const paths = data
    .map((item) =>
      locales.map((locale) => ({
        params: { id: item._id.toString() },
        locale, // Pass locale here
      }))
    )
    .flat(); // Flatten array to avoid nested arrays

  return {
    paths,
    fallback: false,
  };
}