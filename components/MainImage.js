import React, { useRef } from "react";
import Image from "next/image";
const MainImage = ({ num }) => {
  let inputRef = useRef();

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

    console.log("handling submit...");
    if (!inputRef.current.files[0]) {
      console.log("Submission is empty.");
      return;
    }
    let dataURI;
    await fileToDataUri(inputRef.current.files[0]).then((x) => {
      dataURI = x;
    });
    console.log(dataURI);
    const uploadRoute =
      process.env.NODE_ENV == "production"
        ? process.env.NEXT_PUBLIC_UPLOAD_PRO
        : process.env.NEXT_PUBLIC_UPLOAD_DEV;

    // const { data } = await fetch(uploadRoute + `getURL?num=${num}`, {
    //   headers: {
    //     Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_HEADER,
    //   },
    // }).then((res) => res.json());
    // let { url, fields } = data;
    // console.log("URL IS:", url);
    // const body = new FormData();
    // Object.entries({ ...fields, file }).forEach(([key, value]) => {
    //   body.append(key, value);
    // });
    // // body.append("file", file);
    // await fetch(url, {
    //   method: "POST",
    //   body: inputRef.current.files[0],
    //   // body,
    // })
    //   .then(() => {
    //     console.log("Done!");
    //   })
    //   .catch((err) => {
    //     console.log("Error in uploading image:", err);
    //   });
    // const body = new FormData();
    // body.append("file", inputRef.current.files[0]);
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
  }

  return (
    <div className="flex flex-col justify-between bg-slate-200 w-full p-5">
      <div className="flex flex-col  text-center items-center ">
        <h3 className="text-3xl pb-[0.5em] underline">Current Image {num}</h3>
        <div className="relative h-[25em] w-[30em] mx-[1em] mb-[1em] rounded border border-solid border-black">
          <Image
            alt={`current_image${num}`}
            src={`https://${process.env.NEXT_PUBLIC_cloudFrontURL}/main_aimg${num}.jpg`}
            layout="fill"
            objectFit="contain"
            className="rounded"
          ></Image>
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
