import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Item from "../components/Item";
import { useEffect, useRef } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import nextI18nextConfig from "../next-i18next.config";
import { connectToDatabase } from "../util/mongodb";

export default function Home(props) {
  // console.log(props);
  <Head>
    <title>Next App</title>
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
        {/* TODO: for now I am just hardcoding the items, gonna import it
                  later on with a real database + a forEach or smtg */}
        <div className={styles.itemList}>
          {props.data.map((item) => {
            return (
              <Item
                url={"data:image/jpeg;base64," + item.image.toString("base64")}
                title={item.imageTitle}
                max_={item.quantity}
              ></Item>
            );
          })}
          {/* <Item url="/images/tiao.jpg" title="Bird's Nest 100g dry"></Item>
          <Item
            url="/images/100ml.jpg"
            title="Delicious 100ml Bird's Nest"
          ></Item>
          <Item url="/images/200zai.jpg" title="Bird's Nest 200g dry"></Item>
          <Item url="/images/lihe1.png" title="CNY gift box"></Item>
          <Item
            url="/images/600ml.png"
            title="Delicious 100ml Bird's Nest x6"
          ></Item>
          <Item
            url="/images/120mlx3.jpg"
            title="Compressed Delicious Bird's Nest x3"
          ></Item>
          <Item
            url="/images/compressed1.jpg"
            title="Compressed Fresh Bird's Nest"
          ></Item>
          <Item
            url="/images/datiao100g.jpg"
            title="Large Dry Bird's Nest 100g"
          ></Item>
          <Item url="/images/tiao30g.jpg" title="Bird's Nest 30g Dry"></Item> */}
          <div className={styles.masker}> {t("show_more")} </div>
        </div>
      </div>
    </div>
  );
}

// have to do this every single page :/
export async function getStaticProps({ locale }) {
  const { db } = await connectToDatabase();
  // find everything for now, might consider split rendering in the future
  // but we only have so few items for now it's fine to just load them all I guess
  let data = await db.collection("product").find().toArray();
  data = JSON.parse(JSON.stringify(data));

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      data,

      // Will be passed to the page component as props
    },
    revalidate: 15,
  };
}
