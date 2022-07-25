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
  /* 1 : english, 2 : chinese, 3 : traditioanl chinese */
  let language;
  const [allowClick, setAllowClick] = useState(true);

  const dot1 = useRef();
  const dot2 = useRef();
  const dot3 = useRef();
  const dots = [dot1, dot2, dot3];
  /**To be changed to loading image from CDN/Database */
  const imageList = [
    `url("https://${process.env.NEXT_PUBLIC_cloudFrontURL}/main_aimg1.jpg")`,
    `url("https://${process.env.NEXT_PUBLIC_cloudFrontURL}/main_aimg2.jpg")`,
    `url("https://${process.env.NEXT_PUBLIC_cloudFrontURL}/main_aimg3.jpg")`,
  ];
  const [curSlide, setCurSlide] = useState(1);
  // let slideShowNum = 3;

  let count = 0;
  let itemsToDisplay = 3;
  let slideTimer;
  const [buttonClicked, setButtonClicked] = useState(false);

  function toggleButton() {
    buttonClicked ? setButtonClicked(false) : setButtonClicked(true);
  }

  function handleSlide(num) {
    // reset the timer here
    clearInterval(slideTimer);
    if (num == 0) {
      setCurSlide(3);
      num = 3;
    } else if (num == 4) {
      setCurSlide(1);
      num = 1;
    } else {
      setCurSlide(num);
    }
    toggleButton();
    console.log(num);
  }

  useEffect(() => {
    console.log("triggered:", curSlide);
    for (let i = 0; i < dots.length; i++) {
      dots[i].current.className = dots[i].current.className.replace(
        " bg-black",
        " bg-white"
      );
    }
    /**Change color */
    dots[curSlide - 1].current.className = dots[
      curSlide - 1
    ].current.className.replace(" bg-white", " bg-black");

    /**Change image */
    mainImg.current.style.backgroundImage = imageList[curSlide - 1];
    mainImg.current.style.backgroundPositionY = -window.scrollY * 0.7 + "px";
    console.log(mainImg.current.style);
  }, [curSlide]);
  const router = useRouter();
  const { t } = useTranslation("common");
  const mainImg = useRef();

  useEffect(() => {
    function handleScroll() {
      let offset = window.scrollY;
      mainImg.current.style.backgroundPositionY = -offset * 0.7 + "px";
      // remember to add media query here for lower scrolling rate or smaller vh
    }
    window.addEventListener("scroll", handleScroll);

    language = window.location.href.indexOf("en")
      ? 1
      : window.location.href.indexOf("zhc")
      ? 3
      : 2;
    console.log("User came from:", document.referrer);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  /**Interval effect to slide the window  */
  useEffect(() => {
    // create a interval and get the id
    // slideTimer =
    //   !slideTimer &&
    //   setInterval(() => {
    //     setCurSlide((prevSlide) => prevSlide + 1);
    //     console.log("Cur slide is", curSlide);
    //     handleSlide(curSlide);
    //   }, 3000);
    slideTimer = window.setInterval(() => {
      setCurSlide((prev) => {
        return (prev % 3) + 1;
      }); // <-- Change this line!
    }, 5000);
    // clear out the interval using the id when unmounting the component
    return () => clearInterval(slideTimer);
  }, [buttonClicked]);
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

      <div key={curSlide} className={styles.container} ref={mainImg}>
        <div className={styles.mainContainer}>
          <div className={styles.subContainers}></div>

          <div className={`${styles.subContainers} items-center`}>
            <div className="flex justify-start w-full">
              <div
                onClick={() => handleSlide(curSlide - 1)}
                className="cursor-pointer ml-[1.5em] hover:bg-slate-50 hover:text-black w-fit p-1 h-fit transition-all rounded"
              >
                <h2 className=""> &#10094; </h2>
              </div>
            </div>

            <div></div>
            <div className="flex justify-end w-full">
              <div className="cursor-pointer mr-[1.5em] hover:bg-slate-50 hover:text-black w-fit p-1 h-fit transition-all rounded">
                <h2 onClick={() => handleSlide(curSlide + 1)} className="">
                  {" "}
                  &#10095;
                </h2>
              </div>
            </div>
          </div>

          <div className={`${styles.subContainers} items-end pb-2`}>
            <div></div>
            <div>
              <span
                className={`${styles.dot}  bg-black`}
                onClick={() => handleSlide(1)}
                ref={dot1}
              ></span>
              <span
                className={`${styles.dot}  bg-black`}
                onClick={() => handleSlide(2)}
                ref={dot2}
              ></span>
              <span
                className={`${styles.dot}  bg-black`}
                onClick={() => handleSlide(3)}
                ref={dot3}
              ></span>
            </div>
            <div></div>
          </div>
        </div>
      </div>
      <div className="flex flex-row  my-[2em] mx-[2em] text-center items-center text-2xl">
        {/* <div className="text-center font-bold text-[4em] underline">
          <h2 id="product">{t("guan zhi yan")}</h2>
        </div> */}
        <div
          className={`${styles.shadowBox} px-4 py-5  w-[61%] min-h-[65vh] mx-5 relative flex justify-start items-center`}
        >
          <Image
            alt="birdnest bottle"
            className=""
            src="/images/Snapseed 5.jpg"
            layout="fill"
            objectFit="cover"
          ></Image>
        </div>

        <div
          className={`${styles.shadowBox} flex flex-col justify-between py-5 px-[2em] bg-slate-100 mx-5 w-[80%] min-h-[65vh] shadow-xl`}
        >
          <h3 className="underline text-5xl pb-5">
            <b>{t("main_page_title")}</b>
          </h3>
          <div className="flex flex-row  justify-center items-center text-center">
            <p>{t("about_us")}</p>
          </div>

          <div className="h-[100%] flex justify-between items-center  px-2">
            <Link href="/about" locale={router.locale}>
              <a className="hover:text-3xl cursor-pointer underline hover:text-red-400 transition-all text-orange-400">
                {t("learn")}
              </a>
            </Link>
            <Link href="/product" locale={router.locale}>
              <a className="hover:text-3xl cursor-pointer underline hover:text-red-400 transition-all text-orange-400">
                {t("explore")}
              </a>
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`${styles.shadowBox} flex-col bg-slate-100 my-[5em] mx-[2em] `}
      >
        <div className="text-center font-bold text-[4em] underline">
          <h2 id="product">{t("top_sales")}</h2>
        </div>
        <div className={styles.itemList}>
          {props.data.map((item) => {
            if (count != itemsToDisplay) {
              if (item.quantity === "0") {
                // Render sold out item last
                soldOutItem.push(item);
              } else {
                count++;
                return (
                  <Item
                    oriData={item}
                    key={item._id}
                    setAllowClick={setAllowClick}
                  ></Item>
                );
              }
            }
          })}
        </div>
      </div>
      <div
        className={`flex flex-row justify-center items-center my-[3em] mx-[2em]`}
      >
        {/* <div
          className={`${styles.shadowBox} flex flex-col justify-between py-5 px-[2em] bg-slate-100 mx-5 shadow-xl`}
        >
          
        </div> */}

        <div
          className={`${styles.videoGridOverview} text-left justify-center items-center text-2xl`}
        >
          <div
            className={`${styles.shadowBox} flex flex-col justify-between py-5 pl-[1em] pr-[3em] bg-slate-200 mx-10 w-[100%] min-h-[45vh]`}
          >
            <h3 className="text-5xl underline">{t("visit_factory_title")}</h3>
            <h3 className="text-3xl">{t("visit_factory_text")}</h3>
            <Link href="/factory" locale={router.locale}>
              <a className="text-right text-2xl pr-[2em] hover:text-3xl cursor-pointer underline hover:text-red-400 transition-all text-orange-400">
                {t("learn")}
              </a>
            </Link>
          </div>
          <div
            className={`${styles.shadowBox} min-h-[65vh] w-[36vw] relative relative right-[4em] px-3 py-2 rounded bg-slate-100`}
          >
            <Image
              alt="factory picture"
              src="/images/factory1.jpg"
              layout="fill"
              objectFit="cover"
              // className={` `}
            ></Image>
          </div>
          {/* <video
            className={`${styles.shadowBox} relative right-[4em] px-3 py-2 rounded bg-slate-100`}
            width="400"
            height="320"
            controls
          >
            <source src="/video/factory.mp4" type="video/mp4" />
          </video> */}
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
    revalidate: 30,
    // revalidate: 300,
  };
}
