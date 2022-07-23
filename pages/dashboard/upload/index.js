import React, { useState, useRef, useEffect, useContext } from "react";
import { permissionContext, userContext } from "../../_app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../../../next-i18next.config";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { AiOutlineEdit } from "react-icons/ai";
import { AiOutlineDelete } from "react-icons/ai";
import Link from "next/link";
import { useRouter } from "next/router";

const Upload = () => {
  const router = useRouter();
  const allowedEmails = ["bernerd@umich.edu", "gzypdykl@gmail.com"];
  const [permission, setPermission] = useContext(permissionContext);
  const [user, setUser] = useContext(userContext);
  const { t } = useTranslation("common");
  // permission check
  return (
    <>
      {permission ? (
        <div className="bg-slate-100 m-[1em] p-5">
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-[4em] underline font-bold">Choose an Action</h2>
            <div>
              <Link href="/dashboard/upload/add" locale={router.locale}>
                <div className="w-full my-[0.75em] text-[3.5em] justify-center flex flex-row items-center bg-slate-600 text-slate-50 hover:bg-slate-400 transition-all shadow-2xl py-2 px-4 rounded cursor-pointer">
                  <h3 className="pr-2">Upload an item</h3>
                  <AiOutlineCloudUpload> </AiOutlineCloudUpload>
                </div>
              </Link>

              <Link href="/dashboard/upload/delete" locale={router.locale}>
                <div className="w-full my-[0.75em] text-[3.5em] justify-center flex flex-row items-center bg-slate-600 text-slate-50 hover:bg-slate-400 transition-all shadow-2xl py-2 px-4 rounded cursor-pointer">
                  <h3 className="pr-2">Delete an item</h3>
                  <AiOutlineDelete> </AiOutlineDelete>
                </div>
              </Link>
              <Link href="/dashboard/upload/edit" locale={router.locale}>
                <div className="w-full my-[0.75em] text-[3.5em] justify-center flex flex-row items-center bg-slate-600 text-slate-50 hover:bg-slate-400 transition-all shadow-2xl py-2 px-4 rounded cursor-pointer">
                  <h3 className="pr-2">Edit an item</h3>
                  <AiOutlineEdit> </AiOutlineEdit>
                </div>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[80vh] flex justify-center items-center text-3xl ">
          You don&apos;t have permission to view this page
        </div>
      )}
    </>
  );
};

export default Upload;
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      // Will be passed to the page component as props
    },
  };
}
