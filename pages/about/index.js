import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../../next-i18next.config";
import Image from "next/image";
import Link from "next/link";
import styles from "../../styles/Home.module.css";

export default function About() {
  const { t } = useTranslation("common");
  return (
    <div>
      <div className="flex min-h-[15vh] bg-slate-400"></div>
      <div className="flex min-h-[75vh] bg-slate-200">
        <div
          className={`${styles.shadowBox} relative bottom-[5em] flex min-h-[75vh] max-h-fit  my-[2em] mx-[2em] bg-slate-50 w-full rounded`}
        >
          <div className="flex flex-col items-center text-center w-full">
            <h2 className="text-5xl pt-[0.5em] underline text-slate-800">
              {t("aboutus")}
            </h2>
            <div className="px-5 pb-5 flex flex-col items-start text-left">
              <br></br>
              <p>{t("about_us_long1")}</p>
              <br></br>
              <p>{t("about_us_long2")}</p>
              <br></br>
              <p>{t("about_us_long3")}</p>
              <br></br>
              <p>{t("about_us_long4")}</p>
              <br></br>
              <p>{t("about_us_long5")}</p>
              <br></br>
              <p>{t("about_us_long6")}</p>
            </div>
          </div>
        </div>

        <div
          className={` ${styles.shadowBox} h-fit rounded top-[15em] relative mr-[2em] flex flex-col items-center text-center w-full bg-slate-600 text-slate-50`}
        >
          <h2 className="text-5xl pt-[0.5em] underline text-slate-50">
            {t("swiftlet_farming")}
          </h2>
          <div className="px-5 pb-5 flex flex-col items-start text-left">
            <br></br>
            <p>{t("swiftlet1")}</p>
            <br></br>
            <p>{t("swiftlet2")}</p>
            <br></br>
            <p>{t("swiftlet3")}</p>
            <br></br>
            <p>{t("swiftlet4")}</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-[15vh] bg-slate-400"></div>
    </div>
  );
}
// have to do this every single page :/
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      // Will be passed to the page component as props
    },
  };
}
