import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Item from "../components/Item";
import { useContext, useEffect, useRef } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import nextI18nextConfig from "../next-i18next.config";
import { connectToDatabase } from "../util/mongodb";
import { createClient } from "redis";
import { cartContext } from "./_app";

export default function Home(props) {
  <Head>
    <title>Guan Zhi Yan Bird's Nest</title>
    <link rel="icon" href="/favicon.ico" />
  </Head>;

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

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div>
      <div className={styles.container} ref={mainImg}>
        <h2> {t("main_text")}</h2>
        <h3> {t("main_text2")}</h3>
      </div>
      <div className="flex-col bg-slate-100 my-[1.25em] mx-[2em]">
        <div className="text-center font-bold text-[4em] underline">
          <h2 id="product">{t("products")}</h2>
        </div>
        <div className={styles.itemList}>
          {props.data.map((item) => {
            return (
              <Item
                key={item._id}
                id={item._id}
                prices={item.price}
                productID={item.productID}
                url={item.image}
                title={item.imageTitle}
                max_={item.quantity}
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
  const client = createClient({
    url: process.env.NEXT_PUBLIC_REDIS_ENDPOINT,
    password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  let data;
  try {
    data = await client.get("mainCache");
    // get all item
  } catch (error) {
    // try
    console.log("Redis get error", error);
    // client.quit(); //closing client
    /*might need to do more here*/
  } //catch
  if (data == null) {
    //empty
    console.log("cache miss");
    const { db } = await connectToDatabase();
    data = await db.collection("product").find().toArray();
    data = JSON.parse(JSON.stringify(data));
    // add an amount key to the list for later
    data = data.map((item) => ({ ...item, amount: 0 }));
    data = JSON.stringify(data);
    await client.set("mainCache", data);
  } //if
  data = JSON.parse(data);

  console.log("Closing client connection...");
  await client.quit();
  console.log("Sending data to front end...");

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      data,
      // Will be passed to the page component as props
    },
    // revalidate: 15,
  };
}
