import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../../next-i18next.config";
import { connectToDatabase } from "../../util/mongodb";
import Image from "next/image";
import { cartContext } from "../_app";
import { useContext, useRef, useState, useEffect } from "react";
import { AiOutlineEllipsis, AiOutlineMinus } from "react-icons/ai";
import { FaShoppingCart } from "react-icons/fa";
import { FiPackage } from "react-icons/fi";
import { MdLocalShipping } from "react-icons/md";
import { BiHomeSmile } from "react-icons/bi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import OrderItem from "../../components/OrderItem";
import styles from "../../styles/OrderItem.module.css";
const Order = (props) => {
  const [status, setStatus] = useState(1);
  const [data, setData] = useState(null);
  const [date, setDate] = useState(null);
  const orderRoute =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_CHECKOUT_ORDERpro
      : process.env.NEXT_PUBLIC_CHECKOUT_ORDERdev;
  useEffect(() => {
    (async () => {
      let res = await fetch(orderRoute + props.id, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
        },
      });
      if (!res.ok) {
        console.log("there's a problem fetching orders in order/[id].js");
        console.log(res);
      } else {
        res = await res.json();
        setData(res.data);
        setDate(new Date(res.data.timestamp));
        setStatus(parseInt(res.data.status));
        console.log("data is", res.data);
      }
    })();
  }, []);

  function formatDate() {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;

    return (
      date.getDate() +
      "/" +
      (date.getMonth() + 1) +
      "/" +
      date.getFullYear() +
      " - " +
      strTime
    );
  }
  return (
    <div>
      <div className="mt-10 mb-2 mx-[1em] underline">
        {date ? <h2> Order placed on {formatDate()}</h2> : <></>}
      </div>
      <div className="flex flex-col rounded bg-slate-200 text-gray-400 p-5 mx-[1em] mb-10 min-h-[75vh] ">
        <h2 className="text-4xl  mb-3   text-slate-800">DELIVERY STATUS</h2>
        <div className="flex flex-row justify-around text-9xl bg-slate-50 p-5 rounded shadow-2xl">
          <div className="flex flex-col  items-center text-center">
            <FaShoppingCart className="text-green-400   "></FaShoppingCart>
            <h2 className="text-xl text-green-400 font-semibold">
              Order Confirm
            </h2>
          </div>
          {status >= 2 ? (
            <AiOutlineMinus className="text-green-400"></AiOutlineMinus>
          ) : (
            <AiOutlineEllipsis></AiOutlineEllipsis>
          )}

          <div className="flex flex-col items-center text-center">
            {status >= 2 ? (
              <>
                <FiPackage className="text-green-400   "></FiPackage>
                <h2 className="text-xl text-green-400 font-semibold">
                  Packaged
                </h2>
              </>
            ) : (
              <>
                <FiPackage></FiPackage>
                <h2 className="text-xl  font-semibold">Packaging</h2>
              </>
            )}
          </div>
          {status >= 3 ? (
            <AiOutlineMinus className="text-green-400"></AiOutlineMinus>
          ) : (
            <AiOutlineEllipsis></AiOutlineEllipsis>
          )}

          <div className="flex flex-col items-center text-center">
            {status >= 3 ? (
              <>
                <MdLocalShipping className="text-green-400   "></MdLocalShipping>
                <h2 className="text-xl text-green-400 font-semibold">
                  Shipped
                </h2>
              </>
            ) : (
              <>
                <MdLocalShipping></MdLocalShipping>
                <h2 className="text-xl  font-semibold">Shipped</h2>
              </>
            )}
          </div>

          {status >= 4 ? (
            <AiOutlineMinus className="text-green-400"></AiOutlineMinus>
          ) : (
            <AiOutlineEllipsis></AiOutlineEllipsis>
          )}
          <div className="flex flex-col items-center text-center">
            {status >= 4 ? (
              <>
                <BiHomeSmile className="text-green-400   "></BiHomeSmile>
                <h2 className="text-xl text-green-400 font-semibold">
                  Delivered
                </h2>
              </>
            ) : (
              <>
                <BiHomeSmile></BiHomeSmile>
                <h2 className="text-xl  font-semibold">Delivered</h2>
              </>
            )}
          </div>
        </div>

        <h2 className="text-4xl underline  mb-3 my-10  text-slate-800">
          YOUR ORDERS
        </h2>
        <div className="flex flex-col">
          <div className={styles.topGrid}>
            <h3>Image</h3>
            <h3>Name</h3>
            <h3>Quantity</h3>
            <h3>Price</h3>
            <h3>Subtotal</h3>
          </div>
          <div className="flex flex-col justify-around text-xl bg-slate-50 text-slate-800 shadow-2xl">
            {data == null ? (
              <></>
            ) : (
              data.items_bought.map((item) => (
                <OrderItem data={item} key={item.id}></OrderItem>
              ))
            )}
          </div>
          <h2 className="w-[100%]  bg-slate-800 text-slate-50 text-center">
            Total: {data ? <>RM{parseInt(data.amount).toFixed(2)}</> : <>...</>}
          </h2>
        </div>
        <h2 className="text-4xl underline  mb-3 my-10  text-slate-800">
          CUSTOMER DETAILS
        </h2>
        {data ? (
          <>
            <div
              className={`${styles.customerGrid}  justify-around text-xl bg-slate-800 text-slate-50 `}
            >
              <h2>Name</h2>
              <h2>Phone</h2>
              <h2>Email</h2>
              <h2>Address Line 1</h2>
              <h2>Address Line 2</h2>
              <h2>Postal Code</h2>
              <h2>City</h2>
              <h2>State</h2>
              <h2>Country</h2>
            </div>
            <div
              className={`${styles.customerGrid}  justify-around text-xl bg-slate-50 text-slate-800 rounded shadow-2xl`}
            >
              <h2>{data.name}</h2>
              <h2>{data.phone}</h2>
              <h2>{data.email}</h2>
              <h2>Address Line {data.line_1}</h2>
              <h2>Address Line {data.line_2}</h2>
              <h2>Postal {data.postal_code}</h2>
              <h2>{data.city}</h2>
              <h2>{data.state}</h2>
              <h2>{data.country}</h2>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default Order;

export async function getStaticProps({ params, locale }) {
  const ObjectId = require("mongodb").ObjectId;
  const { db } = await connectToDatabase();
  let data = await db
    .collection("tracking")
    .find({ _id: params.id.toString() })
    .toArray();
  data = JSON.parse(JSON.stringify(data));

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      data,
      id: params.id,
    },
  };
}
export async function getStaticPaths({ locales }) {
  const { db } = await connectToDatabase();
  let data = await db.collection("tracking").find().toArray();

  // can use cached data here...
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

  return {
    paths,
    fallback: false,
  };
}
