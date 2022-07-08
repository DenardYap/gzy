import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Item.module.css";
import { useTranslation } from "next-i18next";
import React, { useEffect, useRef, useContext, useState } from "react";
import { cartContext } from "../pages/_app";
import { useRouter } from "next/router";

// Componenet for each item
// Todo: 1) Make hover image

export default function Item({
  id,
  productID,
  prices,
  url,
  title,
  description,
  max_,
  alt,
}) {
  const [cartToggle, toggleCart] = useContext(cartContext);
  // console.log("Cart toggle is:", cartToggle);
  // dynamically generate the rootroute based on whether production or dev mode
  const rootRoute =
    process.env.NODE_ENV == "production"
      ? process.env.NEXT_PUBLIC_productAPIpro
      : process.env.NEXT_PUBLIC_productAPIdev;
  const router = useRouter();
  const imageRef = useRef(null);
  const itemRef = useRef(null);
  const { t } = useTranslation("common");

  function increment() {
    if (parseInt(itemRef.current.value) !== parseInt(max_)) {
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
      // either data is empty, or cached, we just need to update the quantity
      // Make a post request to the backend
      let body = {
        max: max_,
        id,
        amount: itemRef.current.value,
      };
      itemRef.current.value = "0";
      let res = await fetch(rootRoute + process.env.NEXT_PUBLIC_BACKENDSET, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Acess-control-allow-origin": "https://www.guanzhiyan.com",
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
    }
  }
  return (
    <div className={styles.container}>
      <Link href={`/product/${id}`} locale={router.locale}>
        <a>
          <Image
            ref={imageRef}
            loading="lazy"
            className={styles.imager}
            src={url}
            alt={alt}
            width={"350%"}
            height={"350%"}
          />
        </a>
      </Link>
      <div className={styles.bottomContainer}>
        <div className="">
          <h3>{title} </h3>
        </div>

        <hr
          className="bg-slate-400"
          style={{
            width: "2px",
            height: "100%",
            display: "inline-block",
          }}
        ></hr>
        <div className="flex-row justify-center items-center ">
          <div className="shadow-md flex justify-center items-center bg-slate-800 w-fit m-auto mt-1">
            <div
              onClick={increment}
              className="text-3xl hover:cursor-pointer text-white px-[0.2em]"
            >
              +
            </div>
            <input
              ref={itemRef}
              id="qty"
              type="number"
              min="0"
              max={max_}
              defaultValue="0"
              step="1"
              className="text-center 
              h-auto
              min-w-[2em]
              w-fit
              py-1
              text-black
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
            className="
            ml-[0.3em] bg-orange-600 text-white rounded p-1 shadow-xl  text-center my-1 hover:shadow-2xl hover:bg-orange-400  transition-all"
          >
            {t("cart")}
          </button>
        </div>
      </div>
    </div>
  );
}

// TODO: change to better default values, for now it's just testing
Item.defaultProps = {
  url: "/images/nan.jpg",
  title: "Not Available",
  alt: "error.jpg",
  max_: "0", // change to 0 in  the future
};
