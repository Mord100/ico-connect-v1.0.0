import Head from "next/head";
import "../styles/globals.css";
import { Toaster } from "react-hot-toast";

//INTERNAL IMPORT
import { StateContextProvider } from "../Context";

export default function App({ Component, pageProps }) {
  return (
    <>
    <StateContextProvider>
      <Component {...pageProps} />
      <Toaster />
    </StateContextProvider>
    </>
  );
}
