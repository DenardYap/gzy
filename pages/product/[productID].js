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
  function handleBuy() {
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
      if (localStorage.getItem("cartItem") == null) {
        localStorage.setItem(
          "cartItem",
          JSON.stringify([
            {
              imageAlt: props.data[0].imageAlt,
              imageTitle: props.data[0].imageTitle,
              image: props.data[0].image,
              productID: props.data[0].productID,
              quantity: itemRef.current.value,
            },
          ])
        );
        toggleCart();
      } else {
        let curData = JSON.parse(localStorage.getItem("cartItem"));
        /*If exists, update, else, add*/
        let exists = false;
        for (let i = 0; i < curData.length; i++) {
          if (curData[i].productID === props.data[0].productID) {
            // update
            curData[i].quantity = parseInt(curData[i].quantity);
            if (
              curData[i].quantity + parseInt(itemRef.current.value) >
              itemRef.current.max
            ) {
              alert(
                `Please make sure the quantity of this item in your shopping cart is no more than ${itemRef.current.max}, we cannot sell you more!`
              );
              itemRef.current.value = "0";
              return;
            }
            curData[i].quantity += parseInt(itemRef.current.value);
            exists = true;
            break;
          }
        }
        if (!exists) {
          curData.push({
            imageAlt: props.data[0].imageAlt,
            imageTitle: props.data[0].imageTitle,
            image: props.data[0].image,
            productID: props.data[0].productID,
            quantity: itemRef.current.value,
          });
        }
        localStorage.setItem("cartItem", JSON.stringify(curData));
        toggleCart();
      }
    }
    itemRef.current.value = "0";
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
            RM{props.data[0].price}.00
          </h3>
          <hr className="border-black mr-[1em]"></hr>
          <div className=" rounded flex items-center bg-slate-200 justify-center">
            <label
              className="form-label text-slate-900 font-medium mr-2 text-3xl  "
              htmlFor="qty"
            >
              Quantity
            </label>
            <input
              ref={itemRef}
              id="qty"
              type="number"
              min="0"
              max={props.data[0].quantity}
              defaultValue="0"
              step="1"
              className="text-left 
              text-xl
              shadow-md
              w-[3em]
              h-[2.5em]
              mx-2
              px-1
              font-normal
              text-slate-900
              bg-white bg-clip-padding
              border border-solid border-gray-300 rounded 
              transition
              ease-in-out 
              focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
            <button
              onClick={handleBuy}
              className="shadow-md text-xl bg-slate-800 text-slate-100 rounded p-2 text-center  hover:bg-slate-600 hover:text-slate-200 transition-all w-fit h-[2.5em]"
            >
              Add to Cart
            </button>
          </div>
          <p className="text-xl text-slate-700 inline-block break-words rounded">
            {props.data[0].description}
          </p>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps({ params, locale }) {
  const { db } = await connectToDatabase();
  let data = await db
    .collection("product")
    .find({ productID: parseInt(params.productID) })
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
        params: { productID: item.productID.toString() },
        locale, // Pass locale here
      }))
    )
    .flat(); // Flatten array to avoid nested arrays

  return {
    paths,
    fallback: false,
  };
}
