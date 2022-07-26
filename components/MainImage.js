import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";

import Swal from "sweetalert2";
const MainImage = ({ num, setAllowClick }) => {
  let inputRef = useRef();
  let imgRef = useRef();
  const { t } = useTranslation("common");

  // convert data to base64 to upload to the backend
  // reason being I dont know how to encode raw buffer and send it to aws
  const fileToDataUri = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.readAsDataURL(file);
    });

  async function handleSubmit(e) {
    e.preventDefault();
    setAllowClick(false);
    console.log("handling submit...");
    // submission is empty
    if (!inputRef.current.files[0]) {
      setAllowClick(true);
      Swal.fire({
        title: "Submission is empty",
        text: "Please include one image",
        icon: "error",
        color: "#1e293b",
        confirmButtonColor: "#1e293b",
      });
      return;
    }

    let dataURI;
    await fileToDataUri(inputRef.current.files[0]).then((x) => {
      dataURI = x;
    });
    console.log(dataURI);

    const buffer = Buffer.from(dataURI.substring(dataURI.indexOf(",") + 1));
    let imageSize = buffer.length / 1e6;

    // file too big
    if (imageSize > 2) {
      setAllowClick(true);
      Swal.fire({
        title: "Image too large",
        text: "Please make sure the size is less than 2MB",
        icon: "error",
        color: "#1e293b",
        confirmButtonColor: "#1e293b",
      });
      return;
    }

    const uploadRoute =
      process.env.NODE_ENV == "production"
        ? process.env.NEXT_PUBLIC_UPLOAD_PRO
        : process.env.NEXT_PUBLIC_UPLOAD_DEV;

    await fetch(uploadRoute + `uploadFile?num=${num}`, {
      method: "POST",
      headers: {
        Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
        "Cache-Control": "no-store",
      },
      body: dataURI,
    })
      .then(async (res) => {
        console.log("res is:", res);
        return res;
      })
      .then(async (res) => {
        console.log("status is:", res.status);
        if (res.ok) console.log("done uploading!");
        return res.json();
      })
      .then((res) => console.log("json is:", res))
      .catch((err) => console.log("Error!", err));
    setAllowClick(true);
    Swal.fire({
      title: "Done!",
      text: "successfully updated the image",
      icon: "success",
      // timer: 700,
      // timerProgressBar: true,
      color: "#1e293b",
      // showConfirmButton: false,
      // confirmButtonColor: "#fb923c",
    });
  }

  useEffect(() => {
    imgRef.current.style.backgroundImage = `url("https://${process.env.NEXT_PUBLIC_cloudFrontURL}/main_aimg${num}.jpg")`;
  }, []);
  return (
    <div className="flex flex-col justify-between bg-slate-200 w-full p-5">
      <div className="flex flex-col  text-center items-center ">
        <h3 className="text-3xl pb-[0.5em] underline">Current Image {num}</h3>
        <div className="relative h-[25em] w-[30em] mx-[1em] mb-[1em] rounded border border-solid border-black">
          {/* <Image
            alt={`current_image${num}`}
            src={`https://${process.env.NEXT_PUBLIC_cloudFrontURL}/main_aimg${num}.jpg`}
            layout="fill"
            objectFit="contain"
            className="rounded"
          ></Image> */}
          <div
            ref={imgRef}
            className="object-contain w-full h-full min-w-[100%] bg-cover	"
          ></div>
        </div>
      </div>
      <div className="flex justify-center items-center pb-[1em]">
        <form
          // action="/action_page.php"
          className="flex flex-row"
          onSubmit={(e) => handleSubmit(e)}
        >
          <div className="flex flex-row justify-center items-center text-center bg-orange-200 p-3 shadow-xl">
            <label htmlFor="img" className="pr-[1em] ">
              Select image:
            </label>
            <input
              className=""
              type="file"
              id="img"
              name="img"
              multiple
              accept="image/*"
              ref={inputRef}
            />
            <input
              type="submit"
              className="cursor-pointer bg-slate-400 p-2 rounded hover:bg-slate-600 hover:text-slate-50 transition all"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default MainImage;
