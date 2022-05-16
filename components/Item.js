import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Item.module.css";
import { useTranslation } from "next-i18next";

// Componenet for each item
// Todo: 1) Make hover image

const Item = ({ url, title, alt }) => {
  const { t } = useTranslation("common");
  return (
    <div className={styles.container}>
      <Image
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
            <label className="form-label text-slate-700 mr-1 ">{t("qty")}</label>
            <input
              id="qty"
              type="number"
              min="0"
              max="99"
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
          <button className="bg-slate-800 text-slate-100 rounded p-1 text-center mb-1 mr-1 hover:bg-slate-600 hover:text-slate-200 transition-all">
            {t("cart")}
          </button>
        </div>
      </div>
    </div>
  );
};

Item.defaultProps = {
  url: "/images/tiao.jpg",
  title: "asd",
  alt: "gzy bird's nest",
};

export default Item;
