import React, { useState, useEffect, useRef } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { EmailAuthCredential } from "firebase/auth";
import malaysianState from "../util/malaysiaState";
import { MdLocalShipping } from "react-icons/md";
import { useTranslation } from "next-i18next";

export default function CheckoutForm({ setShipFee, setAllowClick }) {
  const { t } = useTranslation("common");
  const stripe = useStripe();
  const elements = useElements();
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState("");

  let [curState, setCurState] = useState("Negeri Sembilan");

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

    // console.log("STREET1 NAME IS:", typeof e.target.inputAddress1.value);
    // console.log("STREET2 NAME IS:", typeof e.target.inputAddress2.value);
    // console.log("STATE NAME IS:", typeof e.target.stateName.value);
    // console.log("AREA NAME IS:", typeof e.target.areaName.value);
    // console.log("NAME IS:", typeof e.target.inputName.value);
    // console.log("PHONE IS:", typeof e.target.inputPhone.value);
    // console.log("EMAIL IS:", typeof e.target.inputEmail.value);
    const cardElementContainer = document.querySelector("#card-element");
    console.log("Card element container is", cardElementContainer);
    let cardElementCompleted = cardElementContainer.classList.contains(
      "StripeElement--complete"
    );
    if (!cardElementCompleted) {
      alert("Please provide a valid credit card detail");
      return;
    }
    setAllowClick(false);
    if (!stripe || !elements) {
      return;
    }
    const { clientSecret, success_url, cancel_url } = await fetch(rootRoute, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
      },
      // body: JSON.stringify({ items: [{ id: "xl-tshirt" }] }),
    }).then((res) => {
      return res.json();
    });
    // create payment
    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: e.target.inputName.value,
        },
      },

      receipt_email: e.target.inputEmail.value,
      shipping: {
        address: {
          city: e.target.areaName.value,
          country: "Malaysia",
          line1: e.target.inputAddress1.value,
          line2: e.target.inputAddress2.value,
          postal_code: e.target.postalName.value,
          state: e.target.stateName.value,
        },
        name: e.target.inputName.value,
        phone: e.target.inputPhone.value,
      },
      receipt_email: e.target.inputEmail.value,
    });
    if (payload.error) {
      alert("Payment Failed");
      console.log(payload.error);
      // window.location = cancel_url;
    } else {
      /**Update database + clear cart */
      let res = await fetch(rootRoute + "update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
        },
      });
      if (res.status == 200) {
        alert("Payment success!");
        window.location = success_url;
      } else {
        alert("Payment Failed");
        res = await res.json();
        console.log(res.error);
        window.location = cancel_url;
      }
    }
  };

  function handleState(e) {
    setCurState(e.target.value);
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
    if (e.target.value.length == 4) {
      // 0126 -> 012-6
      if (currentPhoneNumber.length == 3) {
        setCurrentPhoneNumber((currentPhoneNumber) => {
          let newNumber = currentPhoneNumber;
          newNumber += "-";
          return newNumber + e.target.value[3];
        });
      } else {
        setCurrentPhoneNumber((currentPhoneNumber) => {
          return currentPhoneNumber.slice(0, 3);
        });
      }
    } else if (e.target.value.length == 8) {
      if (currentPhoneNumber.length == 7) {
        setCurrentPhoneNumber((currentPhoneNumber) => {
          let newNumber = currentPhoneNumber;
          newNumber += " ";
          return newNumber + e.target.value[7];
        });
      } else {
        setCurrentPhoneNumber((currentPhoneNumber) => {
          return currentPhoneNumber.slice(0, 7);
        });
      }
    } else {
      setCurrentPhoneNumber(e.target.value);
    }
  }

  function renderPrice() {
    if (curState == "Negeri Sembilan") {
      setShipFee(0.0);
      return "0.00";
    } else if (
      curState == "Johor" ||
      curState == "Perak" ||
      curState == "Kelantan" ||
      curState == "Terengganu"
    ) {
      setShipFee(15.0);
      return "15.00";
    } else {
      setShipFee(5.0);
      return "5.00";
    }
  }

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
            {t("delivery_fee")}: RM{renderPrice()}{" "}
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
            placeholder="012-3456789"
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
