import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Item.module.css";
import { useTranslation } from "next-i18next";
import React, { useEffect, useRef, useContext } from "react";
import { cartContext } from "../pages/_app";

// Componenet for each item
// Todo: 1) Make hover image

const Item = ({ productID, url, title, max_, alt }) => {
  const [cartToggle, toggleCart] = useContext(cartContext);
  // console.log("Cart toggle is:", cartToggle);
  const imageRef = useRef(null);
  const itemRef = useRef(null);
  const { t } = useTranslation("common");

  function handleBuy() {
    // make sure the item doesn't exceed the max limit
    // also make sure the item is not 0
    if (itemRef.current.value === "0") {
      alert("Please make sure item quantity is at least 1");
    } else if (
      parseInt(itemRef.current.value) > parseInt(itemRef.current.max)
    ) {
      console.log(itemRef.current.value, itemRef.current.max);
      alert(
        `Please make sure the item quantity is no more than ${itemRef.current.max}`
      );
    } else if (itemRef.current.value[0] === "0") {
      alert("Please make sure the item quantity doesn't start with 0");
    } else {
      // do database query here

      // If guest user, we don't even need to store in database, just store in storage or smtg
      // If normal user, we store shopping cart items in database,
      // with the user id or smtg as the key
      if (localStorage.getItem("cartItem") == null) {
        localStorage.setItem(
          "cartItem",
          JSON.stringify([
            {
              imageAlt: alt,
              imageTitle: title,
              image: url,
              productID,
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
          if (curData[i].productID === productID) {
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
            imageAlt: alt,
            imageTitle: title,
            image: url,
            productID,
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
    <div className={styles.container}>
      <Image
        ref={imageRef}
        loading="lazy"
        className={styles.imager}
        src={url}
        alt={alt}
        width={"300%"}
        height={"300%"}
      />
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
        <div className="flex-col ">
          <div className="flex items-center justify-evenly">
            <label className="form-label text-slate-700 mr-1 " htmlFor="qty">
              {t("qty")}
            </label>
            <input
              ref={itemRef}
              id="qty"
              type="number"
              min="0"
              max={max_}
              defaultValue="0"
              step="1"
              className="text-left w-fit
              h-fit
              my-1
              px-1
              font-normal
              text-gray-700
              bg-white bg-clip-padding
              border border-solid border-gray-300 rounded 
              transition
              ease-in-out 
              focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>
          <button
            onClick={handleBuy}
            className="bg-slate-800 text-slate-100 rounded p-1 text-center mb-1 mr-1 hover:bg-slate-600 hover:text-slate-200 transition-all"
          >
            {t("cart")}
          </button>
        </div>
      </div>
    </div>
  );
};

// TODO: change to better default values, for now it's just testing
Item.defaultProps = {
  url: "/images/tiao.jpg",
  title: "asd",
  alt: "gzy bird's nest",
  max_: "99", // change to 0 in  the future
};

export default Item;
