import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Item from "../components/Item";
import { useEffect, useRef } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Link from "next/link";

// TODO: Fix image starts at weird position after refresh
export default function Home() {
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
          <h2>{t("products")}</h2>
        </div>
        <div className={styles.itemList}>
          <Item url="/images/tiao.jpg" title="Bird's Nest 100g dry"></Item>
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
          <Item url="/images/tiao30g.jpg" title="Bird's Nest 30g Dry"></Item>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      // Will be passed to the page component as props
    },
  };
}
