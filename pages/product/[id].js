import { useRouter } from "next/router";
// allow us to access the query parameter from the URL

export default function Product() {
  const router = useRouter();
  const { id } = router.query;

  return <h1>Hello {id}</h1>;
}
