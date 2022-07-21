import React, { useContext } from "react";
import { languageContext } from "../pages/_app";
import { useTranslation } from "next-i18next";

const CartItemCheckout = ({ item }) => {
  const language = useContext(languageContext);
  const { t } = useTranslation("common");

  function renderTitle() {
    return language == 1
      ? item.imageTitleEn
      : language == 2
      ? item.imageTitle
      : item.imageTitleZhc;
  }
  return (
    <div className="flex flex-col text-2xl text-slate-600">
      <div className="flex flex-row justify-between text-xl font-medium ">
        <h3>{renderTitle()}</h3>
        <h4>
          {t("Subtotal")}: RM
          {(parseInt(item.price) * parseInt(item.amount)).toFixed(2)}
        </h4>
      </div>
      <div className="flex flex-row justify-between text-base  text-gray-400 font-light pb-2">
        <h3>
          {t("Quantity")}: {item.amount}
        </h3>
        <h4>RM{parseFloat(item.price).toFixed(2)} / item</h4>
      </div>
    </div>
  );
};

export default CartItemCheckout;
