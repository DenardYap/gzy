import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Item.module.css";
import { useTranslation } from "next-i18next";
import React, { useEffect, useRef, useContext, useState } from "react";
import { cartContext } from "../pages/_app";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { languageContext } from "../pages/_app";

// Componenet for each item
// Todo: 1) Make hover image

export default function Item({ oriData, setAllowClick }) {
  const language = useContext(languageContext);
  const [cartToggle, toggleCart, items, setItems] = useContext(cartContext);

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

  function updateItems(id, amount) {
    for (let i = 0; i < items.length; i++) {
      // console.log("items is:", items[i]);
      if (items[i]._id === id) {
        console.log("found!");
        items[i].amount = (
          parseInt(items[i].amount) + parseInt(amount)
        ).toString();
        setItems(items);
        return;
      }
    }
    // if reach here, items not yet in the cart
    oriData.amount = amount;
    items.push(oriData);
    setItems(items);
  }
  function increment() {
    if (parseInt(itemRef.current.value) !== parseInt(oriData.quantity)) {
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
    if (parseInt(itemRef.current.value) <= 0) {
      alert("Please make sure item quantity is at least 1");
    } else if (
      parseInt(itemRef.current.value) > parseInt(itemRef.current.max)
    ) {
      alert(
        `Please make sure the item quantity is no more than ${itemRef.current.max}`
      );
    } else if (itemRef.current.value[0] === "0") {
      alert("Please make sure the item quantity doesn't start with 0");
    } else if (!itemRef.current.value) {
      alert("Please make sure item quantity is at least 1");
    } else {
      setAllowClick(false);
      itemRef.current.value = parseInt(itemRef.current.value).toString();
      // either data is empty, or cached, we just need to update the quantity
      // Make a post request to the backend
      let body = {
        max: oriData.quantity,
        id: oriData._id,
        amount: itemRef.current.value,
      };
      const curValue = itemRef.current.value;
      itemRef.current.value = "0";
      let res = await fetch(rootRoute + process.env.NEXT_PUBLIC_BACKENDSET, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Acess-control-allow-origin": "https://www.guanzhiyan.com",
          Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(body),
      });
      if (res.status == 404) {
        res = await res.json();
        setAllowClick(true);
        // swal("Oops!", res.error, "error");
        Swal.fire({
          title: t("oops"),
          text: t("error_text_max"),
          icon: "error",
          color: "#1e293b",
          // showConfirmButton: false,
          confirmButtonColor: "#1e293b",
        });
        return;
      } else if (res.status == 500) {
        //programmer's error
        console.log("500 error, programmer please check");
        setAllowClick(true);
        // swal("Oops!", "An error occurs, please contact the seller!", "error");
        Swal.fire({
          title: t("oops"),
          text: t("error_text"),
          icon: "error",
          color: "#1e293b",
          // showConfirmButton: false,
          confirmButtonColor: "#1e293b",
        });
        return;
      }
      res = await res.json();
      // toggleCart();
      updateItems(oriData._id, curValue);
      toggleCart();
      setAllowClick(true);
      Swal.fire({
        title: t("done"),
        icon: "success",
        timer: 700,
        timerProgressBar: true,
        color: "#1e293b",
        showConfirmButton: false,
        // confirmButtonColor: "#fb923c",
      });
    }
  }

  function renderTitle() {
    return language == 1
      ? oriData.imageTitleEn
      : language == 2
      ? oriData.imageTitle
      : oriData.imageTitleZhc;
  }
  return (
    <div className={styles.container}>
      {/* layover if item sold out */}
      {oriData.quantity === "0" ? (
        <div className={styles.soldOut}>
          <h3>Sold out</h3>
        </div>
      ) : (
        <></>
      )}

      <Link href={`/product/${oriData._id}`} locale={router.locale}>
        <a>
          <div
            className={`${styles.imageContainer} relative justify-center items-center z-0`}
          >
            <Image
              ref={imageRef}
              className={styles.imager}
              key={oriData.image}
              src={oriData.image}
              alt={oriData.alt}
              layout="fill"
              objectFit="cover"
              loading="eager"
              // width={"350%"}
              // height={"350%"}
            />
          </div>
        </a>
      </Link>
      <div className={styles.bottomContainer}>
        <div className="">
          <h3> {renderTitle()} </h3>
        </div>

        <hr
          className="bg-slate-400"
          style={{
            width: "2px",
            height: "100%",
            display: "inline-block",
          }}
        ></hr>
        <div className="flex-col justify-center items-center flex w-full   relative ">
          <div className="shadow-md flex justify-center items-center text-center bg-slate-800 m-auto my-1 h-full w-full mini:text-[0.5em] phone:text-[0.75em] tablet:text-[1em]">
            <div
              onClick={decrement}
              className="mini:text-2xl tablet:text-3xl  h-full w-full hover:cursor-pointer text-slate-50 px-[0.2em]"
            >
              -
            </div>
            <input
              ref={itemRef}
              id="qty"
              type="number"
              min="0"
              max={oriData.quantity}
              defaultValue="0"
              step="1"
              className="text-center 
              mini:text-[0.75em]
              laptop:text-[1em]
              
              h-full
              mini:min-w-[2em]
              phone:min-w-[3em]
              w-full
              py-1
              text-slate-800
              bg-slate-50 bg-clip-padding
              border border-solid border-black 
              transition
              ease-in-out 
              focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
            <div
              onClick={increment}
              className="mini:text-2xl tablet:text-3xl w-full px-[0.2em] hover:cursor-pointer text-slate-50"
            >
              +
            </div>
          </div>

          <button
            onClick={handleBuy}
            className="
             bg-orange-600 text-slate-50 rounded h-full mini:text-[0.75em] phone:text-[1em] p-1 shadow-xl text-center my-1 hover:shadow-2xl hover:bg-orange-400  transition-all"
          >
            {t("cart")}
          </button>
        </div>
      </div>
    </div>
  );
}

// TODO: change to better default values, for now it's just testing
// Item.defaultProps = {
//   url: "/images/nan.jpg",
//   title: "Not Available",
//   alt: "error.jpg",
//   max_: "0", // change to 0 in  the future
// };
