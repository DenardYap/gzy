import React, { useEffect, useContext } from "react";
import styles from "../styles/CartItemNav.module.css";
import Image from "next/image";
import Link from "next/link";
import { cartContext } from "../pages/_app";
import { useRouter } from "next/router";

const CartItemNav = ({ data }) => {
  const [cartToggle, toggleCart] = useContext(cartContext);
  const router = useRouter();
  const rootRoute =
    process.env.NODE_ENV == "production"
      ? process.env.NEXT_PUBLIC_productAPIpro
      : process.env.NEXT_PUBLIC_productAPIdev;
  async function handleDelete() {
    await fetch(
      rootRoute + process.env.NEXT_PUBLIC_BACKENDDELETE + "/" + data._id,
      {
        method: "DELETE",
        "Content-type": "application/json",
        "Acess-control-allow-origin": "https://www.guanzhiyan.com",
      }
    );
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
