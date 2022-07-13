import React from "react";
import { ImCheckmark } from "react-icons/im";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../next-i18next.config";

const Success = () => {
  return (
    <div className="flex flex-col justify-center items-center py-[1em] h-[80vh] bg-slate-100 m-[1em] rounded ">
      <ImCheckmark size={350} className="text-green-500 mb-[1em]"></ImCheckmark>
      <h2 className="text-7xl ">Payment Success</h2>
      <h3 className="text-4xl">Your items will be shipped shortly</h3>
    </div>
  );
};

export default Success;
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      // Will be passed to the page component as props
    },
  };
}
