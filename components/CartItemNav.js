import React, { useEffect, useContext, useState } from "react";
import styles from "../styles/CartItemNav.module.css";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import Link from "next/link";
import { cartContext, languageContext } from "../pages/_app";
import { useRouter } from "next/router";
import LoadingIcons from "react-loading-icons";

const CartItemNav = ({ oriData, data }) => {
  const language = useContext(languageContext);
  const [allowClick, setAllowClick] = useState(true);

  const { t } = useTranslation("common");
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
    setAllowClick(false);
    const res = await fetch(
      rootRoute + process.env.NEXT_PUBLIC_BACKENDDELETE + "/" + data._id,
      {
        method: "DELETE",
        headers: {
          Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
          "Content-type": "application/json",
        },
        // "Acess-control-allow-origin": "https://www.guanzhiyan.com",
      }
    );
    res = await res.json();
    updateData(data._id);
    toggleCart();
    setAllowClick(true);
  }

  function renderTitle() {
    return language == 1
      ? data.imageTitleEn
      : language == 2
      ? data.imageTitle
      : data.imageTitleZhc;
  }
  return (
    <div className={`${styles.cart}`}>
      {allowClick ? (
        <></>
      ) : (
        <div className="w-full h-full top-0 right-0 bottom-0 left-0 bg-black opacity-50	fixed z-10 flex justify-center items-center">
          <LoadingIcons.Oval height={300} width={300} />
        </div>
      )}
      <div className={styles.imageBox}>
        <Link href={`/product/${data._id}`} locale={router.locale}>
          <a>
            <Image
              loading="eager"
              key={data._id}
              src={data.image}
              alt={data.imageAlt}
              width={"125%"}
              height={"125%"}
            ></Image>
          </a>
        </Link>
      </div>
      <div className={styles.titleBox}>{renderTitle()}</div>
      <div className={styles.subtitleBox}>
        <button onClick={handleDelete} className="text-red-600 underline">
          {t("Delete")}
        </button>
      </div>
      <div className={styles.priceBox}>
        {data.amount} x RM{parseInt(data.price).toFixed(2)}
      </div>
    </div>
  );
};

export default CartItemNav;
