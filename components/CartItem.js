import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/CartItem.module.css";
import { Bars } from "react-loading-icons";

const CartItem = ({
  data,
  setToggle,
  allowClick,
  setAllowClick,
  allowClickRef,
}) => {
  const router = useRouter();
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

  async function postData(amount) {
    console.log("hello world");
    let body = {
      id: data._id,
      max: data.quantity,
      amount,
    };
    console.log("GOODBYE WORLD");
    await fetch(rootRoute + process.env.NEXT_PUBLIC_BACKENDSET, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Acess-control-allow-origin": "https://www.guanzhiyan.com",
      },
      body: JSON.stringify(body),
    });
    return true;
  }
  async function increment() {
    if (allowClickRef.current) {
      // allowClick = false;
      setAllowClick(false);
      if (inputRef.current.value !== data.quantity.toString()) {
        // allowClick = await postData("1");
        setAllowClick(await postData("1"));
        setToggle();
        inputRef.current.value = (
          parseInt(inputRef.current.value) + 1
        ).toString();
      }
    }
  }
  async function decrement() {
    if (allowClickRef.current) {
      setAllowClick(false);
      // allowClick = false;
      if (inputRef.current.value !== "0") {
        // allowClick = await postData("-1");
        if (parseInt(inputRef.current.value) - 1 === 0) {
          console.log("triggered");
          await deleteItem();
        } else {
          setAllowClick(await postData("-1"));
          setToggle();
          inputRef.current.value = (
            parseInt(inputRef.current.value) - 1
          ).toString();
        }
      }
    }
  }

  async function deleteItem() {
    if (allowClickRef.current) {
      setAllowClick(false);
      await fetch(
        rootRoute +
          process.env.NEXT_PUBLIC_BACKENDDELETE +
          "/" +
          data._id.toString(),
        {
          method: "DELETE",
          header: {
            "Content-Type": "application/json",
            "Acess-control-allow-origin": "https://www.guanzhiyan.com",
          },
        }
      ).then(console.log("Successfuly deleted item"));
      console.log("reached here");
      setAllowClick(true);
      setToggle();
    }
  }
  return (
    <div className={styles.mainDiv}>
      <div className={styles.imageDiv}>
        {/* image */}
        <Link href={`/product/${data._id}`} locale={router.locale}>
          <a>
            <div className="border-2 border-solid border-black w-fit">
              <Image
                src={data.image}
                alt={data.imageAlt}
                height={"150%"}
                width={"150%"}
              ></Image>
            </div>
          </a>
        </Link>
      </div>
      <div className={styles.imageRightDiv}>
        <div className=" flex-row text-left items-center border-b-2 border-black w-fit">
          <h3 className="text-md italic underline pb-1">Item&apos;s name</h3>
          <h2 className="text-4xl"> {data.imageTitle}</h2>
        </div>
        <div className={styles.imageRightSubDiv}>
          <h3> RM{data.price}.00</h3>
          <h3>
            <button className="text-red-600 underline" onClick={deleteItem}>
              {" "}
              Delete{" "}
            </button>
          </h3>
        </div>
      </div>
      <div className={styles.quantityDiv}>
        <div className="flex justify-center items-center text-2xl ">
          <h3>Quantity</h3>
        </div>
        <div className=" flex justify-center h-fit ">
          <div className={allowClick ? allowClickStyle : disallowClickStyle}>
            <div
              onClick={increment}
              className="pl-2 text-2xl hover:cursor-pointer text-white transition-all"
            >
              +
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
              text-xl
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
              onClick={decrement}
              className="pr-[0.5em] text-2xl  hover:cursor-pointer text-white"
            >
              -
            </div>
          </div>
        </div>
      </div>
      <div className={`${styles.subTotalDiv}`}>
        <h3>Subtotal:</h3>
        <h3 className="text-2xl flex">
          RM{parseInt(data.price) * parseInt(data.amount)}
        </h3>
      </div>
    </div>
  );
};

export default CartItem;
