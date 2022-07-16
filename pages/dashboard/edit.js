import React, { useState, useRef, useEffect, useContext } from "react";
import { userContext } from "../_app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import nextI18nextConfig from "../../next-i18next.config";

const Edit = () => {
  const allowedEmails = ["bernerd@umich.edu"];
  const [permission, setPermission] = useState(false);
  const [user, setUser] = useContext(userContext);
  // permission check
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

  return (
    <>
      {permission ? (
        <div>Edit</div>
      ) : (
        <div className="h-[80vh] flex justify-center items-center text-3xl ">
          You don't have permission to view this page
        </div>
      )}
    </>
  );
};

export default Edit;
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
      // Will be passed to the page component as props
    },
  };
}
