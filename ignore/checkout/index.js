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

const Checkout = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [stripePromise, setStripePromise] = useState(null);
  const [items, setItems] = useState(null);
  const [total, setTotal] = useState(0);
  const [allowClick, setAllowClick] = useState(true);
  useEffect(() => {
    async function fetchStripe() {
      const cur = await loadStripe(
        process.env.NEXT_PUBLIC_PUBLISHABLE_KEY_TEST
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
        "Content-Type": "application/json",
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
        <div className="flex flex-col m-[2em] rounded text-slate-100 bg-slate-600 items-center p-5">
          <div className="flex flex-col items-center h-[80vh] justify-center">
            <LoadingIcons.Oval height={400} width={400} />
            <h2 className="mt-[1em] text-4xl">Please wait...</h2>
          </div>
        </div>
      ) : (
        <>
          {items.length == 0 ? (
            <div className="flex flex-col m-[2em] rounded text-slate-100 bg-slate-600 items-center">
              <div>
                <Link href="\" locale={router.locale} passHref>
                  <button className="text-center text-4xl p-2 hover:bg-slate-300 transition-all border-black border-solid border rounded shadow-xl mt-[1em] bg-slate-100 h-fit w-fit text-slate-800">
                    ↩ Home
                  </button>
                </Link>
              </div>
              <div className="flex flex-col items-center h-[80vh] justify-center">
                <AiFillFrown className="" size={400}></AiFillFrown>
                <h2 className=" text-4xl">Oops! Your cart is empty!</h2>
                <h2 className=" text-4xl">
                  Try adding some items and come back!
                </h2>
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
              <div className="min-h-[90vh]  m-[2em] rounded flex justify-between items-center px-[2em] font-sans text-slate-600">
                <div
                  className={`${styles.shadow} border-r-2 border-slate-600 border-solid w-full min-h-[90vh]  h-fit justify-center flex items-center`}
                >
                  <div className=" flex flex-col bg-slate-50 shadow-2xl w-[40vw] min-h-[70vh] p-[1em] rounded ">
                    <div className="flex flex-row items-start pb-3">
                      <div className="border-black border-solid shadow-md z-99 rounded-full w-[2.5em] h-[2.5em] relative">
                        <Image
                          alt="gzy-logo"
                          className=" h-6 z-0 rounded-full"
                          src="/logo/logo_remastered_800.jpg "
                          // width={70}
                          // height={70}
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                      <h1 className="text-2xl pl-3">Guan Zhi Yan Trading</h1>
                    </div>
                    <h2 className="text-5xl pb-3 font-semibold">
                      RM {parseFloat(total).toFixed(2)}
                    </h2>
                    <hr className="border-t-4 pb-3"></hr>
                    <h2 className="text-3xl pb-1 font-medium">
                      Product Summary
                    </h2>
                    {items.map((item) => {
                      return <CartItemCheckout item={item}></CartItemCheckout>;
                    })}
                  </div>
                </div>
                {/* <div className="min-h-[90vh] bg-black w-1 shadow-inner relative"></div> */}
                <div className=" w-full min-h-[90vh]  h-fit  justify-center flex items-center">
                  <div className="bg-slate-50 shadow-2xl">
                    <Elements stripe={stripePromise}>
                      <CheckoutForm setAllowClick={setAllowClick} />
                    </Elements>
                  </div>
                </div>
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
