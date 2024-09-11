import React, {
  useState,
  useContext,
  createContext,
  useEffect,
  Children,
} from "react";
import { ethers } from "ethers";
import web3Modal from "web3modal";
import toast from "react-hot-toast";

//INTERNAL IMPORT
import {
  ERC20Generator_ABI,
  ERC20Generator_BYTECODE,
  handleNetworkSwitch,
  shortenAddress,
  ICO_MARKETPLACE_ADDRESS,
  ICO_MARKETPLACE_CONTRACT,
  TOKEN_CONTRACT,
  PINATA_API_KEY,
  PINATA_SECRET_KEY,
} from "./constants";

const StateContext = createContext();

export const StateContextProvider = ({ Children }) => {
  //STATE VARIABLES
  const [address, setAddress] = useState();
  const [accountBalance, setAccountBalance] = useState(null);
  const [loader, setLoader] = useState(false);
  const [reCall, setRecall] = useState(0);
  const [currency, setCurrency] = useState("MATIC");

  //COMPONENT STATE VARIABLES
  const [openBuyToken, setOpenBuyToken] = useState(false);
  const [openWidthdrawToken, setOpenWidthdrawToken] = useState(false);
  const [openTransferToken, setOpenTransferToken] = useState(false);
  const [openTokenCreator, setOpenTokenCreator] = useState(false);
  const [openCreateICO, setOpenCreateICO] = useState(false);

  const notifySuccess = (msg) => toast.success(msg, { duration: 200 });
  const notifyError = (msg) => toast.error(msg, { duration: 200 });

  //FUNCTIONS
  const checkIfWalletconnected = async () => {
    try {
      if (!window.ethereum) return notifyError("No acount found");
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length) {
        setAddress(accounts[0]);
        const provider = new ethers.providers.Web3Provider(connection);
        const getbalance = await provider.getBalance(accounts[0]);
        const bal = ethers.utils.formatEther(getbalance);
        setAccountBalance(bal);
        return accounts[0];
      } else {
        notifyError("No account found");
      }
    } catch (error) {
      console.log(error);
      notifyError("No account found");
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return notifyError("No acount found");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length) {
        setAddress(accounts[0]);
        const provider = new ethers.providers.Web3Provider(connection);
        const getbalance = await provider.getBalance(accounts[0]);
        const bal = ethers.utils.formatEther(getbalance);
        setAccountBalance(bal);
        return accounts[0];
      } else {
        notifyError("No account found");
      }
    } catch (error) {
      console.log(error);
      notifyError("No account found");
    }
  };

  //MAIN FUNCTION
  const _deployContract = async (
    signer,
     account, 
     name, symbol, 
     supply, 
     imageURL
    ) => {
    try { 
        const factory = new ethers.ContractFactory(
            ERC20Generator_ABI,
            ERC20Generator_BYTECODE,
            signer
        );
        const totalSupply = Number(supply);
        const _initialSupply = ethers.utils.parseEther(
            totalSupply.toString(),
            "ether"
        );

        let contract = await factory.deploy(_initialSupply, name, symbol);l

        const transaction = await contract.deployed();

        if(contract.address){
            const today = Date.new();
            let date = new Date(today);
            const _tokenCreatedDate = date.toLocaleDateString("en-US");

            const _token = {
                account: account,
                supply: supply,
                name: name,
                symbol: symbol,
                tokenAddress: contract.address,
                transactionHash: contract.deployTransaction.hash,
                createdAt: _tokenCreatedDate,
                logo: imageURL,
            };

            const tokenHistory = [];

            const history = localStorage.getItem("TOKEN_HISTORY");
            if(history){
                tokenHistory = JSON.parse(localStorage.getItem("TOKEN_HISTORY"));
                tokenHistory.push(_token);
                localStorage.setItem("TOKEN_HISTORY", tokenHistory);
                setLoader(false);
                setRecall(reCall + 1);
                setOpenTokenCreator(false);
            } else {
                tokenHistory.push(_token);
                localStorage.setItem("TOKEN_HISTORY", tokenHistory);
                setLoader(false);
                setRecall(reCall + 1);
                setOpenTokenCreator(false);
            }
        }

    } catch (error) {
        setLoader(false);
        notifyError("Something went wrong, try again later");
        console.log(error);
    }
  };

  const createERC20 = async (token, account, imageURL) => {
    const {name, symbol, supply} = token;
    try {
        setLoader(true)
        notifySuccess("Creating token...");
        if (!name || !symbol || !supply) {
            notifyError("Data missing");
        } else {
            const web3Modal = new web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();

            _deployContract(signer, account, name, symbol, supply, imageURL)
        }

    } catch (error) {
        setLoader(false);
        notifyError("Something went wrong, try again later");
        console.log(error);
    }
  };

  const GET_ALL_ICOSALE_TOKEN = async () => {
    try {

    } catch (error) {
        console.log(error);
    }
  };

  const GET_ALL_USER_ICOSALE_TOKEN = async () => {
    try {

    } catch (error) {
        console.log(error);
    }
  };

  const createICOSALE = async () => {
    try {

    } catch (error) {
        console.log(error);
    }
  };

  const buyToken = async () => {
    try {

    } catch (error) {
        console.log(error);
    }
  };

  const transferToken = async () => {
    try {

    } catch (error) {
        console.log(error);
    }
  };

  const widthdrawToken = async () => {
    try {

    } catch (error) {
        console.log(error);
    }
  };

  return <StateContext.Provider value={{}}>{Children}</StateContext.Provider>;
};
