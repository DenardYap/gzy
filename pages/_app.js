import "../styles/globals.css";
import Layout from "../components/Layout";
import { appWithTranslation } from "next-i18next";
import nextI18nextConfig from "../next-i18next.config";
import React, { useState } from "react";
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
export const cartContext = React.createContext();
function MyApp({ Component, pageProps, ...appProps }) {
  const [cartToggle, setToggle] = useState(false);

  function toggleCart() {
    cartToggle ? setToggle(false) : setToggle(true);
  }
  return (
    <cartContext.Provider value={[cartToggle, toggleCart]}>
      <Layout pathName={appProps.router.pathname}>
        {/* all of our page components */}
        <Component {...pageProps} />
      </Layout>
    </cartContext.Provider>
  );
}

export default appWithTranslation(MyApp, nextI18nextConfig);
