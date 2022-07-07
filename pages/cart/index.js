import React, { useContext, useRef, useEffect } from "react";
import useState from "react-usestateref";
import nextI18nextConfig from "../../next-i18next.config";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import CartItem from "../../components/CartItem";
import Link from "next/link";
import { useRouter } from "next/router";
import { AiFillFrown } from "react-icons/ai";

const Cart = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0.0);
  const [toggle, setToggle] = useState(false);
  const [allowClick, setAllowClick, allowClickRef] = useState(true);

  const rootRoute =
    process.env.NODE_ENV == "production"
      ? process.env.NEXT_PUBLIC_productAPIpro
      : process.env.NEXT_PUBLIC_productAPIdev;

  function rerender() {
    toggle ? setToggle(false) : setToggle(true);
  }
  useEffect(() => {
    async function fetchData() {
      let res = await fetch(rootRoute + process.env.NEXT_PUBLIC_BACKENDGET, {
        method: "GET",
        "Content-Type": "application/json",
      });
      if (res.status === "404" || res.status === "500") {
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
  }, [toggle]);
  return (
    <>
      {data.length === 0 ? (
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
            <h2 className=" text-4xl">Try adding some items and come back!</h2>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center text-center pt-5 px-[2em]">
            <Link href="\" locale={router.locale} passHref>
              <button className="text-2xl p-2 rounded shadow-xl bg-black h-fit w-fit text-slate-100 hover:bg-slate-600 transition-all">
                ↩ Home
              </button>
            </Link>
            <h2 className="text-3xl underline pl-[2.5em]">
              {" "}
              Your Shopping Cart
            </h2>
            <div className="items-top text-2xl p-2 rounded shadow-xl bg-black h-fit w-fit text-slate-100">
              <h2>Items in cart: {data.length}</h2>
            </div>
          </div>
          <div className="flex-row">
            {data.map((item) => {
              return (
                <CartItem
                  key={item._id}
                  setToggle={rerender}
                  data={item}
                  allowClick={allowClick}
                  setAllowClick={setAllowClick}
                  allowClickRef={allowClickRef}
                ></CartItem>
              );
            })}
          </div>

          <div className="flex-col my-[2em] bg-slate-800 text-white text-3xl justify-center mx-auto w-fit text-center items-center rounded p-4">
            <h2>
              {`Total (${data.length} items): RM${parseInt(total).toFixed(2)}`}
            </h2>
            <button className="p-2 bg-orange-600 text-white rounded text-3xl mt-5 w-[100%] hover:bg-orange-400 transition-all ">
              Checkout
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
