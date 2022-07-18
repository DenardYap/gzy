import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Item.module.css";
import { useTranslation } from "next-i18next";
import React, { useEffect, useRef, useContext, useState } from "react";
import { cartContext } from "../pages/_app";
import { useRouter } from "next/router";
import Swal from "sweetalert2";

// Componenet for each item
// Todo: 1) Make hover image

export default function Item({ oriData, setAllowClick }) {
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
      setAllowClick(false);
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
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(body),
      });
      if (res.status == 404) {
        res = await res.json();
        setAllowClick(true);
        // swal("Oops!", res.error, "error");
        Swal.fire({
          title: "Oops!",
          text: res.error,
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
          title: "Oops!",
          text: "An error occurs, please contact the seller!",
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
      console.log("hello");
      Swal.fire({
        title: "Done!",
        icon: "success",
        timer: 700,
        timerProgressBar: true,
        color: "#1e293b",
        showConfirmButton: false,
        // confirmButtonColor: "#fb923c",
      });
      console.log("Done adding to cart!");
    }
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
          <div className="relative h-[20em] w-[19em] justify-center items-center z-0">
            <Image
              ref={imageRef}
              loading="lazy"
              className={styles.imager}
              src={oriData.image}
              alt={oriData.alt}
              layout="fill"
              objectFit="cover"
              // width={"350%"}
              // height={"350%"}
            />
          </div>
        </a>
      </Link>
      <div className={styles.bottomContainer}>
        <div className="">
          <h3>{oriData.imageTitle} </h3>
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
              max={oriData.quantity}
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
// Item.defaultProps = {
//   url: "/images/nan.jpg",
//   title: "Not Available",
//   alt: "error.jpg",
//   max_: "0", // change to 0 in  the future
// };
