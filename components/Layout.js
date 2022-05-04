import styles from "../styles/Layout.module.css";
import NavBar from "./NavBar";
import Footer from "./Footer";
/** Reason to use Layout:
 * For example, you need a navbar every page
 * and that navbar will stick to everypage.
 */
const Layout = ({ children }) => {
  return (
    <>
      <NavBar />
      <div className="">
        <main className=""> {children}</main>
      </div>
      <Footer />
    </>
  );
};

export default Layout;
