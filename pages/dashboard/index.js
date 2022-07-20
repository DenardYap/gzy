import React, { useState, useRef, useEffect, useContext } from "react";
import { userContext } from "../_app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../../next-i18next.config";
import Image from "next/image";
import Link from "next/link";
import { BiEdit } from "react-icons/bi";
import { MdOutlineLocalShipping } from "react-icons/md";
import { RiAddCircleFill } from "react-icons/ri";
import { useRouter } from "next/router";

const Dashboard = () => {
  const router = useRouter();
  const allowedEmails = ["bernerd@umich.edu", "gzypdykl@gmail.com"];
  const [permission, setPermission] = useState(false);
  const [user, setUser] = useContext(userContext);
  // permission check
  useEffect(() => {
    if (permission) return;
    if (!user) return;
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
        <div className="flex flex-col p-5 m-[1em] rounded bg-slate-100 text-center">
          <h2 className="text-slate-800 text-8xl underline">Dashboard</h2>
          <h4 className="text-slate-800 pt-5 text-xl">
            Hi, {user.displayName}
          </h4>
          <div className="flex flex-row justify-between px-5 py-10">
            <Link href="/dashboard/edit" locale={router.locale}>
              <div className="transition-all px-5 basis-2 cursor-pointer flex flex-col justify-center items-center bg-orange-100 hover:bg-orange-200 shadow-xl rounded mx-5">
                <h3 className="text-2xl p-3">
                  <b>Edit The Website</b>
                </h3>
                <h4 className="text-md ">Change Home Page&apos;s image</h4>
                <BiEdit className="" size={300}></BiEdit>
              </div>
            </Link>

            <Link href="/dashboard/upload" locale={router.locale}>
              <div className="transition-all px-5 basis-2 cursor-pointer flex flex-col justify-center items-center bg-blue-100 hover:bg-blue-200 shadow-xl rounded mx-5">
                <h3 className="text-2xl p-3">
                  <b>Product</b>
                </h3>
                <h4 className="text-md ">
                  Add new item, delete item, update item quantity, name, image,
                  etc
                </h4>
                <RiAddCircleFill className="" size={300}></RiAddCircleFill>
              </div>
            </Link>

            <Link href="/dashboard/tracking" locale={router.locale}>
              <div className="transition-all px-5 basis-2 cursor-pointer flex flex-col justify-center items-center bg-green-100 hover:bg-green-200 shadow-xl rounded mx-5">
                <h3 className="text-2xl p-3">
                  <b>Tracking</b>
                </h3>
                <h4 className="text-md ">
                  Upload package status (Packaging, Shipping, Delivered), check
                  order history, track order status, check customer status
                </h4>
                <MdOutlineLocalShipping
                  className=""
                  size={300}
                ></MdOutlineLocalShipping>
              </div>
            </Link>
          </div>
        </div>
      ) : (
        <div className="h-[80vh] flex justify-center items-center text-3xl ">
          You don&apos;t have permission to view this page
        </div>
      )}
    </>
  );
};

export default Dashboard;
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      // Will be passed to the page component as props
    },
  };
}
