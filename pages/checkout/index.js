import React, { useState, useRef, useEffect, useContext } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../../next-i18next.config";

const confirmAddress = () => {
  function handleSubmit(e) {}
  return (
    <>
      <div className="bg-slate-50 w-full h-full">
        <div>
          <form
            onSubmit={handleSubmit}
            className="w-[40vw] min-h-[70vh] bg-slate-600 p-[1em] rounded shadow-xl text-center text-slate-600"
          >
            <input></input>
          </form>
        </div>
      </div>
    </>
  );
};

export default confirmAddress;
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      // Will be passed to the page component as props
    },
  };
}
