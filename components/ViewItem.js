import React, { useEffect, useState, useContext } from "react";
import { languageContext } from "../pages/_app";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import styles from "../styles/ViewItem.module.css";
import { MdCancel } from "react-icons/md";
import LoadingIcons from "react-loading-icons";

const ViewItem = ({ data, allowClick, setAllowClick, operation }) => {
  const language = useContext(languageContext);
  const [popup, setPopup] = useState(false);

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

  function handleClick() {
    if (operation == 1) {
      handleDelete();
    } else {
      // edit
      handleEdit();
    }
  }

  function handleEdit() {
    setPopup(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    Swal.fire({
      title: "Are you sure you want to edit this item?",
      text: "Are all the information correct?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setAllowClick(false);
        console.log("edited!");
        e.target.imageTitleEn.value = capitalizeFirstLetter(
          e.target.imageTitleEn.value
        );
        e.target.descriptionEn.value = capitalizeFirstLetter(
          e.target.descriptionEn.value
        );
        let curData = {};
        // first upload the image if there's a change
        if (e.target.image.files[0] != null) {
          // image is uploaded
          const uploadRoute =
            process.env.NODE_ENV == "production"
              ? process.env.NEXT_PUBLIC_UPLOAD_PRO
              : process.env.NEXT_PUBLIC_UPLOAD_DEV;
          let key = data.image.split("/")[3];
          key = key.split(".")[0];
          let dataURI;

          await fileToDataUri(e.target.image.files[0]).then((x) => {
            dataURI = x;
          });

          const buffer = Buffer.from(
            dataURI.substring(dataURI.indexOf(",") + 1)
          );
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

          await fetch(uploadRoute + `uploadItem?key=${key}`, {
            method: "POST",
            headers: {
              Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
              "Cache-Control": "no-store",
            },
            body: dataURI,
          }).then(() => {
            console.log("Uploaded image!");
          });
        }

        // then check for all the values in the form, if
        // there's anything that's different than the defaultvalue,
        // then we know the user has altered the form, which means
        // they wish to update the item's information

        let listToCheckForm = [
          e.target.price.value,
          e.target.quantity.value,
          e.target.imageTitle.value,
          e.target.imageTitleEn.value,
          e.target.imageTitleZhc.value,
          e.target.description.value,
          e.target.descriptionEn.value,
          e.target.descriptionZhc.value,
          e.target.type.value,
        ];
        let listToCheckData = [
          data.price,
          data.quantity,
          data.imageTitle,
          data.imageTitleEn,
          data.imageTitleZhc,
          data.description,
          data.descriptionEn,
          data.descriptionZhc,
          data.type,
        ];
        let listName = [
          "price",
          "quantity",
          "imageTitle",
          "imageTitleEn",
          "imageTitleZhc",
          "description",
          "descriptionEn",
          "descriptionZhc",
          "type",
        ];

        for (let i = 0; i < listToCheckForm.length; i++) {
          if (listToCheckForm[i] != listToCheckData[i]) {
            // user altered the item
            // add this new item into the curData, object
            // which will be sent to the backend
            data[listName[i]] = listToCheckForm[i];
            curData[listName[i]] = listToCheckForm[i];
          }
        }

        if (Object.keys(curData).length != 0) {
          // form is not empty
          console.log("Object length is:", Object.keys(curData).length);
          curData["id"] = data._id;
          const editRoute =
            process.env.NODE_ENV == "production"
              ? process.env.NEXT_PUBLIC_UPLOAD_PRO
              : process.env.NEXT_PUBLIC_UPLOAD_DEV;
          await fetch(editRoute + "edit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
              "Cache-Control": "no-store",
            },
            body: JSON.stringify(curData),
          });
        } else {
          console.log("you didn't change anything... anakin");
        }
        setPopup(false);
        setAllowClick(true);
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
    });
  }

  async function handleDelete() {
    Swal.fire({
      title: "Are you sure you want to delete this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setAllowClick(false);
        console.log("deleted!");
        const deleteRoute =
          process.env.NODE_ENV == "production"
            ? process.env.NEXT_PUBLIC_UPLOAD_PRO
            : process.env.NEXT_PUBLIC_UPLOAD_DEV;

        let res = await fetch(deleteRoute + `delete?id=${data._id}`, {
          method: "DELETE",
          headers: {
            Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          Swal.fire({
            title: "Oops!",
            text: "Something's wrong, please contact the boss/bernard!",
            icon: "error",
            color: "#1e293b",
            // showConfirmButton: false,
            confirmButtonColor: "#1e293b",
          });
        } else {
          Swal.fire("Deleted!", "Your file has been deleted.", "success");
        }
        setAllowClick(true);
      }
    });
  }
  function renderTitle() {
    return language == 1
      ? data.imageTitleEn
      : language == 2
      ? data.imageTitle
      : data.imageTitleZhc;
  }

  return (
    <>
      {popup ? (
        <div
          className={` ${styles.itemBox}  fixed  top-0 left-0 right-0 bottom-0  z-10 w-[100vw] h-[100vh] flex justify-center items-center`}
        >
          {allowClick ? (
            <></>
          ) : (
            <div className="w-full h-full top-0 right-0 bottom-0 left-0 bg-black opacity-50	fixed z-50 flex justify-center items-center">
              <LoadingIcons.Oval height={300} width={300} />
            </div>
          )}
          <div className="fixed  flex flex-col  justify-start items-start w-[80vw] overflow-scroll h-[90vh] rounded-xl shadow-2xl bg-white ">
            <div className="absolute flex justify-end h-fit w-full top-5 right-5">
              <MdCancel
                onClick={() => setPopup(false)}
                className="text-5xl text-red-600 hover:text-red-400 cursor-pointer"
              ></MdCancel>
            </div>
            <div className="w-full h-full">
              <div className="flex w-full justify-center items-center text-center text-5xl font-bold pt-[0.5em]">
                Edit
              </div>
              <form onSubmit={(e) => handleSubmit(e)}>
                <div className="flex flex-row justify-center p-2 m-2">
                  <div>
                    <div className="flex flex-row justify-start my-[0.5em]">
                      <div className="flex flex-col mx-2">
                        <label htmlFor="price">Price (RM):</label>
                        <input
                          defaultValue={data.price}
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
                          defaultValue={data.quantity}
                          className="rounded shadow-xl p-1 border border-black"
                          required
                          type="number"
                          min="0"
                          name="quantity"
                        ></input>
                      </div>
                    </div>

                    <div className="flex flex-col mx-2 my-[0.5em]">
                      <label htmlFor="imageTitleEn">
                        Image Name (English):
                      </label>
                      <input
                        defaultValue={data.imageTitleEn}
                        required
                        className="w-full rounded shadow-xl p-1 border border-black"
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
                        defaultValue={data.imageTitle}
                        required
                        className="w-full rounded shadow-xl p-1 border border-black"
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
                        defaultValue={data.imageTitleZhc}
                        required
                        className="w-full rounded shadow-xl p-1 border border-black"
                        type="text"
                        min="0"
                        name="imageTitleZhc"
                        minLength="1"
                      ></input>
                    </div>

                    <div className="flex flex-col mx-2 my-[0.5em]">
                      <label htmlFor="descriptionEn">
                        Description (English):
                      </label>
                      <textarea
                        defaultValue={data.descriptionEn}
                        required
                        className="rounded shadow-xl p-1 border border-black h-[10vh]"
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
                        defaultValue={data.description}
                        className="rounded shadow-xl p-1 border border-black h-[10vh]"
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
                        defaultValue={data.descriptionZhc}
                        className="rounded shadow-xl p-1 border border-black h-[10vh]"
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
                        defaultValue={data.type}
                        required
                        className="w-fit rounded shadow-xl p-1 border border-black "
                        name="type"
                      >
                        <option value="1"> Fresh</option>
                        <option value="2"> Condensed</option>
                        <option value="3"> Dry</option>
                        <option value="4"> Strips</option>
                        <option value="5"> Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col mx-2 my-[0.5em]">
                    <h3 className="text-3xl font-bold pb-2">Current Image</h3>
                    <div className="relative h-[30em] w-[25em] shadow-xl mb-2">
                      <Image
                        src={data.image}
                        layout="fill"
                        objectFit="cover"
                      ></Image>
                    </div>
                    <label htmlFor="image" className="text-xl">
                      Upload a new image:
                    </label>
                    <input
                      className="my-[0.5em]"
                      type="file"
                      id="image"
                      name="image"
                      multiple
                      accept="image/*"
                    ></input>

                    <div className="w-full items-center text-center justify-center my-[0.5em]">
                      <input
                        type="submit"
                        className="rounded py-2 px-4 m-2 text-slate-800 text-4xl cursor-pointer hover:bg-green-300 transition-all bg-green-400 shadow-2xl"
                      ></input>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <div
        onClick={handleClick}
        className="cursor-pointer flex flex-col m-[0.5em] p-2 justify-center items-center text-center "
      >
        <h2 className="text-2xl pb-[1em] underline ">{renderTitle()}</h2>
        <div className=" h-[20em] w-[20em] relative shadow-2xl border border-black mb-[2em]">
          <Image
            alt={data.imageAlt}
            src={data.image}
            layout="fill"
            objectFit="cover"
          ></Image>
        </div>
      </div>
    </>
  );
};

export default ViewItem;
