import React, { useContext, useState, useRef, useEffect } from "react";
import nextI18nextConfig from "../../next-i18next.config";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CartItemCheckout from "../../components/CartItemCheckout";
import styles from "../../styles/CartItemCheckout.module.css";
import Image from "next/image";
import LoadingIcons from "react-loading-icons";
import { AiFillFrown } from "react-icons/ai";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import CheckoutForm from "../../components/CheckoutForm";

/** TODO
 *  1) Media queries
 *  2) Backend
 *  3) Different language
 *  4) Refine design
 *  5) Add shipping fees based on area
 */
const Checkout = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [stripePromise, setStripePromise] = useState(null);
  const [items, setItems] = useState(null);
  const [total, setTotal] = useState(0);
  const [allowClick, setAllowClick] = useState(true);
  const [shipFee, setShipFee] = useState(5);
  useEffect(() => {
    async function fetchStripe() {
      const cur = await loadStripe(
        process.env.NEXT_PUBLIC_PUBLISHABLE_KEY
      );
      setStripePromise(cur);
    }
    fetchStripe();
  }, []);
  console.log("Stripe promise is:", stripePromise);

  useEffect(() => {
    async function fetchData() {
      const fetchRoute =
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_productAPIpro
          : process.env.NEXT_PUBLIC_productAPIdev;

      let res = await fetch(fetchRoute + process.env.NEXT_PUBLIC_BACKENDGET, {
        method: "GET",
        headers: {
          Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
          "Content-Type": "application/json",
        },
        // "Acess-control-allow-origin": "https://www.guanzhiyan.com",
      });
      if (res.status !== 200) {
        // todo
        console.log("Error in Cart.js with a status code of", res.status);
      }
      res = await res.json();

      setItems(res.data);
      let curSum = 0;
      res.data.forEach((item) => {
        curSum += parseInt(item.price) * parseInt(item.amount);
      });
      setTotal(curSum);
    }
    fetchData();
  }, []);

  return (
    <>
      {stripePromise == null || items == null ? (
        <div className="flex flex-col mini:m-[1em] laptop:m-[2em] rounded text-slate-100 bg-slate-600 items-center p-5">
          <div className="flex flex-col items-center h-[80vh] justify-center">
            <LoadingIcons.Oval className="h-[80%] w-[80%]" />
            <h2 className="mt-[1em] mini:text-xl phone:text-2xl tablet:text-3xl laptop:text-4xl desktop:text-5xl">
              {t("please_wait")}
            </h2>
          </div>
        </div>
      ) : (
        <>
          {items.length == 0 ? (
            <div className="flex flex-col m-[2em] rounded-sm text-slate-100 bg-slate-600 items-center">
              <div>
                <Link href="\" locale={router.locale} passHref>
                  <button className="text-center text-4xl p-2 hover:bg-slate-300 transition-all border-black border-solid border rounded shadow-xl mt-[1em] bg-slate-100 h-fit w-fit text-slate-800">
                    ↩ {t("home")}
                  </button>
                </Link>
              </div>
              <div className="flex flex-col items-center h-[80vh] justify-center">
                <AiFillFrown className="" size={400}></AiFillFrown>
                <h2 className=" text-4xl">{t("cart_empty")}</h2>
                <h2 className=" text-4xl">{t("cart_empty_text")}</h2>
              </div>
            </div>
          ) : (
            <>
              {" "}
              {allowClick ? (
                <></>
              ) : (
                <div className="w-full h-full top-0 right-0 bottom-0 left-0 bg-black opacity-50	fixed z-10 flex justify-center items-center">
                  <LoadingIcons.Oval height={300} width={300} />
                </div>
              )}
              <div className="relative flex flex-col justify-between">
                <div>
                  <Link href="\" locale={router.locale} passHref>
                    <button className="absolute  top-0 bottom-0 mini:left-[1em] laptop:left-[3.5em] right-0 text-center text-2xl p-2 hover:bg-slate-300 transition-all border-slate-600  border-solid border rounded shadow-xl mt-[1em] bg-slate-100 h-fit w-fit text-slate-600">
                      ↩ {t("home")}
                    </button>
                  </Link>
                </div>
                <div className="min-h-[60vh] mb-[2em] mini:mt-[5em]   rounded-sm flex laptop:flex-row mini:flex-col justify-between mini:items-center laptop:items-start mini:px-0 laptop:px-[2em] font-sans text-slate-600">
                  <div
                    className={` mini:border-r-0 laptop:pb-0 mini:pb-[3em] mini:border-b-2 laptop:border-b-0 laptop:border-r-2 border-slate-600 border-solid min:w-fit laptop:w-full min-h-[60vh]  h-fit justify-center flex items-start`}
                  >
                    <div
                      className={`${styles.shadowBox} flex flex-col bg-slate-50 mini:w-[90vw] laptop:w-[40vw] mini:min-h-[60vh]  laptop:min-h-[70vh] p-[1em] rounded-sm`}
                    >
                      <div className="flex flex-row items-start pb-3">
                        <div className="border-black border-solid  z-99 rounded-sm-full w-[2.5em] h-[2.5em] relative">
                          <Image
                            priority={true}
                            alt="Guan Zhi Yan Bird Nest"
                            className=" h-6 z-0 rounded-full shadow-md"
                            src="/logo/logo_remastered_800.jpg "
                            // width={70}
                            // height={70}
                            layout="fill"
                            objectFit="contain"
                          />
                        </div>
                        <h1 className="mini:text-xl tablet:text-2xl pl-3">
                          {t("gzy_trading")}
                        </h1>
                      </div>
                      <h2 className="mini:text-4xl tablet:text-5xl pb-3 font-semibold">
                        RM{" "}
                        {(parseFloat(total) + parseFloat(shipFee)).toFixed(2)}
                      </h2>
                      <hr className="border-t-4 pb-3"></hr>
                      <h2 className="mini:text-2xl tablet:text-3xl pb-1 font-medium">
                        {t("product_summary")}
                      </h2>
                      {items.map((item) => {
                        return (
                          <CartItemCheckout
                            key={item._id}
                            item={item}
                          ></CartItemCheckout>
                        );
                      })}
                      <h2 className="tablet:text">
                        {t("shipping_fee")}: RM{parseFloat(shipFee).toFixed(2)}
                      </h2>
                    </div>
                  </div>
                  {/* <div className="min-h-[80vh] bg-black w-1 shadow-inner relative"></div> */}
                  <div className="min:w-fit laptop:w-full min-h-[80vh] laptop:pt-0 mini:pt-[3em] justify-center flex items-start">
                    <div className={`${styles.shadowBox} bg-slate-50`}>
                      <Elements stripe={stripePromise}>
                        <CheckoutForm
                          setShipFee={setShipFee}
                          setAllowClick={setAllowClick}
                        />
                      </Elements>
                    </div>
                  </div>
                </div>
                <h2 className="mx-[1em] text-center text-slate-500">
                  {t("disclaimer_warn")}
                </h2>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default Checkout;

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      // Will be passed to the page component as props
    },
  };
}
