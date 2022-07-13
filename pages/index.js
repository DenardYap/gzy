import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Item from "../components/Item";
import { useContext, useEffect, useRef, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import nextI18nextConfig from "../next-i18next.config";
import { connectToDatabase } from "../util/mongodb";
import { createClient } from "redis";
import { cartContext } from "./_app";
import LoadingIcons from "react-loading-icons";

export default function Home(props) {
  <Head>
    <title>Guan Zhi Yan Bird&apos;s Nest</title>
    <link rel="icon" href="/favicon.ico" />
  </Head>;
  const [allowClick, setAllowClick] = useState(true);

  const router = useRouter();
  const { t } = useTranslation("common");
  const mainImg = useRef();
  useEffect(() => {
    const mainImgCur = mainImg.current;
    function handleScroll() {
      let offset = window.scrollY;
      mainImgCur.style.backgroundPositionY = -offset * 0.7 + "px";
      // remember to add media query here for lower scrolling rate or smaller vh
    }
    window.addEventListener("scroll", handleScroll);

    console.log("User came from:", document.referrer);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  let soldOutItem = [];
  return (
    <div className="">
      {/* layover of the whole page once the button is pressed */}
      {allowClick ? (
        <></>
      ) : (
        <div className="w-full h-full top-0 right-0 bottom-0 left-0 bg-black opacity-50	fixed z-10 flex justify-center items-center">
          <LoadingIcons.Oval height={300} width={300} />
        </div>
      )}

      <div className={styles.container} ref={mainImg}>
        <h2> {t("main_text")}</h2>
        <h3> {t("main_text2")}</h3>
      </div>
      <div className="flex-col bg-orange-50 my-[1.25em] mx-[2em]">
        <div className="text-center font-bold text-[4em] underline">
          <h2 id="product">{t("products")}</h2>
        </div>
        <div className={styles.itemList}>
          {props.data.map((item) => {
            if (item.quantity === "0") {
              // Render sold out item last
              soldOutItem.push(item);
            } else {
              return (
                <Item
                  oriData={item}
                  key={item._id}
                  setAllowClick={setAllowClick}
                ></Item>
              );
            }
          })}
          {soldOutItem.map((item) => {
            return (
              <Item
                oriData={item}
                key={item._id}
                setAllowClick={setAllowClick}
              ></Item>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// have to do this every single page :/
export async function getStaticProps({ locale }) {
  /*What I am doing
  
  Whenever user lands on product/item page, we need to load items from 
  database and display to the user, we might as well just cache the data
  for future reference such as shoppign cart and checkout page
  WE can do this is also because we dont have a lot of products, caching all
  of them only costs a few KBs, even less than that

  Using hashes, key will be ID, and field will be name and all that
  */
  const client = createClient({
    url: process.env.NEXT_PUBLIC_REDIS_ENDPOINT,
    password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  let mainData;
  let data = [];

  try {
    mainData = await client.hGetAll("mainCart");
  } catch (error) {
    console.log("Error in fetching data in index.js", error);
  }

  async function fetchData() {
    if (Object.keys(mainData).length == 0) {
      // cache main db
      console.log("cache miss");
      const { db } = await connectToDatabase();
      data = await db.collection("product").find().toArray();
      data = await JSON.parse(JSON.stringify(data)); // this will return a list of items to us
      // fetch the data from db and cache it
      // data = data.map((item) => ({ ...item, amount: 0 }));
      data.forEach(async (item) => {
        await client.hSet("mainCart", item._id, JSON.stringify(item));
      });
    } else {
      console.log("cache hit");
      Object.keys(mainData).forEach(async (_id) => {
        // push each item inside our data
        data.push(JSON.parse(mainData[_id]));
      });
    }
  }
  await fetchData();
  console.log("Closing client connection...");
  await client.quit(); // quit

  console.log("Sending data to frontend...");

  console.log("updated...");
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      data,
      // Will be passed to the page component as props
    },
    // revalidate: 15,
  };
}
