import React, { useState, useRef, useEffect, useContext } from "react";
import { permissionContext, userContext } from "../../_app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../../../next-i18next.config";
import Swal from "sweetalert2";
import LoadingIcons from "react-loading-icons";

const Add = () => {
  const [permission, setPermission] = useContext(permissionContext);
  const [user, setUser] = useContext(userContext);
  const [allowClick, setAllowClick] = useState(true);
  const { t } = useTranslation("common");
  // permission check

  const fileToDataUri = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.readAsDataURL(file);
    });

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAllowClick(false);

    console.log("handling submit...");
    // didn't include an iamge
    if (!e.target.image.files[0]) {
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

    // capitalize the first alphabet of title and description
    e.target.imageTitleEn.value = capitalizeFirstLetter(
      e.target.imageTitleEn.value
    );
    e.target.descriptionEn.value = capitalizeFirstLetter(
      e.target.descriptionEn.value
    );

    let dataURI;

    await fileToDataUri(e.target.image.files[0]).then((x) => {
      dataURI = x;
    });

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

    // make requests to the backend, first upload the image to CDN
    // then update our database
    const uploadRoute =
      process.env.NODE_ENV == "production"
        ? process.env.NEXT_PUBLIC_UPLOAD_PRO
        : process.env.NEXT_PUBLIC_UPLOAD_DEV;

    // the name of the image is gonna be the current date in Epoch format
    let key = new Date();
    key = key.getTime().toString();

    await fetch(uploadRoute + `uploadItem?key=${key}`, {
      method: "POST",
      headers: {
        Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
        "Cache-Control": "no-store",
      },
      body: dataURI,
    });

    // once we done uploading the image to CDN, let's go ahead and update databse
    await fetch(uploadRoute + "add", {
      method: "POST",
      headers: {
        Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({
        price: e.target.price.value,
        quantity: e.target.quantity.value,
        imageTitle: e.target.imageTitle.value,
        imageTitleEn: e.target.imageTitleEn.value,
        imageTitleZhc: e.target.imageTitleZhc.value,
        description: e.target.description.value,
        descriptionEn: e.target.descriptionEn.value,
        descriptionZhc: e.target.descriptionZhc.value,
        image:
          "https://" +
          process.env.NEXT_PUBLIC_cloudFrontURL +
          "/" +
          key +
          ".jpg",
        type: e.target.type.value,
      }),
    });
    setAllowClick(true);

    e.target.price.value = "";
    e.target.quantity.value = "";
    e.target.imageTitle.value = "";
    e.target.imageTitleEn.value = "";
    e.target.imageTitleZhc.value = "";
    e.target.description.value = "";
    e.target.descriptionEn.value = "";
    e.target.descriptionZhc.value = "";
    e.target.type.value = "1";
    e.target.image.value = "";

    Swal.fire({
      title: "Done!",
      text: "successfully updated the item",
      icon: "success",
      // timer: 700,
      // timerProgressBar: true,
      color: "#1e293b",
      // showConfirmButton: false,
      // confirmButtonColor: "#fb923c",
    });
  }
  return (
    <>
      {permission ? (
        <div className="bg-slate-100 m-[1em] p-5">
          {allowClick ? (
            <></>
          ) : (
            <div className="w-full h-full top-0 right-0 bottom-0 left-0 bg-black opacity-50	fixed z-10 flex justify-center items-center">
              <LoadingIcons.Oval height={300} width={300} />
            </div>
          )}
          <form onSubmit={(e) => handleSubmit(e)}>
            {/**
             * Price > 0, double, to string
             * Quantity >= 0
             * imageTitle
             * imageTitleEn
             * imageTitleZhc
             * description   - 200 words
             * descriptionEn - 1000 words
             * descriptionZhc - 200 words
             * image -> upload to CDN with the same id?
             * type -> dropdown, 5 types Fresh (1), Condensed (2), Dry (3), Strips (4), Other (5)
             */}
            <div className="flex flex-row justify-start my-[0.5em]">
              <div className="flex flex-col mx-2">
                <label htmlFor="price">Price (RM):</label>
                <input
                  placeholder="109.90"
                  className="rounded shadow-xl p-1 border border-black"
                  required
                  type="number"
                  min="2"
                  name="price"
                ></input>
              </div>

              <div className="flex flex-col mx-2">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  placeholder="10"
                  className="rounded shadow-xl p-1 border border-black"
                  required
                  type="number"
                  min="0"
                  name="quantity"
                ></input>
              </div>
            </div>

            <div className="flex flex-col mx-2 my-[0.5em]">
              <label htmlFor="imageTitleEn">Image Name (English):</label>
              <input
                placeholder="Fresh Stewed Bird's Nest 100ml"
                required
                className="w-[40%] rounded shadow-xl p-1 border border-black"
                type="text"
                min="0"
                name="imageTitleEn"
                minLength="1"
              ></input>
            </div>
            <div className="flex flex-col mx-2 my-[0.5em]">
              <label htmlFor="imageTitle">
                Image Name (Simplified Chinese):
              </label>
              <input
                placeholder="鲜炖燕窝100ml"
                required
                className="w-[40%] rounded shadow-xl p-1 border border-black"
                type="text"
                min="0"
                name="imageTitle"
                minLength="1"
              ></input>
            </div>
            <div className="flex flex-col mx-2 my-[0.5em]">
              <label htmlFor="imageTitleZhc">
                Image Name (Traditional Chinese):
              </label>
              <input
                placeholder="鮮燉燕窩100ml"
                required
                className="w-[40%] rounded shadow-xl p-1 border border-black"
                type="text"
                min="0"
                name="imageTitleZhc"
                minLength="1"
              ></input>
            </div>

            <div className="flex flex-col mx-2 my-[0.5em]">
              <label htmlFor="descriptionEn">Description (English):</label>
              <textarea
                placeholder="Maximum 800 words in English"
                required
                className="rounded shadow-xl p-1 border border-black"
                min="0"
                name="descriptionEn"
                minLength={1}
                maxLength={800}
              ></textarea>
            </div>
            <div className="flex flex-col mx-2 my-[0.5em]">
              <label htmlFor="description">
                Description (Simplified Chinese):
              </label>
              <textarea
                placeholder="Maximum 200 words in Chinese"
                className="rounded shadow-xl p-1 border border-black"
                required
                min="0"
                name="description"
                minLength={1}
                maxLength={200}
              ></textarea>
            </div>
            <div className="flex flex-col mx-2 my-[0.5em]">
              <label htmlFor="descriptionZhc">
                Description (Traditional Chinese):
              </label>
              <textarea
                placeholder="Maximum 200 words in Chinese"
                className="rounded shadow-xl p-1 border border-black"
                required
                min="0"
                name="descriptionZhc"
                minLength={1}
                maxLength={200}
              ></textarea>
            </div>

            <div className="flex flex-col mx-2 my-[0.5em]">
              <label htmlFor="imageTitleZhc">Type:</label>
              <select
                required
                className="w-fit rounded shadow-xl p-1 border border-black "
                name="type"
              >
                <option value="1"> Fresh</option>
                <option value="2"> Condensed</option>
                <option value="3"> Dry</option>
                <option value="5"> Other</option>
              </select>
            </div>

            <div className="flex flex-col mx-2 my-[0.5em]">
              <label htmlFor="image">Select an image:</label>
              <input
                className="my-[0.5em]"
                type="file"
                id="image"
                name="image"
                multiple
                accept="image/*"
              ></input>
            </div>

            <div className="w-full items-center text-center justify-center my-[0.5em]">
              <input
                type="submit"
                className="rounded py-2 px-4 m-2 text-slate-800 text-4xl cursor-pointer hover:bg-green-300 transition-all bg-green-400 shadow-2xl"
              ></input>
            </div>
          </form>
        </div>
      ) : (
        <div className="h-[80vh] flex justify-center items-center text-3xl ">
          You don&apos;t have permission to view this page
        </div>
      )}
    </>
  );
};

export default Add;
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      // Will be passed to the page component as props
    },
  };
}
