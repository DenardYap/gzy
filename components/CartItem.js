import React, { useEffect, useContext } from "react";
import styles from "../styles/CartItem.module.css";
import Image from "next/image";
import Link from "next/link";
import { cartContext } from "../pages/_app";
import { useRouter } from "next/router";

const CartItem = ({ data }) => {
  const [cartToggle, toggleCart] = useContext(cartContext);
  const router = useRouter();
  function handleDelete() {
    // delete item from data and local storage
    // Todo: delete item from data

    // now let's just do local storage first

    let curData = JSON.parse(localStorage.getItem("cartItem"));

    for (let i = 0; i < curData.length; i++) {
      if (curData[i].productID === data.productID) {
        curData.splice(i, 1);
        break;
      }
    }
    localStorage.setItem("cartItem", JSON.stringify(curData));
    toggleCart();
  }

  return (
    <div className={`${styles.cart}`}>
      <div className={styles.imageBox}>
        <Link href={`/product/${data.productID}`} locale={router.locale}>
          <a>
            <Image
              loading="eager"
              src={data.image}
              alt={data.alt}
              width={"125%"}
              height={"125%"}
            ></Image>
          </a>
        </Link>
      </div>
      <div className={styles.titleBox}>{data.imageTitle}</div>
      <div className={styles.subtitleBox}>
        <button onClick={handleDelete} className="text-red-600 underline">
          Delete
        </button>
      </div>
      <div className={styles.priceBox}>qty:{data.quantity}</div>
    </div>
  );
};

export default CartItem;
