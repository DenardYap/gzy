import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
// allow us to access the query parameter from the URL

export default function Product() {
  const router = useRouter();
  const { id } = router.query;

  return <h1>Hello {id}</h1>;
}
// have to do this every single page :/ 
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      // Will be passed to the page component as props
    },
  };
}
