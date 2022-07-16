import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/OrderItem.module.css";
const OrderItem = ({ data }) => {
  const router = useRouter();
  return (
    <div className={styles.orderGrid}>
      <div className={styles.imageGrid}>
        <Link href={`/product/${data.id}`} locale={router.locale}>
          <div className="relative h-[7em] w-[7em] cursor-pointer ">
            <Image
              src={data.image}
              layout="fill"
              objectFit="contain"
              className="rounded"
            ></Image>
          </div>
        </Link>
      </div>
      <div className={styles.titleGrid}>{data.imageTitle}</div>
      <div className={styles.quantityGrid}>{data.amount} pcs</div>
      <div className={styles.priceGrid}>
        RM{parseInt(data.price).toFixed(2)}
      </div>
      <div className={styles.subTitleGrid}>
        RM{(parseInt(data.amount) * parseInt(data.price)).toFixed(2)}
      </div>
    </div>
  );
};

export default OrderItem;
