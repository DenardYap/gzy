import "../styles/globals.css";
import Layout from "../components/Layout";
import { appWithTranslation } from "next-i18next";
import nextI18nextConfig from "../next-i18next.config";
import React, { useState } from "react";
import {
  getAuth,
  setPersistence,
  inMemoryPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import app from "../util/firebase_util";
/** Data Fetching
 * 1) getStaticProps -> fetch at build time
 * 2) getServersideProps -> every request
 * 3) getStaticpath -> dynamically generate path??
 *
 */

const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

export const userContext = React.createContext();
export const cartContext = React.createContext();
function MyApp({ Component, pageProps, ...appProps }) {
  const [user, setUser] = useState(null); // default to none
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      setUser(user);
      /**Do some permission check here */
      // ...
    }
  });

  const [cartToggle, setToggle] = useState(false);
  const [items, setItems] = useState([]);

  function toggleCart() {
    cartToggle ? setToggle(false) : setToggle(true);
  }
  return (
    <userContext.Provider value={[user, setUser]}>
      <cartContext.Provider value={[cartToggle, toggleCart, items, setItems]}>
        <Layout pathName={appProps.router.pathname}>
          {/* all of our page components */}
          <Component {...pageProps} />
        </Layout>
      </cartContext.Provider>
    </userContext.Provider>
  );
}

export default appWithTranslation(MyApp, nextI18nextConfig);
