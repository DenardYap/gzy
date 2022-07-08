import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import styles from "../../styles/Home.module.css";
import Item from "../../components/Item";
import nextI18nextConfig from "../../next-i18next.config";
import { createClient } from "redis";
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
          return <Item oriData={item} key={item._id}></Item>;
        })}
        {/* <div className={styles.masker} > {t("show_more")} </div> */}
      </div>
    </div>
  );
}
// have to do this every single page :/
export async function getStaticProps({ locale }) {
  const client = createClient({
    url: process.env.NEXT_PUBLIC_REDIS_ENDPOINT,
    password: process.env.NEXT_PUBLIC_REDIS_PASSWORD,
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  let data;
  try {
    data = await client.get("mainCache");
    // get all item
  } catch (error) {
    // try
    console.log("Redis get error", error);
    // client.quit(); //closing client
    /*might need to do more here*/
  } //catch

  if (data == null) {
    //empty
    console.log("cache miss");
    const { db } = await connectToDatabase();
    data = await db.collection("product").find().toArray();
    data = JSON.parse(JSON.stringify(data));
    // add an amount key to the list for later
    data = data.map((item) => ({ ...item, amount: 0 }));
    data = JSON.stringify(data);
    await client.set("mainCache", data);
  } //if
  data = JSON.parse(data);

  console.log("Closing client connection...");
  await client.quit();
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      data,
      // Will be passed to the page component as props
    },
    // revalidate: 15,
  };
}
