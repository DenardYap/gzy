import React, { useState, useRef, useEffect, useContext } from "react";
import { userContext } from "../_app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../../next-i18next.config";
import { data } from "autoprefixer";
import OrderHistory from "../../components/OrderHistory";
import LoadingIcons from "react-loading-icons";

const Tracking = () => {
  const allowedEmails = ["bernerd@umich.edu", "gzypdykl@gmail.com"];
  const [permission, setPermission] = useState(false);
  const [user, setUser] = useContext(userContext);
  // permission check

  const orderRoute =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_CHECKOUT_ORDERpro
      : process.env.NEXT_PUBLIC_CHECKOUT_ORDERdev;

  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      let res = await fetch(orderRoute + "getAll", {
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
        console.log("data is", res.data);
      }
    })();
  }, []);
  useEffect(() => {
    if (!user) return;
    if (permission) return;
    for (let i = 0; i < allowedEmails.length; i++) {
      if (user.email == allowedEmails[i]) {
        setPermission(true);
        return;
      }
    }
  }, [user]);

  return (
    <>
      {permission ? (
        <>
          <div className="flex flex-col p-5 m-[1em] rounded bg-slate-100 text-center justify-center items-center">
            <h2 className="text-6xl underline  mb-3   text-slate-800 text-left  ">
              ORDER HISTORY
            </h2>
            {data != null ? (
              data.map((item) => (
                <OrderHistory key={item._id} data={item}></OrderHistory>
              ))
            ) : (
              <LoadingIcons.Oval height={300} width={300} stroke="#1e293b" />
            )}
          </div>
        </>
      ) : (
        <div className="h-[80vh] flex justify-center items-center text-3xl ">
          You don&apos;t have permission to view this page
        </div>
      )}
    </>
  );
};

export default Tracking;
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      // Will be passed to the page component as props
    },
  };
}
