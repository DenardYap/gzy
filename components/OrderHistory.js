import React from "react";
import styles from "../styles/OrderHistory.module.css";
import { useRouter } from "next/router";
import Link from "next/link";
const OrderHistory = ({ data }) => {
  const router = useRouter();
  function formatDate(timestamp) {
    let date = new Date(timestamp);
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

  /**
   * Timestamp, Amount
   * City, state, country, postal_code, line_1, line_2, phone,
   */
  return (
    <div
      className={`bg-slate-200 text-left text-slate-800 p-5 mx-[0.5em] my-2 w-full border border-slate-50 border-solid ${styles.orderGrid}`}
    >
      <div className="flex flex-col">
        <h3>
          <b>Contact Info:</b>
        </h3>

        <div className="flex flex-col justify-around h-full">
          <div>
            <h3>Name: {data.name}</h3>
            <h3>Phone: {data.phone}</h3>
            <h3>Email: {data.email}</h3>
          </div>

          <div>
            <h3>
              <b>Order placed on:</b>
            </h3>
            <h3 className="font-medium"> {formatDate(data.timestamp)}</h3>
          </div>
        </div>
      </div>
      <div className="text-left px-2">
        <h3>
          <b>Address</b>
        </h3>
        <h3>{data.line_1}</h3>
        <h3>{data.line_2}</h3>
        <h3>
          {data.postal_code} {data.city}
        </h3>
        <h3>{data.state}</h3>
        <h3>{data.country}</h3>
      </div>

      <div className="flex flex-col">
        <h3>
          <b>Order Information</b>
        </h3>
        Total: RM{parseInt(data.amount).toFixed(2)}
        <Link
          href={
            process.env.NODE_ENV == "production"
              ? `https://www.guanzhiyan.com/order/${data._id}`
              : `http://localhost:3000/order/${data._id}`
          }
        >
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-orange-400 w-fit"
          >
            Tracking link
          </a>
        </Link>
        <Link
          href={`https://dashboard.stripe.com/test/payments/${data._id}`}
          locale={router.locale}
        >
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="underline  text-orange-400 w-fit"
          >
            Stripe Link
          </a>
        </Link>
      </div>
      <div className="flex flex-col justify-between h-[100%] text-center items-center">
        <h3>
          {data.status == 1 ? (
            <div>
              <h3 className="text-red-500">
                <b className="text-slate-800">Status:</b> NOT UPDATED ❌
              </h3>

              <h3 className="text-slate-800 font-light">
                <b className="font-extrabold">Tracking Number:</b> Not Available
              </h3>
            </div>
          ) : (
            <div>
              <h3 className="text-green-500">
                <b className="text-slate-800">Status:</b> Updated ✔️
              </h3>

              <h3 className="text-slate-800">
                Tracking Number: {data.tracking_number}
              </h3>
            </div>
          )}
        </h3>

        <button className="p-5 bg-slate-800 text-slate-50 shadow-2xl hover:bg-slate-400 transition-all rounded w-fit">
          Upload Tracking Number
        </button>
      </div>
    </div>
  );
};

export default OrderHistory;
