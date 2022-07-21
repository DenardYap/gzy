import React from "react";
import { ImCancelCircle } from "react-icons/im";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../next-i18next.config";

const Failed = () => {
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col justify-center items-center py-[1em] h-[80vh] bg-slate-100 m-[1em] rounded ">
      <ImCancelCircle
        size={350}
        className="text-red-500 mb-[1em]"
      ></ImCancelCircle>
      <h2 className="text-7xl ">Payment Failed</h2>
      <h3 className="text-4xl">Something went wrong, please try again</h3>
    </div>
  );
};

export default Failed;

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      // Will be passed to the page component as props
    },
  };
}
