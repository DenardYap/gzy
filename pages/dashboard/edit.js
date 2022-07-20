import React, { useState, useRef, useEffect, useContext } from "react";
import { userContext } from "../_app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../../next-i18next.config";
import Image from "next/image";
import styles from "../../styles/Home.module.css";
import MainImage from "../../components/MainImage";
const Edit = () => {
  const [allowClick, setAllowClick] = useState(true);
  const allowedEmails = ["bernerd@umich.edu", "gzypdykl@gmail.com"];
  const [permission, setPermission] = useState(false);
  const [user, setUser] = useContext(userContext);
  const inputRef = useRef();
  // permission check
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

  const [dataUri, setDataUri] = useState("");
  const fileToDataUri = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.readAsDataURL(file);
    });

  return (
    <>
      {permission ? (
        <div
          className={`h-fit bg-slate-50 p-5 m-[1em] rounded ${styles.shadowBox} flex flex-col justiy-center items-center text-center`}
        >
          <h2 className="underline text-5xl pb-5">Change Main Images</h2>
          {[1, 2, 3].map((num) => {
            return <MainImage key={num} num={num}></MainImage>;
          })}
        </div>
      ) : (
        <div className="h-[80vh] flex justify-center items-center text-3xl ">
          You don&apos;t have permission to view this page
        </div>
      )}
    </>
  );
};

export default Edit;
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      // Will be passed to the page component as props
    },
  };
}
