import React, { useState, useContext, createContext, useEffect, Children } from "react";
import { ethers } from "ethers";
import web3Modal from "web3modal";
import toast from "react-hot-toast";

//INTERNAL IMPORT
import {
    ERC20Generator,
    ERC20Generator_BYTECODE,
    handleNetworkSwitch,
    shortenAddress,
    ICO_MARKETPLACE_ADDRESS,
    ICO_MARKETPLACE_CONTRACT,
    TOKEN_CONTRACT,
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
} from "./constants"

const StateContext = createContext();

export const StateContextProvider = ({ Children }) => {

    //STATE VARIABLES
    const [address, setAddress] = useState();
    const [accountBalance, setAccountBalance] = useState(null);
    const [loader, setLoader] = useState(false);
    const [reCall, setRecall] = useState(0);
    const [currency, setCurrency] = useState("MATIC")

    //COMPONENT STATE VARIABLES
    const [openBuyToken,setOpenBuyToken] = useState(false);
    const [openWidthdrawToken, setOpenWidthdrawToken] = useState(false);
    const [openTransferToken, setOpenTransferToken] = useState(false);
    const [openTokenCreator, setOpenTokenCreator] = useState(false);
    const [openCreateICO, setOpenCreateICO] = useState(false);

    return <StateContext.Provider value={{}}>{Children}</StateContext.Provider>;
};