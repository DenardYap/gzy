import React, { useState, useEffect, useRef, useContext } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { EmailAuthCredential } from "firebase/auth";
import malaysianState from "../util/malaysiaState";
import { MdLocalShipping } from "react-icons/md";
import { languageContext } from "../pages/_app";
import { useTranslation } from "next-i18next";
import Swal from "sweetalert2";

export default function CheckoutForm({ shipFee, setShipFee, setAllowClick }) {
  const language = useContext(languageContext);
  const { t } = useTranslation("common");
  const stripe = useStripe();
  const elements = useElements();
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState("");
  3;
  let areaRef = useRef();
  const [curState, setCurState] = useState("Negeri Sembilan");
  const [curArea, setCurArea] = useState("Jelebu");
  const [triggered, setTriggered] = useState(false);

  const rootRoute =
    process.env.NODE_ENV == "production"
      ? process.env.NEXT_PUBLIC_CHECKOUT_API_CUSTOMpro
      : process.env.NEXT_PUBLIC_CHECKOUT_API_CUSTOMdev;

  const cardStyle = {
    iconStyle: "solid",
    style: {
      base: {
        iconColor: "#475569",
        color: "#475569",
        fontWeight: "600",
        // fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
        fontSize: "1.15em",
        fontSmoothing: "antialiased",
        ":-webkit-autofill": {
          color: "#fce883",
        },
        "::placeholder": {
          color: "#475569",
        },
      },
      invalid: {
        iconColor: "#fc2f21",
        color: "#fc2f21",
      },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cardElementContainer = document.querySelector("#card-element");
    let cardElementCompleted = cardElementContainer.classList.contains(
      "StripeElement--complete"
    );
    if (!cardElementCompleted) {
      Swal.fire({
        title: t("oops"),
        text: t("card_error_two"), // TODO: Might need different language!
        icon: "error",
        color: "#1e293b",
        confirmButtonColor: "#1e293b",
      });
      return;
    }
    setAllowClick(false);
    if (!stripe || !elements) {
      return;
    }

    // create a payment method to pass it to the backend
    const { err, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });
    if (err || !paymentMethod) {
      Swal.fire({
        title: t("oops"),
        text: t("card_error"),
        icon: "error",
        color: "#1e293b",
        confirmButtonColor: "#1e293b",
      });

      setAllowClick(true);
      return;
    }
    const { success_url, cancel_url, error, errorEn, errorZhc, redirect } =
      await fetch(rootRoute, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
        },
        body: JSON.stringify({
          id: paymentMethod.id,
          email: e.target.inputEmail.value,
          city: e.target.areaName.value,
          line1: e.target.inputAddress1.value,
          line2: e.target.inputAddress2.value,
          postal_code: e.target.postalName.value,
          state: e.target.stateName.value,
          name: e.target.inputName.value,
          phone: e.target.inputPhone.value,
        }),
      }).then((res) => {
        return res.json();
      });
    if (error) {
      // display meaningful messages
      // alert(error);
      let text = error;
      if (language == 1) {
        text = errorEn;
      } else if (language == 3) {
        text = errorZhc;
      }

      Swal.fire({
        title: t("oops"),
        text, // TODO: Might need different language!
        icon: "error",
        color: "#1e293b",
        confirmButtonColor: "#1e293b",
      });

      if (redirect) window.location = cancel_url;
      setAllowClick(true);
      return;
    }
    window.location = success_url;
    setAllowClick(true);
  };

  function handleState(e) {
    setCurState(e.target.value);
    setCurArea(malaysianState[e.target.value][0]);
  }

  function handleArea(e) {
    setCurArea(e.target.value);
  }

  function renderAreas() {
    return malaysianState[curState].map((curArea) => {
      return (
        <option key={curArea} value={curArea}>
          {curArea}
        </option>
      );
    });
  }
  function handlePhone(e) {
    e.preventDefault();
    if (e.target.value.length >= 13) return;
    if (e.target.value.length >= 4) {
      // 0126 -> 012-6
      let newNumber = "";

      let trigger = false;
      for (let i = 0; i < e.target.value.length; i++) {
        if (newNumber.length >= 12) break;
        if (i == 3 && currentPhoneNumber[3] != "-") {
          newNumber += "-";
          trigger = true;
        } else if (trigger) {
          if (i == 6) {
            newNumber += " ";
          }
        } else if (i == 7 && currentPhoneNumber[7] != " ") {
          newNumber += " ";
        }
        if (
          e.target.value[i] == "-" &&
          (e.target.value[e.target.value.length - 1] == "-" || i != 3)
        )
          continue;
        if (
          e.target.value[i] == " " &&
          (e.target.value[e.target.value.length - 1] == " " || i != 7)
        )
          continue;

        newNumber += e.target.value[i];
      }
      setCurrentPhoneNumber(newNumber);
    } else {
      setCurrentPhoneNumber(e.target.value);
    }
  }

  useEffect(() => {
    if (
      curArea == "Rembau" ||
      curArea == "Port Dickson" ||
      curArea == "Seremban"
    ) {
      setShipFee("0.00");
    } else {
      setShipFee("15.00");
    }
  }, [curArea]);

  return (
    <form
      // onClick={handleSubmit}
      onSubmit={handleSubmit}
      className="mini:w-[90vw]  laptop:w-[40vw] min-h-[70vh] bg-slate-600 p-[1em] rounded-sm shadow-xl text-center text-slate-600"
    >
      {/* <h2 className="font-semibold text-4xl mb-[1em] text-slate-50">
        Credit Card
      </h2> */}

      <label
        htmlFor="input-address1"
        className="flex justify-start items-center text-slate-50 p-1 mini:text-md tablet:text-xl"
      >
        {t("Address")}
      </label>
      <input
        id="input-address1"
        name="inputAddress1"
        type="text"
        className={`outline-0	p-1 pl-2 rounded-sm text-slate-600 w-full`}
        placeholder="Address Line 1"
        required
      ></input>
      <input
        id="inputAddress2"
        type="text"
        name="inputAddress2"
        className={`outline-0	p-1 pl-2 rounded-sm text-slate-600 w-full my-2 mb-5`}
        placeholder="Address Line 2"
      ></input>

      <div className="flex mini:flex-col laptop:flex-row justify-between items-center ">
        <div className="flex laptop:flex-row laptop:w-[70%] mini:w-full">
          <div className="flex flex-col   w-full">
            <label
              htmlFor="state-name"
              name="stateName"
              className="flex justify-start items-center text-slate-50 p-1 mini:text-md tablet:text-xl "
            >
              {t("State")}
            </label>
            <select
              onChange={handleState}
              id="state-name"
              name="stateName"
              className={`outline-0	p-1 pl-2 rounded-sm text-slate-600 mb-2 w-[100%]`}
            >
              <option value="Negeri Sembilan">Negeri Sembilan</option>
              <option value="Johor">Johor</option>
              <option value="Kedah">Kedah</option>
              <option value="Kelantan">Kelantan</option>
              <option value="Kuala Lumpur">Kuala Lumpur</option>
              <option value="Labuan">Labuan</option>
              <option value="Melaka">Melaka</option>
              <option value="Pahang">Pahang</option>
              <option value="Penang">Penang</option>
              <option value="Perak">Perak</option>
              <option value="Putrajaya">Putrajaya</option>
              <option value="Perlis">Perlis</option>
              <option value="Selangor">Selangor</option>
              <option value="Terengganu">Terengganu</option>
            </select>
          </div>
          <div className="flex flex-col   w-full ml-4">
            <label
              htmlFor="area-name"
              className="flex justify-start items-center text-slate-50 p-1 mini:text-md tablet:text-xl "
              name="areaName"
            >
              {t("Area")}
            </label>
            <select
              onChange={handleArea}
              id="area-name"
              name="areaName"
              className={`outline-0	p-1 pl-2 rounded-sm text-slate-600 mb-2 w-[100%]`}
            >
              {renderAreas()}
            </select>
          </div>
        </div>
        <div className="flex flex-col mini:w-full laptop:w-[30%] mini:ml-0 laptop:ml-4">
          <label
            htmlFor="postal-name"
            className="flex  justify-start items-start text-slate-50 p-1 mini:text-md tablet:text-xl "
            name="postalName"
          >
            {" "}
            {t("Postal")}
          </label>
          <input
            type="tel"
            pattern="[0-9]{5}"
            name="postalName"
            className={`outline-0	p-1 pl-2 rounded-sm text-slate-600 mb-2 w-[100%]`}
          ></input>
        </div>
      </div>
      <div className="text-slate-50  flex justify-start items-center mini:text-sm tablet:text-md mb-5">
        <div className="flex mini:flex-col laptop:flex-row mini:justify-start laptop:justify-between  items-start w-full">
          <div className="flex flex-row justify-center items-center">
            <MdLocalShipping className="mr-[0.5em] text-[1.5em]">
              {" "}
            </MdLocalShipping>
            <h3> {t("ship_time")} </h3>
          </div>
          <h3>
            {t("delivery_fee")}: RM{shipFee}{" "}
          </h3>
        </div>
      </div>
      <label
        htmlFor="input-name"
        className="flex justify-start items-center text-slate-50 p-1 mini:text-md tablet:text-xl"
      >
        {t("Name")}
      </label>
      <input
        id="input-name"
        type="text"
        name="inputName"
        className={`outline-0	p-1 pl-2 rounded-sm text-slate-600 w-full mb-5`}
        placeholder="Your name"
        required
      ></input>

      <div className="flex mini:flex-col laptop:flex-row justify-between mb-5">
        <div className="flex flex-col w-[100%]">
          <label
            htmlFor="input-phone"
            className="flex justify-start items-center text-slate-50 p-1 mini:text-md tablet:text-xl "
          >
            {t("phone_number")}
          </label>
          <input
            onChange={handlePhone}
            id="input-phone"
            type="tel"
            name="inputPhone"
            value={currentPhoneNumber}
            pattern="[0]{1}[1]{1}[0-9]{1}-[0-9]{3} [0-9]{4}"
            className={`outline-0	p-1 pl-2 rounded-sm text-slate-600 w-full`}
            placeholder="012-345 6789"
            required
          ></input>
        </div>

        <div className="flex flex-col w-[100%] mini:ml-0  laptop:ml-4 ">
          <label
            htmlFor="input-email"
            className="flex justify-start items-center text-slate-50 p-1 mini:text-md tablet:text-xl"
          >
            {t("Email")}
          </label>
          <input
            id="input-email"
            type="email"
            name="inputEmail"
            className={`outline-0	p-1 pl-2 rounded-sm text-slate-600 w-full`}
            placeholder="johndoe@example.com"
            required
          ></input>
        </div>
      </div>
      <CardElement
        id="card-element"
        autocomplete="cc-number"
        options={cardStyle}
        className="bg-slate-50 p-[0.5em] my-[0.5em] rounded-sm shadow-xl w-full"
      ></CardElement>
      <button
        // onClick={handleSubmit}
        className="font-semibold text-2xl w-full  hover:bg-red-400 p-[0.5em] my-[0.5em] rounded-sm bg-orange-400 text-white transition-all"
      >
        {t("Pay")}
      </button>
    </form>
  );
}
