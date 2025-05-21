import Head from "next/head";
import "../styles/globals.css";
import Layout from "../components/Layout";
import { appWithTranslation } from "next-i18next";
import nextI18nextConfig from "../next-i18next.config";
import React, { useState, useEffect } from "react";
import queryString from "query-string";

import {
  getAuth,
  setPersistence,
  inMemoryPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import app from "../util/firebase_util";
import { BiWindows } from "react-icons/bi";
/** Data Fetching
 * 1) getStaticProps -> fetch at build time
 * 2) getServersideProps -> every request
 * 3) getStaticpath -> dynamically generate path??
 *
 */

const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

export const dynamicContext = React.createContext();
export const languageContext = React.createContext();
export const permissionContext = React.createContext();
export const userContext = React.createContext();
export const cartContext = React.createContext();
function MyApp({ Component, pageProps, ...appProps }) {
  const [dynamicID, setDynamicID] = useState(null); // null when it's not on a dynamic page
  const [language, setLanguage] = useState(1); //1 for en, 2 for zh, 3 for zhc
  const allowedEmails = [
    "mameehy@hotmail.com",
    "makerclub.tulc@gmail.com",
    "bernerd@umich.edu",
    "gzypdykl@gmail.com",
    "guanzhiyanpd@gmail.com",
    "maggieykw@hotmail.com",
  ];
  const [permission, setPermission] = useState(false); // def7ault to false permission, for guest users and stuff
  const [user, setUser] = useState(null); // default to none

  const rootRoute =
    process.env.NODE_ENV == "production"
      ? process.env.NEXT_PUBLIC_productAPIpro
      : process.env.NEXT_PUBLIC_productAPIdev;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is signed in", user);
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      setUser(user);
      /**Do some permission check here */
      // ...
    } else {
      // User is signed out
      console.log("User is signed out");
    }
  });

  const [cartToggle, setToggle] = useState(false);
  const [items, setItems] = useState([]);

  // update total user in database if this user hasn't visited this website
  useEffect(() => {
    async function incrementUser() {
      if (!window.localStorage.getItem("visited")) {
        window.localStorage.setItem("visited", "true");
        await fetch(rootRoute + "increment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
          },
        });
      }
    }
    incrementUser();
  }, []);
  // checking permission
  useEffect(() => {
    if (!user) return;
    if (permission) return;
    for (let i = 0; i < allowedEmails.length; i++) {
      if (user.email == allowedEmails[i]) {
        setPermission(true);
        return;
      }
    }
  }, [user]);

  // checking language
  useEffect(() => {
    let params = queryString.parse(window.location.search);
    if (params.r) {
      async function setReferrer() {
        // window.localStorage.setItem("referrer", params.r);
        await fetch(rootRoute + "setReferrer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
          },
          body: JSON.stringify({
            referrer: params.r,
          }),
        });
      }
      setReferrer();
    }
    // console.log("req query num is:", params.z);
    if (!(window.location.href.indexOf("en") > -1)) {
      // not english
      if (window.location.href.indexOf("zhc") > -1) {
        console.log("Current lang", "zhc");
        let zhc_font = new FontFace("notosans", "url(/font/notosans.otf)");
        zhc_font.load().then((loaded_face) => {
          console.log(loaded_face);
          document.getElementsByTagName("body")[0].style.fontFamily =
            "notosans";
        });
        setLanguage(3);
      } else {
        console.log("Current lang", "zh");
        let zh_font = new FontFace("zcool", "url(/font/zcool.ttf)");
        zh_font.load().then((loaded_face) => {
          console.log(loaded_face);
          document.getElementsByTagName("body")[0].style.fontFamily = "zcool";
        });
        setLanguage(2);
      }
    } else {
      // document.getElementsByTagName("body")[0].style.fontFamily =
      //   "/font/mashanzheng.ttf";
      console.log("Current lang", "en");
      let english_font = new FontFace("Varela", "url(/font/Varela.ttf)");
      english_font.load().then((loaded_face) => {
        console.log(loaded_face);
        document.getElementsByTagName("body")[0].style.fontFamily = "Varela";
      });
    }
  }, []);

  function toggleCart() {
    cartToggle ? setToggle(false) : setToggle(true);
  }
  return (
    <>
      <Head>
        <title>Guan Zhi Yan Bird Nest</title>
        <link rel="icon" href="/favicon.ico" />

        <meta charSet="UTF-8" />
        <meta
          name="description"
          content="Guan Zhi Yan Bird Nest has been selling high-quality, pure, delicate, and nutritious bird nests in Malaysia for more than 20 years. We process bird nests in a hygienic and chemical-free environment without adding any food colorings or bleach into our bird nests, which again ensures they not only taste great but also 100% natural. Bird nests have always been regarded as a health delicacy for the rich and affluent due to the high pricing. Tedious & labor-intensive harvesting and processing steps of bird nests continue to keep the product at such high pricing level. As strong believers in the health benefits of bird nests, our company envisions making bird nests more affordable so as to allow more people to enjoy the health benefits of bird nests consumption. Our bird nests come directly from our company's Swiftlet Farms, allowing us to be in full control of our Bird nest quality."
        />
        <meta name="author" content="Bernard Kah Huan Yap" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <dynamicContext.Provider value={[dynamicID, setDynamicID]}>
        <languageContext.Provider value={language}>
          <permissionContext.Provider value={[permission, setPermission]}>
            <userContext.Provider value={[user, setUser]}>
              <cartContext.Provider
                value={[cartToggle, toggleCart, items, setItems]}
              >
                <Layout pathName={appProps.router.pathname}>
                  {/* all of our page components */}
                  <Component {...pageProps} />
                </Layout>
              </cartContext.Provider>
            </userContext.Provider>
          </permissionContext.Provider>
        </languageContext.Provider>
      </dynamicContext.Provider>
    </>
  );
}

export default appWithTranslation(MyApp, nextI18nextConfig);
