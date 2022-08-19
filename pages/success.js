import React from "react";
import { ImCheckmark } from "react-icons/im";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../next-i18next.config";

const Success = () => {
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col justify-center items-center py-[1em] h-[90vh] bg-slate-100 m-[1em] rounded ">
      <ImCheckmark size={350} className="text-green-500 mb-[1em]"></ImCheckmark>
      <h2 className="text-7xl pb-2">{t("payment_success")}</h2>
      <h3 className="text-4xl pb-2">{t("shipped_shortly")}</h3>
      <h3 className="text-3xl pb-2">{t("track_package")}</h3>
      <h3 className="text-xl">
        {t("didnt_received")} <b>{t("spam")}</b> {t("folder")}
      </h3>
      <div>
        <h3 className="text-xl">
          {t("have_time")}
          <a
            href="https://forms.gle/Jmo5m9UcgbmbzC8u6"
            className="hover:text-orange-400 underline transition all"
          >
            {t("rate")}{" "}
          </a>{" "}
        </h3>
      </div>
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
