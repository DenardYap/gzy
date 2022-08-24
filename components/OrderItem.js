import React, { useContext } from "react";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/OrderItem.module.css";
import { languageContext } from "../pages/_app";
const OrderItem = ({ data }) => {
  const language = useContext(languageContext);
  const { t } = useTranslation("common");
  const router = useRouter();

  function renderTitle() {
    return language == 1
      ? data.imageTitleEn
      : language == 2
      ? data.imageTitle
      : data.imageTitleZhc;
  }
  return (
    <div className={styles.orderGrid}>
      <div className={styles.imageGrid}>
        <Link href={`/product/${data.id}`} locale={router.locale}>
          <div className="relative phone:h-[10em] phone:w-[10em] mini:h-[9em] mini:w-[9em]  laptop:h-[7em] laptop:w-[7em] cursor-pointer ">
            <Image
              priority={true}
              src={data.image}
              layout="fill"
              objectFit="contain"
              className=""
            ></Image>
          </div>
        </Link>
      </div>
      <div className="mt-[0.5em] text-sm laptop:hidden underline ">
        {t("Name")}
      </div>
      <div className={`mini:text-2xl  laptop:text-xl ${styles.titleGrid}`}>
        {renderTitle()}
      </div>
      <div className="text-sm laptop:hidden underline "> {t("Quantity")} </div>
      <div className={`mini:text-2xl  laptop:text-xl  ${styles.quantityGrid}`}>
        {data.amount} pcs
      </div>
      <div className="text-sm laptop:hidden underline "> {t("Price")} </div>
      <div className={`mini:text-2xl laptop:text-xl  ${styles.priceGrid}`}>
        RM{parseInt(data.price).toFixed(2)}
      </div>
      <div className="text-sm laptop:hidden underline "> {t("Subtotal")} </div>
      <div
        className={`mini:mb-[0.5em] laptop:mb-0 mini:text-2xl laptop:text-xl  ${styles.subTitleGrid}`}
      >
        RM{(parseInt(data.amount) * parseInt(data.price)).toFixed(2)}
      </div>
    </div>
  );
};

export default OrderItem;
