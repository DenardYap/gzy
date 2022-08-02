import React, { useRef, useState, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/CartItem.module.css";
import { Bars } from "react-loading-icons";
import Swal from "sweetalert2";
import { languageContext } from "../pages/_app";
import { useTranslation } from "next-i18next";

const CartItem = ({
  data,
  oriData,
  setData,
  allowClick,
  setAllowClick,
  allowClickRef,
  total,
  setTotal,
}) => {
  const language = useContext(languageContext);
  const router = useRouter();
  const { t } = useTranslation("common");
  const inputRef = useRef();
  // change this to a layout rolling icon
  const allowClickStyle =
    "shadow-md flex justify-center items-center bg-orange-600 w-fit";
  const disallowClickStyle =
    "shadow-md flex justify-center items-center bg-slate-600 w-fit";

  const rootRoute =
    process.env.NODE_ENV == "production"
      ? process.env.NEXT_PUBLIC_productAPIpro
      : process.env.NEXT_PUBLIC_productAPIdev;

  function updateData(id, newAmount) {
    let curPrice;
    for (let i = 0; i < oriData.length; i++) {
      if (oriData[i]._id === id) {
        if (newAmount === "0") {
          curPrice =
            total - parseInt(oriData[i].amount) * parseInt(oriData[i].price);
          oriData.splice(i, 1);
          // data.amount = "0";
        } else {
          curPrice = total + parseInt(newAmount) * parseInt(oriData[i].price);
          oriData[i].amount = (
            parseInt(oriData[i].amount) + parseInt(newAmount)
          ).toString();
          // data.amount = oriData[i].amount;
        }
        setTotal(curPrice);
        setData(oriData);
        console.log("found");
        break;
      }
    }
  }
  async function postData(amount) {
    let body = {
      id: data._id,
      max: data.quantity,
      amount,
    };
    let res = await fetch(rootRoute + process.env.NEXT_PUBLIC_BACKENDSET, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Acess-control-allow-origin": "https://www.guanzhiyan.com",
        Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
      },
      body: JSON.stringify(body),
    });
    return res;
  }
  async function increment() {
    if (allowClickRef.current) {
      // allowClick = false;
      if (inputRef.current.value !== data.quantity.toString()) {
        setAllowClick(false);

        // allowClick = await postData("1");
        let res = await postData("1");
        if (res.status != 200) {
          res = await res.json();
          alert(res.error);
        } else {
          updateData(data._id, "1");
          setAllowClick(true);
          // Swal.fire({
          //   title: "Done!",
          //   icon: "success",
          //   timer: 700,
          //   timerProgressBar: true,
          //   color: "#1e293b",
          //   showConfirmButton: false,
          //   // confirmButtonColor: "#fb923c",
          // });
          inputRef.current.value = (
            parseInt(inputRef.current.value) + 1
          ).toString();
        }
      } else {
        alert(
          `You have exceeded the max amount of quantity, please make sure you have less than ${data.quantity} in your shopping cart!`
        );
      }
    }
  }
  async function decrement() {
    if (allowClickRef.current) {
      // allowClick = false;
      if (inputRef.current.value !== "0") {
        setAllowClick(false);
        // allowClick = await postData("-1");
        if (parseInt(inputRef.current.value) - 1 === 0) {
          await deleteItem();
        } else {
          await postData("-1");
          updateData(data._id, "-1");
          setAllowClick(true);
          // Swal.fire({
          //   title: "Done!",
          //   icon: "success",
          //   timer: 700,
          //   timerProgressBar: true,
          //   color: "#1e293b",
          //   showConfirmButton: false,
          //   // confirmButtonColor: "#fb923c",
          // });
          inputRef.current.value = (
            parseInt(inputRef.current.value) - 1
          ).toString();
        }
      }
    }
  }

  async function deleteItem() {
    setAllowClick(false);
    await fetch(
      rootRoute +
        process.env.NEXT_PUBLIC_BACKENDDELETE +
        "/" +
        data._id.toString(),
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
        },
      }
    ).then(console.log("Successfuly deleted item"));
    setAllowClick(true);
    // Swal.fire({
    //   title: "Item deleted!",
    //   icon: "success",
    //   timer: 700,
    //   timerProgressBar: true,
    //   color: "#1e293b",
    //   showConfirmButton: false,
    //   // confirmButtonColor: "#fb923c",
    // });
    updateData(data._id, "0");
  }

  function renderTitle() {
    return language == 1
      ? data.imageTitleEn
      : language == 2
      ? data.imageTitle
      : data.imageTitleZhc;
  }

  return (
    <div className={styles.mainDiv}>
      <div className={styles.imageDiv}>
        {/* image */}
        <Link href={`/product/${data._id}`} locale={router.locale} passHref>
          <a>
            <div className="relative mini:h-[15em] laptop:h-[10em] mini:w-[15em] laptop:w-[10em] border-2 border-solid border-black">
              <Image
                loading="eager"
                priority={true}
                src={data.image}
                alt={data.imageAlt}
                objectFit="cover"
                layout="fill"
              ></Image>
            </div>
          </a>
        </Link>
      </div>
      <div className={styles.imageRightDiv}>
        <div className="text-left items-center border-b-2  border-black w-full laptop:pt-0 mini:pt-[1em]">
          <h3 className=" text-md italic underline pb-1">{t("item_name")}</h3>
          <h3 className="laptop:hidden block text-md italic pb-1">
            RM{parseInt(data.price).toFixed(2)}{" "}
          </h3>

          <h2 className="text-4xl"> {renderTitle()}</h2>
        </div>
        <div className={`${styles.imageRightSubDiv} `}>
          <h3> RM{parseInt(data.price).toFixed(2)}</h3>
          <h3>
            <button className="text-red-600 underline" onClick={deleteItem}>
              {" "}
              {t("Delete")}{" "}
            </button>
          </h3>
        </div>
      </div>
      <div className={styles.quantityDiv}>
        <div className="justify-center items-center text-2xl hidden laptop:flex">
          <h3>{t("Quantity")}</h3>
        </div>
        <div className=" flex justify-center h-fit ">
          <div className={allowClick ? allowClickStyle : disallowClickStyle}>
            <div
              onClick={decrement}
              className="pl-2 mini:text-4xl laptop:text-2xl hover:cursor-pointer text-white transition-all"
            >
              -
            </div>
            <input
              // ref={itemRef}
              ref={inputRef}
              id="qty"
              type="number"
              min="0"
              // max={data.quantity}
              defaultValue={data.amount}
              step="1"
              className="text-center 
              mini:text-3xl laptop:text-xl
              w-[3em]
              h-[1.75em]
              
              mx-2
              px-1
              font-normal
              text-slate-900
              bg-white bg-clip-padding
              border border-solid border-black 
              transition
              ease-in-out 
              focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
            <div
              onClick={increment}
              className="pr-[0.5em] mini:text-4xl laptop:text-2xl hover:cursor-pointer text-white"
            >
              +
            </div>
          </div>
        </div>
      </div>
      <div
        className={`${styles.subTotalDiv} mini:text-3xl laptop:text-xl laptop:py-0 mini:py-2 `}
      >
        <h3 className="underline">{t("Subtotal")}:</h3>
        <h3 className="mini:text-3xl laptop:text-2xl flex">
          RM{(parseInt(data.price) * parseInt(data.amount)).toFixed(2)}
        </h3>
      </div>
    </div>
  );
};

export default CartItem;
