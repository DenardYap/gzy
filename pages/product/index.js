import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import styles from "../../styles/Home.module.css";
import Item from "../../components/Item";
import nextI18nextConfig from "../../next-i18next.config";
import { connectToDatabase } from "../../util/mongodb";

export default function ProductList(props) {
  const { t } = useTranslation("common");
  return (
    <div className="flex-col bg-slate-100 my-[1.25em] mx-[2em]">
      <div className="text-center font-bold text-[4em] underline">
        <h2 id="product">{t("products")}</h2>
      </div>
      <div className={styles.itemList}>
        {props.data.map((item) => {
          return (
            <Item
              key={item.productID}
              url={item.image}
              title={item.imageTitle}
              max_={item.quantity}
            ></Item>
          );
        })}
        {/* <div className={styles.masker} > {t("show_more")} </div> */}
      </div>
    </div>
  );
}
// have to do this every single page :/
export async function getStaticProps({ locale }) {
  const { db } = await connectToDatabase();
  // find everything for now, might consider split rendering in the future
  // but we only have so few items for now it's fine to just load them all I guess
  let data = await db.collection("product").find().toArray();
  data = JSON.parse(JSON.stringify(data));

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      data,
      // Will be passed to the page component as props
    },
  };
}
