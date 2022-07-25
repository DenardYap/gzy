import React, { useEffect } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../../next-i18next.config";
import { connectToDatabase } from "../../util/mongodb";
import styles from "../../styles/ProductPage.module.css";
import Image from "next/image";
import { cartContext, languageContext, dynamicContext } from "../_app";
import { useContext, useRef, useState } from "react";
import { useRouter } from "next/router";

export default function ItemPage(props) {
  const router = useRouter();

  const [renderReady, setRenderReady] = useState(false);
  useEffect(() => {
    if (!router.isFallback) {
      setRenderReady(true);
    }
  }, []);

  const [dynamicID, setDynamicID] = useContext(dynamicContext);
  const language = useContext(languageContext);
  const imageRef = useRef(null);
  const itemRef = useRef(null);
  const [cartToggle, toggleCart, items, setItems] = useContext(cartContext);

  const { t } = useTranslation("common");
  const rootRoute =
    process.env.NODE_ENV == "production"
      ? process.env.NEXT_PUBLIC_productAPIpro
      : process.env.NEXT_PUBLIC_productAPIdev;

  // use to update the dynamic ID, this is needed to prevent
  // the errors from switching the route in Next/js dynamic route
  useEffect(() => {
    // this sets the ID
    let prefix =
      process.env.NODE_ENV == "development"
        ? "http://localhost:3000/"
        : "https://www.guanzhiyan.com/";
    let pathname = prefix + "product/[id]";
    setDynamicID({
      id: props.data[0]._id,
      pathname,
    });
    return () => {
      setDynamicID(null);
    };
  }, []);
  function updateItems(id, amount) {
    for (let i = 0; i < items.length; i++) {
      // console.log("items is:", items[i]);
      if (items[i]._id === id) {
        console.log("found!");
        items[i].amount = (
          parseInt(items[i].amount) + parseInt(amount)
        ).toString();
        setItems(items);
        return;
      }
    }
    // if reach here, items not yet in the cart
    props.data[0].amount = amount;
    items.push(props.data[0]);
    setItems(items);
  }

  function increment() {
    if (parseInt(itemRef.current.value) !== parseInt(props.data[0].quantity)) {
      itemRef.current.value = (parseInt(itemRef.current.value) + 1).toString();
    }
  }
  function decrement() {
    if (itemRef.current.value !== "0") {
      itemRef.current.value = (parseInt(itemRef.current.value) - 1).toString();
    }
  }

  async function handleBuy() {
    // make sure the item doesn't exceed the max limit
    // also make sure the item is not 0
    if (itemRef.current.value === "0") {
      alert("Please make sure item quantity is at least 1");
    } else if (
      parseInt(itemRef.current.value) > parseInt(itemRef.current.max)
    ) {
      alert(
        `Please make sure the item quantity is no more than ${itemRef.current.max}`
      );
    } else if (itemRef.current.value[0] === "0") {
      alert("Please make sure the item quantity doesn't start with 0");
    } else {
      let body = {
        max: props.data[0].quantity,
        id: props.data[0]._id,
        amount: itemRef.current.value,
      };
      const curValue = itemRef.current.value;
      itemRef.current.value = "0";
      let res = await fetch(rootRoute + process.env.NEXT_PUBLIC_BACKENDSET, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
        },
        body: JSON.stringify(body),
      });
      if (res.status == 404) {
        res = await res.json();
        alert(res.error);
        return;
      } else if (res.status == 500) {
        //programmer's error
        console.log("500 error, programmer please check");
        return;
      }
      res = await res.json();
      updateItems(props.data[0]._id, curValue);
      toggleCart();
      console.log("Done adding to cart!");
    } // else
  }

  function renderTitle() {
    return language == 1
      ? props.data[0].imageTitleEn
      : language == 2
      ? props.data[0].imageTitle
      : props.data[0].imageTitleZhc;
  }

  function renderDesc() {
    return language == 1
      ? props.data[0].descriptionEn
      : language == 2
      ? props.data[0].description
      : props.data[0].descriptionZhc;
  }

  // const [renderReady, setRenderReady] = useState(false);

  // useEffect(() => {
  //   if (!router.isFallback) {
  //     setRenderReady(true);
  //   }
  // }, []);
  return (
    <>
      {!renderReady ? (
        <div>Loading...</div>
      ) : (
        <div className={styles.mainDiv}>
          <div className="flex justify-center">
            <div
              className={`${styles.shadowBox} border-2 border-solid border-slate-400 h-fit`}
            >
              <Image
                ref={imageRef}
                src={props.data[0].image}
                quality={100}
                // layout="fill"
                width={"500%"}
                height={"500%"}
                // objectFit="contain"
                alt={props.data[0].imageAlt}
                loading="lazy"
              ></Image>
            </div>
          </div>
          <div className={styles.textDiv}>
            <h2 className="text-6xl text-slate-800 items-end flex  rounded min-h-fit">
              {renderTitle()}
            </h2>
            <h3 className="text-4xl text-gray-500 items-center flex  rounded h-fit ">
              RM{parseInt(props.data[0].price).toFixed(2)}
            </h3>
            <hr className="border-black mr-[1em] my-2"></hr>
            <div className=" rounded flex items-center bg-slate-200 mt-2 justify-center">
              <div className="shadow-md flex bg-slate-800 w-fit m-[1em] justify-center items-center">
                <div
                  onClick={increment}
                  className="text-3xl px-[0.2em] hover:cursor-pointer text-white"
                >
                  +
                </div>
                <input
                  ref={itemRef}
                  id="qty"
                  type="number"
                  min="0"
                  max={props.data[0].quantity}
                  defaultValue="0"
                  step="1"
                  className="text-center
              text-xl
              w-[3em]
              h-[2.5em]
              text-slate-900
              bg-white bg-clip-padding
              border border-solid border-black
              transition
              ease-in-out 
              focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                />

                <div
                  onClick={decrement}
                  className="text-3xl px-[0.2em] hover:cursor-pointer text-white"
                >
                  -
                </div>
              </div>
              <button
                onClick={handleBuy}
                className="shadow-md text-xl bg-orange-600 text-white rounded p-2 text-center  hover:shadow-2xl hover:bg-orange-400  transition-all w-fit h-[2.5em]"
              >
                {t("cart")}
              </button>
            </div>
            <p className="text-xl text-slate-700 inline-block break-words rounded pt-[1em]">
              {renderDesc()}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export async function getStaticProps({ params, locale }) {
  console.log("fetching data in [id].js3");
  const ObjectId = require("mongodb").ObjectId;
  const { db } = await connectToDatabase();
  let data;
  // let notFound = false;
  try {
    data = await db
      .collection("product")
      .find({ _id: ObjectId(params.id.toString()) })
      .toArray();
    data = JSON.parse(JSON.stringify(data));

    if (data.length == 0) {
      console.log("not found");
      return {
        notFound: true,
      };
    }
  } catch (err) {
    console.log("Error in [id].js", err);
    return {
      notFound: true,
    };
  }

  console.log("fetching data in [id].js4");
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      data,
    },
    // notFound,
    revalidate: 5,
    // revalidate: 300,
  };
}
export async function getStaticPaths({ locales }) {
  const { db } = await connectToDatabase();
  let data = await db.collection("product").find().toArray();

  // can use cached data here...
  console.log("fetching data in [id].js");
  data = JSON.parse(JSON.stringify(data));

  /* For dynamic route, i18next need to do this */
  // credit: https://stackoverflow.com/questions/70596939/how-to-generate-dynamic-paths-for-non-default-locales-in-next-js
  const paths = data
    .map((item) =>
      locales.map((locale) => ({
        params: { id: item._id.toString() },
        locale, // Pass locale here
      }))
    )
    .flat(); // Flatten array to avoid nested arrays
  console.log("fetching data in [id]2.js");
  return {
    paths,
    fallback: true,
  };
}
