import React, { useState, useRef, useEffect, useContext } from "react";
import { permissionContext, userContext } from "../../_app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../../../next-i18next.config";
import LoadingIcons from "react-loading-icons";
import { createClient } from "redis";
import Swal from "sweetalert2";
import ViewItem from "../../../components/ViewItem";

const Delete = (props) => {
  const [permission, setPermission] = useContext(permissionContext);
  const [user, setUser] = useContext(userContext);
  const { t } = useTranslation("common");
  const [allowClick, setAllowClick] = useState(true);
  // permission check

  return (
    <>
      {permission ? (
        <>
          <div className="bg-slate-100 m-[1em] p-5 rounded min-h-[75vh] flex flex-col justify-center items-center">
            {allowClick ? (
              <></>
            ) : (
              <div className="w-full h-full top-0 right-0 bottom-0 left-0 bg-black opacity-50	fixed z-10 flex justify-center items-center">
                <LoadingIcons.Oval height={300} width={300} />
              </div>
            )}
            <h2 className="text-3xl font-bold text-red-500">
              Select an Item to delete
            </h2>
            {props.data.map((item) => {
              return (
                <ViewItem
                  key={item._id}
                  data={item}
                  allowClick={allowClick}
                  setAllowClick={setAllowClick}
                  operation={1}
                ></ViewItem>
              );
            })}
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

export default Delete;
export async function getStaticProps({ locale }) {
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
  console.log("fetching data in delete.js");

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
