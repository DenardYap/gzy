import React from "react";
import Image from "next/image";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../next-i18next.config";

const Wechat = () => {
  const { t } = useTranslation("common");
  return (
    <div className="w-full h-[90vh] text-center flex flex-row justify-center items-center ">
      <div>
        <div className="">
          <h2>{t("wechat_text")}</h2>
        </div>

        <div className="h-[50vh] w-[100vw]  relative ">
          <Image
            priority
            alt="wechat qrcode"
            className=""
            src="/images/wechat.jpg"
            layout="fill"
            objectFit="contain"
          ></Image>
        </div>
      </div>
    </div>
  );
};

export default Wechat;
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      // Will be passed to the page component as props
    },
  };
}
