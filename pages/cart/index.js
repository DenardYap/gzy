import React, { useContext, useRef, useEffect } from "react";
import useState from "react-usestateref";
import nextI18nextConfig from "../../next-i18next.config";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import CartItem from "../../components/CartItem";
import Link from "next/link";
import { useRouter } from "next/router";
import { AiFillFrown } from "react-icons/ai";
import { Bars } from "react-loading-icons";
import LoadingIcons from "react-loading-icons";
import Swal from "sweetalert2";

const Cart = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [data, setData] = useState(null);
  const [total, setTotal] = useState(0.0);
  const [allowClick, setAllowClick, allowClickRef] = useState(true);
  const rootRoute =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_productAPIpro
      : process.env.NEXT_PUBLIC_productAPIdev;

  const paymentRoute =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_CHECKOUT_APIpro
      : process.env.NEXT_PUBLIC_CHECKOUT_APIdev;
  async function handleCheckout() {
    setAllowClick(false);
    await fetch(paymentRoute, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
      },
    })
      .then((res) => {
        if (res.ok) return res.json();
        alert("Payment failed, please rety, or contact the seller!");
        setAllowClick(true);
        Swal.fire({
          title: t("oops"),
          text: t("error_text"),
          icon: "error",
          color: "#1e293b",
          // showConfirmButton: false,
          confirmButtonColor: "#1e293b",
        });
        return res.json().then((json) => Promise.reject(json));
      })
      .then(({ url }) => {
        window.location = url;
      })
      .catch((e) => {
        alert(e.error);
        console.log(e.error);
      });
  }

  useEffect(() => {
    async function fetchData() {
      let res = await fetch(rootRoute + process.env.NEXT_PUBLIC_BACKENDGET, {
        method: "GET",
        headers: {
          Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,

          "Content-Type": "application/json",
          "Acess-control-allow-origin": "https://www.guanzhiyan.com",
        },
      });
      if (res.status !== 200) {
        // todo
        console.log("Error in Cart.js with a status code of", res.status);
      }
      res = await res.json();

      setData(res.data);
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
      {data == null ? (
        <div className="flex flex-col m-[2em] rounded text-slate-100 bg-slate-600 items-center p-5">
          <div className="flex flex-col items-center h-[80vh] justify-center">
            <LoadingIcons.Oval height={400} width={400} />
            <h2 className="mt-[1em] text-4xl">{t("please_wait")}</h2>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col m-[2em] rounded text-slate-100 bg-slate-600 items-center">
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
          {allowClick ? (
            <></>
          ) : (
            <div className="w-full h-full top-0 right-0 bottom-0 left-0 bg-black opacity-50	fixed z-10 flex justify-center items-center">
              <LoadingIcons.Oval height={300} width={300} />
            </div>
          )}
          <div className="flex justify-between items-center text-center pt-5 px-[2em]">
            <Link href="\" locale={router.locale} passHref>
              <button className="text-2xl p-2 rounded shadow-xl bg-black h-fit w-fit text-slate-100 hover:bg-slate-600 transition-all">
                ↩ {t("home")}
              </button>
            </Link>
            <h2 className="text-3xl underline pl-[2.5em]"> {t("your_cart")}</h2>
            <div className="items-top text-2xl p-2 rounded shadow-xl bg-black h-fit w-fit text-slate-100">
              <h2>
                {t("items_cart")}: {data.length}
              </h2>
            </div>
          </div>
          <div className="flex-row ">
            {data.map((item) => {
              return (
                <CartItem
                  key={item._id}
                  setData={setData}
                  oriData={data}
                  data={item}
                  allowClick={allowClick}
                  setAllowClick={setAllowClick}
                  allowClickRef={allowClickRef}
                  total={total}
                  setTotal={setTotal}
                ></CartItem>
              );
            })}
          </div>

          <div className="flex-col my-[2em] bg-slate-800 text-white text-3xl justify-center mx-auto w-fit text-center items-center rounded p-4">
            <h2>
              {t("total_text1") +
                "(" +
                data.length +
                t("total_text2") +
                ")" +
                `: RM${parseInt(total).toFixed(2)}`}
            </h2>
            <button
              onClick={handleCheckout}
              className="p-2 bg-orange-600 text-white rounded text-3xl mt-5 w-[100%] hover:bg-orange-400 transition-all "
            >
              {t("checkout")}
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default Cart;

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      // Will be passed to the page component as props
    },
  };
}
