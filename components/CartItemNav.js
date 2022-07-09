import React, { useEffect, useContext } from "react";
import styles from "../styles/CartItemNav.module.css";
import Image from "next/image";
import Link from "next/link";
import { cartContext } from "../pages/_app";
import { useRouter } from "next/router";

const CartItemNav = ({ oriData, data }) => {
  const [cartToggle, toggleCart, items, setItems] = useContext(cartContext);
  const router = useRouter();
  const rootRoute =
    process.env.NODE_ENV == "production"
      ? process.env.NEXT_PUBLIC_productAPIpro
      : process.env.NEXT_PUBLIC_productAPIdev;

  function updateData(id) {
    for (let i = 0; i < oriData.length; i++) {
      if (oriData[i]._id === id) {
        // found
        oriData.splice(i, 1); //go ahead and delete that item
        setItems(oriData);
        return;
      }
    }
  }
  async function handleDelete() {
    const res = await fetch(
      rootRoute + process.env.NEXT_PUBLIC_BACKENDDELETE + "/" + data._id,
      {
        method: "DELETE",
        "Content-type": "application/json",
        // "Acess-control-allow-origin": "https://www.guanzhiyan.com",
      }
    );
    res = await res.json();
    console.log("Res error is", res.error);
    updateData(data._id);
    toggleCart();
  }

  return (
    <div className={`${styles.cart}`}>
      <div className={styles.imageBox}>
        <Link href={`/product/${data._id}`} locale={router.locale}>
          <a>
            <Image
              loading="eager"
              src={data.image}
              alt={data.imageAlt}
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
      <div className={styles.priceBox}>
        {data.amount} x RM{parseInt(data.price).toFixed(2)}
      </div>
    </div>
  );
};

export default CartItemNav;
