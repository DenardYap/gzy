import Link from "next/link";
import Image from "next/image";
import navStyles from "../styles/NavBar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AiOutlineShoppingCart, AiOutlineFrown } from "react-icons/ai";
import { FaRegUserCircle } from "react-icons/fa";
import { useEffect, useRef, useContext } from "react";
import useState from "react-usestateref";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import CartItemNav from "./CartItemNav";
import {
  cartContext,
  userContext,
  permissionContext,
  dynamicContext,
} from "../pages/_app";
import LoadingIcons from "react-loading-icons";
import app from "../util/firebase_util";
import {
  getAuth,
  signInWithRedirect,
  setPersistence,
  inMemoryPersistence,
  browserLocalPersistence,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { ImCancelCircle } from "react-icons/im";
import { MdOutlinePayment } from "react-icons/md";

import { setUserId } from "firebase/analytics";
import Swal from "sweetalert2";

/** Todo

 * 1) Dark Mode
 * 2) Larger Burger menu
 * 3) Fix clicking on logo the border stays at bottom
 * 4) Unknown key passed via urlObject into url.format: current
 */

// this is needed for parsing my JSON object where description have line breaks and stuff

const NavBar = () => {
  /* Firebase stuff */
  const [dynamicID, setDynamicID] = useContext(dynamicContext);
  const [burger, setBurger] = useState(false);
  const [burgerInit, setBurgerInit] = useState(false);

  const burgerRef = useRef();
  const homeRef = useRef();
  const productRef = useRef();
  const factoryRef = useRef();
  const aboutRef = useRef();

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function initializeBurger() {
    await sleep(500); // this is the time for the burger menu to slide down
    setBurgerInit(true);
    console.log("burger init-ed");
  }

  function handleCloseBurgerOutside(e) {
    // we dont want to triggle this function if the
    // burger menu is not clicked or the burger menu
    // is not fully rendered
    if (!burger || !burgerInit) return;
    let width = burgerRef.current.offsetLeft + burgerRef.current.offsetWidth;
    let height = burgerRef.current.offsetTop + burgerRef.current.offsetHeight;
    if (
      e.clientX < 0 ||
      e.clientX > width ||
      e.clientY < 0 ||
      e.clientY > height
    ) {
      // target is not inside the box
      setBurger(false);
      setBurgerInit(false);
    }
    // console.log(burgerRef.current.offsetRight);
    // console.log(burgerRef.current.offsetBottom);
  }
  useEffect(() => {
    window.addEventListener("click", handleCloseBurgerOutside);
    return () => {
      window.removeEventListener("click", handleCloseBurgerOutside);
    };
  }, [burgerInit]);

  const [permission, setPermission] = useContext(permissionContext);
  const provider = new GoogleAuthProvider();
  const auth = getAuth(app);
  const [user, setUser] = useContext(userContext);
  const [cartToggle, toggleCart, items, setItems] = useContext(cartContext);
  const [refresh, setRefresh] = useState(true);
  const { t } = useTranslation("common");
  const [allowClick, setAllowClick] = useState(true);
  const router = useRouter();
  const rootRoute =
    process.env.NODE_ENV == "production"
      ? process.env.NEXT_PUBLIC_productAPIpro
      : process.env.NEXT_PUBLIC_productAPIdev;

  const lgBtn = useRef();
  const dropdownBtn = useRef();
  const dropdownBox = useRef();
  const navBarRef = useRef();

  let curPage = useRef("#");

  const paymentRoute =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_CHECKOUT_APIpro
      : process.env.NEXT_PUBLIC_CHECKOUT_APIdev;

  async function handleCheckout() {
    setAllowClick(false);
    await fetch(paymentRoute, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
      },
      body: JSON.stringify({
        referrer: window.localStorage.getItem("referrer"),
      }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        alert("Payment failed, please rety, or contact the seller!");
        setAllowClick(true);
        Swal.fire({
          title: t("oops"),
          text: t("error_text"),
          icon: "error",
          color: "#1e293b",
          // showConfirmButton: false,
          confirmButtonColor: "#1e293b",
        });
        return res.json().then((json) => Promise.reject(json));
      })
      .then(({ url }) => {
        window.location = url;
      })
      .catch((e) => {
        alert(e.error);
        console.log(e);
      });
  }
  /**AUTH */
  async function handleAuth() {
    await signInWithRedirect(auth, provider);
  }
  async function handleLogout() {
    signOut(auth)
      .then(() => {
        console.log("sign out successful");
        setUser(null);
      })
      .catch((err) => {
        console.log("An error happened:", err);
      });
  }

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result) {
          console.log("no result");
          return;
        }
        // This gives you a Google Access Token. You can use it to access Google APIs.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        console.log(
          `Error on ${email}! Code: ${errorCode}. Message: ${errorMessage}`
        );
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  }, []);
  /********/

  // loading cart item data from the database
  useEffect(() => {
    // fetch items from local storage and put in an array and update items in cart
    async function fetchData() {
      let res = await fetch(rootRoute + process.env.NEXT_PUBLIC_BACKENDGET, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Acess-control-allow-origin": "https://www.guanzhiyan.com",
          Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
        },
      });
      if (res.status === "404" || res.status === "500") {
        // todo
        console.log("Error in NavBar.js with a status code of", res.status);
      }
      res = await res.json();
      setItems(res.data);
    }
    fetchData();
  }, []);
  // handling color bar logic, to be perfected

  // const [curStyled, setCurStyled] = useState(null);

  // function tog() {
  //   if (
  //     window.location.href == "https://www.guanzhiyan.com/" ||
  //     window.location.href == "https://www.guanzhiyan.com/en" ||
  //     window.location.href == "https://www.guanzhiyan.com/zhc" ||
  //     window.location.href == "http://localhost:3000/" ||
  //     window.location.href == "http://localhost:3000/en" ||
  //     window.location.href == "http://localhost:3000/zhc"
  //   ) {
  //     setCurStyled(homeRef.current);
  //   } else if (window.location.href.indexOf("product") > -1) {
  //     // product page
  //     setCurStyled(productRef.current);
  //   } else if (window.location.href.indexOf("about") > -1) {
  //     // product page
  //     setCurStyled(aboutRef.current);
  //   } else if (window.location.href.indexOf("factory") > -1) {
  //     // product page
  //     setCurStyled(factoryRef.current);
  //   }
  // }
  // useEffect(() => {
  //   tog();
  //   if (!curStyled) return;
  //   console.log("triggered");

  //   curStyled.className += " md:border-amber-400";
  //   return () => {
  //     /*Remove the style */
  //     curStyled.classList.remove("md:border-amber-400");
  //   };
  // }, [curStyled]);
  useEffect(() => {
    // to prevent the null error thigns in Next
    // localStorage["locale"] ? setCurrentLocale(localStorage["locale"])
    //                        : setCurrentLocale("en");
    const dropdownBoxCur = dropdownBox.current;
    const lgBtnCur = lgBtn.current;
    // logic for dropdown
    curPage = window.location.href;

    function handleDropDown() {
      if (dropdownBtn.current.classList.contains("hidden")) {
        dropdownBtn.current.classList.remove("hidden");
      } else {
        dropdownBtn.current.classList.add("hidden");
      }
    }
    function handleDropDownLeave() {
      if (!dropdownBtn.current.classList.contains("hidden")) {
        dropdownBtn.current.classList.add("hidden");
      }
    }

    // if click outside the dropdown we close the dropdown

    lgBtnCur.addEventListener("click", handleDropDown);
    dropdownBoxCur.addEventListener("mouseleave", handleDropDownLeave);
    return () => {
      dropdownBoxCur.removeEventListener("mouseleave", handleDropDownLeave);
      lgBtnCur.removeEventListener("click", handleDropDown);
    };
  }, [refresh]);
  return (
    <nav
      ref={navBarRef}
      className="	w-full flex justify-center items-center bg-slate-100 border-gray-200 px-2 sm:px-4 py-2.5  dark:bg-gray-800 sticky top-0 z-10 shadow-lg"
    >
      {/* layover of the whole page once the button is pressed */}
      {allowClick ? (
        <></>
      ) : (
        <div className="w-full h-full top-0 right-0 bottom-0 left-0 bg-black opacity-50	fixed z-10 flex justify-center items-center">
          <LoadingIcons.Oval height={300} width={300} />
        </div>
      )}

      <div className="w-[100%]   flex flex-row justify-between items-center mx-auto">
        <Link href="/" locale={router.locale}>
          <a className="flex items-center ml-[1em]">
            <Image
              priority={true}
              alt="Guan Zhi Yan Bird Nest"
              className="min-w-[1.5em] min-h-[1.5em]"
              src="/logo/logo_main_slate.jpg"
              width={70}
              height={70}
            />
          </a>
        </Link>

        {/* right portion */}
        <div className="flex   justify-end  md:order-2 items-center">
          <div className="h-[3em] mt-3" ref={dropdownBox}>
            <button
              className="transition-all mini:ml-[1em] tablet:ml-0 mr-[1em] whitespace-nowrap text-slate-50 bg-slate-800 hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              type="button"
              id="lg-button"
              ref={lgBtn}
            >
              {t("language")}
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>
            <div
              className=" cursor-pointer z-[999] text-slate-50  absolute hidden mt-2 bg-slate-800 divide-y rounded shadow w-44"
              id="lg-dropdown"
              ref={dropdownBtn}
            >
              {dynamicID == null ? (
                <Link locale="en" href={curPage}>
                  <h3 className="block px-4 py-2 hover:bg-slate-600 ">
                    {t("english")}
                  </h3>
                </Link>
              ) : (
                <Link
                  locale="en"
                  href={{
                    pathname: dynamicID.pathname,
                    query: { id: dynamicID.id },
                  }}
                >
                  <h3 className="block px-4 py-2 hover:bg-slate-600">
                    {t("english")}
                  </h3>
                </Link>
              )}
              {dynamicID == null ? (
                <Link locale="zh" href={curPage}>
                  <h3 className="block px-4 py-2 hover:bg-slate-600">
                    {t("zh")}
                  </h3>
                </Link>
              ) : (
                <Link
                  locale="zh"
                  href={{
                    pathname: dynamicID.pathname,
                    query: { id: dynamicID.id },
                  }}
                >
                  <h3 className="block px-4 py-2 hover:bg-slate-600">
                    {t("zh")}
                  </h3>
                </Link>
              )}
              {dynamicID == null ? (
                <Link locale="zhc" href={curPage}>
                  <h3 className="block px-4 py-2 hover:bg-slate-600">
                    {t("zhc")}
                  </h3>
                </Link>
              ) : (
                <Link
                  locale="zhc"
                  href={{
                    pathname: dynamicID.pathname,
                    query: { id: dynamicID.id },
                  }}
                >
                  <h3 className="block px-4 py-2 hover:bg-slate-600">
                    {t("zhc")}
                  </h3>
                </Link>
              )}
            </div>
          </div>

          {/* Search bar, dont need for now */}
          {/* <div className="hidden relative mr-3 md:mr-0 md:block">
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-800"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <input
              type="text"
              id="email-address-icon"
              className="block p-2 pl-10 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 sm:text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder={t("search")}
            />
          </div> */}

          <div className={`${navStyles.cartContainer}`}>
            <AiOutlineShoppingCart
              className={navStyles.cart}
            ></AiOutlineShoppingCart>
            <div className={`${navStyles.cartText}  bg-slate-800`}>
              {items.length === 0 ? (
                <div className="justify-center items-center flex flex-col shadow-2xl">
                  <AiOutlineFrown className="text-[6.5em]"></AiOutlineFrown>
                  <h3 className="text-[2em]">{t("no_item")}</h3>
                </div>
              ) : (
                <div className="text-xl flex flex-col">
                  <h3 className="mb-[0.25em]">
                    {" "}
                    {t("items_in_cart")} {items.length}{" "}
                  </h3>
                  <div className="min-h-[8em] max-h-[15em] mb-[0.5em] bg-slate-100 overflow-y-scroll text-black">
                    {items.map((item) => {
                      return (
                        <CartItemNav
                          key={item._id}
                          data={item}
                          oriData={items}
                        ></CartItemNav>
                      );
                    })}
                  </div>
                  <div className="flex justify-around items-center ">
                    <Link href="/cart" locale={router.locale}>
                      <a>
                        <button className="p-3 my-2 rounded bg-orange-600 text-xl text-slate-100 w-full hover:bg-orange-400 transition-colors">
                          {" "}
                          {t("view_cart")}{" "}
                        </button>
                      </a>
                    </Link>
                    {/* <Link href="/checkout" locale={router.locale}> */}
                    <a>
                      <button
                        onClick={handleCheckout}
                        className="p-3 my-2 rounded bg-orange-600 text-xl text-slate-100 w-full hover:bg-orange-400 transition-colors"
                      >
                        {" "}
                        {t("checkout")}{" "}
                      </button>
                    </a>
                    {/* </Link> */}
                  </div>
                </div>
              )}
              {/* Display a nice interface if empty cart/ */}
              {/* Subtotal: View Cart: Checkout */}
            </div>

            <div className={navStyles.number}>{items.length}</div>
          </div>

          <div className={`${navStyles.userContainer} `}>
            {user == null ? (
              <>
                <FaRegUserCircle
                  className={`${navStyles.user} mini:hidden tablet:block`}
                  onClick={handleAuth}
                />
                <div className={`${navStyles.userText}  bg-slate-800`}>
                  {" "}
                  {t("acc")}{" "}
                </div>
              </>
            ) : (
              <>
                <div className="relative mini:hidden tablet:block rounded-full h-[2.5em] w-[2.5em] ml-[0.5em] mr-[1.5em] ">
                  <Image
                    priority={true}
                    src={user.photoURL}
                    className="rounded-full"
                    objectFit="contain"
                    layout="fill"
                  ></Image>
                </div>
                <div className={`${navStyles.userText} bg-slate-800`}>
                  {permission ? (
                    <Link href="/dashboard" locale={router.locale}>
                      <div className="cursor-pointer text-xl hover:bg-slate-50 hover:text-slate-800 border border-solid  hover:border-black w-full text-center">
                        {t("dashboard")}
                      </div>
                    </Link>
                  ) : (
                    <></>
                  )}
                  <div
                    onClick={handleLogout}
                    className="cursor-pointer text-xl hover:bg-slate-50 hover:text-slate-800 border border-solid  hover:border-black w-full text-center"
                  >
                    {t("signout")}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Burger Menu! */}
          <button
            onClick={() => {
              initializeBurger();
              setBurger(true);
            }}
            data-collapse-toggle="mobile-menu-3"
            type="button"
            className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg laptop:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="mobile-menu-3"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
            <svg
              className="hidden w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        {!burger ? (
          <></>
        ) : (
          <div
            ref={burgerRef}
            className={`${navStyles.burgerContainer} overflow-scroll shadow-xl bg-slate-200 absolute top-0 bottom-0 left-0 right-0 w-[100%] z-10 max-h-[100vh] min-h-fit transition-all`}
          >
            <div className="flex flex-row  bg-black justify-end h-fit ">
              <ImCancelCircle
                className="absolute cursor-pointer mt-[0.4em] mr-[0.4em] top-0 bottom-0 mini:left-[85%] tablet:left-[90%] right-0 mini:text-3xl phone:text-4xl tablet:text-5xl text-red-600"
                onClick={() => {
                  setBurgerInit(false);
                  setBurger(false);
                }}
              ></ImCancelCircle>
            </div>
            <ul className=" mini:text-[1.4em] phone:text-[1.6em] tablet:text-[2em] desktop:text-[3em] font-bold  flex flex-col justify-start items-center text-center w-full  whitespace-nowrap">
              <li className="flex items-center justify-center shadow-md h-[2em] border-b-2 w-full border-solid border-slate-600">
                <Link href="/" locale={router.locale}>
                  <a
                    onClick={() => {
                      setBurgerInit(false);
                      setBurger(false);
                    }}
                    ref={homeRef}
                    className="transition-all  text-slate-700  border-b  md:border-b-4 md:border-solid md:border-transparent hover:bg-black md:hover:border-b-4 md:hover:border-solid 	md:hover:border-amber-400 md:hover:bg-transparent  md:p-0  md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 "
                    aria-current="page"
                  >
                    {t("home")}
                  </a>
                </Link>
              </li>
              <li className="flex items-center justify-center shadow-md h-[2em] border-b-2 w-full border-solid border-slate-600">
                <Link href="/product" locale={router.locale}>
                  <a
                    onClick={() => {
                      setBurgerInit(false);
                      setBurger(false);
                    }}
                    ref={productRef}
                    className="transition-all  text-slate-700  border-b  md:border-b-4 md:border-solid md:border-transparent hover:bg-black md:hover:border-b-4 md:hover:border-solid 	md:hover:border-amber-400 md:hover:bg-transparent  md:p-0  md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 "
                    aria-current="page"
                  >
                    {t("products")}
                  </a>
                </Link>
              </li>
              <li className="flex items-center justify-center shadow-md h-[2em] border-b-2 w-full border-solid border-slate-600">
                <Link href="/about" locale={router.locale}>
                  <a
                    onClick={() => {
                      setBurgerInit(false);
                      setBurger(false);
                    }}
                    ref={aboutRef}
                    className="transition-all  text-slate-700  border-b  md:border-b-4 md:border-solid md:border-transparent hover:bg-black md:hover:border-b-4 md:hover:border-solid 	md:hover:border-amber-400 md:hover:bg-transparent  md:p-0  md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 "
                    aria-current="page"
                  >
                    {t("about")}
                  </a>
                </Link>
              </li>
              <li className="flex items-center justify-center shadow-md h-[2em] border-b-2 w-full border-solid border-slate-600">
                <Link href="/factory" locale={router.locale}>
                  <a
                    onClick={() => {
                      setBurgerInit(false);
                      setBurger(false);
                    }}
                    ref={factoryRef}
                    className="transition-all  text-slate-700  border-b  md:border-b-4 md:border-solid md:border-transparent hover:bg-black md:hover:border-b-4 md:hover:border-solid 	md:hover:border-amber-400 md:hover:bg-transparent  md:p-0  md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 "
                    aria-current="page"
                  >
                    {t("factory")}
                  </a>
                </Link>
              </li>
              <li className="flex items-center justify-center shadow-md h-[2em] border-b-2 w-full border-solid border-slate-600">
                <Link href="/cart" locale={router.locale}>
                  <a
                    onClick={() => {
                      setBurgerInit(false);
                      setBurger(false);
                    }}
                    className="transition-all flex-row flex justify-center items-center  text-slate-700  border-b  md:border-b-4 md:border-solid md:border-transparent hover:bg-black md:hover:border-b-4 md:hover:border-solid 	md:hover:border-amber-400 md:hover:bg-transparent  md:p-0  md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 "
                    aria-current="page"
                  >
                    {t("view_cart_small")}
                    <AiOutlineShoppingCart className="ml-2" />
                  </a>
                </Link>
              </li>
              {items.length == 0 ? (
                <></>
              ) : (
                <li className="flex items-center justify-center shadow-md h-[2em] border-b-2 w-full border-solid border-slate-600">
                  <div
                    onClick={() => {
                      setBurgerInit(false);
                      setBurger(false);
                      handleCheckout();
                    }}
                    className="transition-all cursor-pointer  flex-row flex justify-center items-center  text-slate-700  border-b  md:border-b-4 md:border-solid md:border-transparent hover:bg-black md:hover:border-b-4 md:hover:border-solid 	md:hover:border-amber-400 md:hover:bg-transparent  md:p-0  md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 "
                  >
                    {t("checkout_small")}
                    <MdOutlinePayment className="ml-2" />
                  </div>
                </li>
              )}
            </ul>
          </div>
        )}
        {/* Left portion */}
        <div
          className="hidden  justify-between items-center md:flex  w-fit md:order-1"
          id="mobile-menu-3"
        >
          <ul className="tablet:text-[1em] phone:text-[0.75em] mini:text-[0.5em] laptop:text-[1em] desktop:text-[1.25em] flex flex-row justify-center items-center   mt-4 md:mt-0 w-fit md:font-medium whitespace-nowrap">
            <li>
              <Link href="/" locale={router.locale}>
                <a
                  ref={homeRef}
                  className="transition-all  hidden tablet870:block py-5  pl-3 text-slate-700 mt-2 border-b  md:border-b-4 md:border-solid md:border-transparent hover:bg-black md:hover:border-b-4 md:hover:border-solid 	md:hover:border-amber-400 md:hover:bg-transparent  md:p-0  md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 "
                  aria-current="page"
                >
                  {t("home")}
                </a>
              </Link>
            </li>
            <li>
              <Link
                href="/product"
                // href="#product"
                locale={router.locale}
              >
                <a
                  ref={productRef}
                  className="transition-all hidden tablet:block py-5  pl-3 text-slate-700 mt-2 border-b md:border-b-4 md:border-solid md:border-transparent hover:bg-black md:hover:border-b-4 md:hover:border-solid 	md:hover:border-amber-400 md:hover:bg-transparent  md:p-0 md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                >
                  {t("products")}
                </a>
              </Link>
            </li>
            <li>
              <Link href="/about" locale={router.locale}>
                <a
                  ref={aboutRef}
                  className="transition-all hidden laptop:block py-5  pl-3 text-slate-700 mt-2 border-b md:border-b-4 md:border-solid md:border-transparent hover:bg-black md:hover:border-b-4 md:hover:border-solid 	md:hover:border-amber-400 md:hover:bg-transparent  md:p-0 md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                >
                  {t("about")}
                </a>
              </Link>
            </li>
            <li>
              <Link href="/factory" locale={router.locale}>
                <a
                  ref={factoryRef}
                  className="transition-all hidden laptop:block py-5  pl-3 text-slate-700 mt-2 border-b md:border-b-4 md:border-solid md:border-transparent hover:bg-black md:hover:border-b-4 md:hover:border-solid 	md:hover:border-amber-400 md:hover:bg-transparent  md:p-0 md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                >
                  {t("factory")}
                </a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
