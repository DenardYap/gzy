import "../styles/globals.css";
import Layout from "../components/Layout";
import { appWithTranslation } from "next-i18next";
import nextI18nextConfig from "../next-i18next.config";
/** Todo
 * 1) How to disable navbar or common layout
 *    at pages that don't need them?
 */

/** Data Fetching
 * 1) getStaticProps -> fetch at build time
 * 2) getServersideProps -> every request
 * 3) getStaticpath -> dynamically generate path??
 *
 */
function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      {/* all of our page components */}
      <Component {...pageProps} />
    </Layout>
  );
}

export default appWithTranslation(MyApp, nextI18nextConfig);
