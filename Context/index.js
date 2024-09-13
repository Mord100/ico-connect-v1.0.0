import React, {
  useState,
  useContext,
  createContext,
  useEffect,
} from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
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

export const StateContextProvider = ({ children }) => {
  //STATE VARIABLES
  const [address, setAddress] = useState("");
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

  const notifySuccess = (msg) => toast.success(msg, { duration: 2000 });
  const notifyError = (msg) => toast.error(msg, { duration: 2000 });

  //FUNCTIONS
  const checkIfWalletconnected = async () => {
    try {
      if (!window.ethereum) return notifyError("No wallet found");
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length) {
        setAddress(accounts[0]);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const getbalance = await provider.getBalance(accounts[0]);
        const bal = ethers.utils.formatEther(getbalance);
        setAccountBalance(bal);
        return accounts[0];
      } else {
        notifyError("No account found");
        return null;
      }
    } catch (error) {
      console.log(error);
      notifyError("Error checking wallet connection");
      return null;
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return notifyError("No wallet found");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length) {
        setAddress(accounts[0]);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const getbalance = await provider.getBalance(accounts[0]);
        const bal = ethers.utils.formatEther(getbalance);
        setAccountBalance(bal);
        return accounts[0];
      } else {
        notifyError("No account found");
        return null;
      }
    } catch (error) {
      console.log(error);
      notifyError("Error connecting wallet");
      return null;
    }
  };

  //MAIN FUNCTION
  const _deployContract = async (
    signer,
     account, 
     name, 
     symbol, 
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

        let contract = await factory.deploy(_initialSupply, name, symbol);

        const transaction = await contract.deployed();

        if(contract.address){
            const today = new Date();
            const _tokenCreatedDate = today.toLocaleDateString("en-US");

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

            let tokenHistory = [];

            const history = localStorage.getItem("TOKEN_HISTORY");
            if(history){
                tokenHistory = JSON.parse(history);
                tokenHistory.push(_token);
                localStorage.setItem("TOKEN_HISTORY", JSON.stringify(tokenHistory));
                setLoader(false);
                setRecall(reCall + 1);
                setOpenTokenCreator(false);
            } else {
                tokenHistory.push(_token);
                localStorage.setItem("TOKEN_HISTORY", JSON.stringify(tokenHistory));
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
            setLoader(false);
            return;
        }
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        await _deployContract(signer, account, name, symbol, supply, imageURL)
    } catch (error) {
        setLoader(false);
        notifyError("Something went wrong, try again later");
        console.log(error);
    }
  };

  const GET_ALL_ICOSALE_TOKEN = async () => {
    try {
      setLoader(true);
      const address = await connectWallet();
      if(!address) {
        setLoader(false);
        return notifyError("Please connect your wallet");
      }
      const contract = await ICO_MARKETPLACE_CONTRACT();
      const allICOSaleToken = await contract.getAlltokens();
      
      const _tokenArray = await Promise.all(
        allICOSaleToken.map(async(token) => {
          const tokenContract = await TOKEN_CONTRACT(token?.token);

          const balance = await tokenContract.balanceOf(
            ICO_MARKETPLACE_ADDRESS
          );
          return {
            creator: token.creator,
            token: token.token,
            name: token.name,
            symbol: token.symbol,
            supported: token.supported,
            price: ethers.utils.formatEther(token?.price.toString()),
            icoSaleBal: ethers.utils.formatEther(balance.toString()),
          }
      })
    )
      setLoader(false);
      return _tokenArray;
    } catch (error) {
      setLoader(false);
      notifyError("Failed to fetch ICO sale tokens");
      console.log("Error fetching all ICO sale tokens:", error);
      throw error;
    }
  };

  const GET_ALL_USER_ICOSALE_TOKEN = async () => {
    try {
      setLoader(true);
      const address = await connectWallet();
      if(!address) {
        setLoader(false);
        return notifyError("Please connect your wallet");
      }
      const contract = await ICO_MARKETPLACE_CONTRACT();
      const allICOSaleToken = await contract.getTokenCreatedBy(address);
      
      const _tokenArray = await Promise.all(
        allICOSaleToken.map(async(token) => {
          const tokenContract = await TOKEN_CONTRACT(token?.token);

          const balance = await tokenContract.balanceOf(
            ICO_MARKETPLACE_ADDRESS
          );
          return {
            creator: token.creator,
            token: token.token,
            name: token.name,
            symbol: token.symbol,
            supported: token.supported,
            price: ethers.utils.formatEther(token?.price.toString()),
            icoSaleBal: ethers.utils.formatEther(balance.toString()),
          }
      })
    )
      setLoader(false);
      return _tokenArray;
    } catch (error) {
      setLoader(false);
      notifyError("Failed to fetch ICO sale tokens");
      console.log("Error fetching all ICO sale tokens:", error);
      throw error;
    }
  };

  const createICOSALE = async (icoSale) => {
    try {
      const {address, price} = icoSale;
      if(!address || !price) {
        notifyError("Data is missing");
        return;
      }

      setLoader(true);
      notifySuccess("Creating icoSale")
      const userAddress = await connectWallet();
      if (!userAddress) {
        setLoader(false);
        return;
      }

      const contract = await ICO_MARKETPLACE_CONTRACT();

      const payAmount = ethers.utils.parseUnits(price.toString(), "ether");

      const transaction = await contract.createICOSale(address, payAmount, {
        gasLimit: ethers.utils.hexlify(800000),
      })

      await transaction.wait();

      if(transaction.hash) {
        setLoader(false);
        setOpenCreateICO(false);
        setRecall(reCall + 1);
        notifySuccess("ICO Sale created successfully");
      }

    } catch (error) {
      setLoader(false);
      setOpenCreateICO(false);
      notifyError("Something went wrong");
      console.log(error);
    }
  };

  const buyToken = async (tokenAddress, tokenQuantity) => {
    try {
      setLoader(true);
      notifySuccess("Purchasing token...");

      if(!tokenAddress || !tokenQuantity) {
        notifyError("Data is missing");
        return;
      }

      const address = await connectWallet();
      if (!address) {
        setLoader(false);
        return;
      }
      const contract = await ICO_MARKETPLACE_CONTRACT();

      const _tokenBal = await contract.getBalance(tokenAddress);
      const _tokenDetails = await contract.getTokenDetails(tokenAddress);

      const availableToken = ethers.utils.formatEther(_tokenBal.toString());
      
      if(availableToken > 0) {
        const price = ethers.utils.formatEther(_tokenDetails.price.toString()) * Number(tokenQuantity);

        const payAmount = ethers.utils.parseUnits(price.toString(), "ether")

        const transaction = await contract.buyToken(
          tokenAddress,
          Number(tokenQuantity),
          {
            value: payAmount.toString(),
            gasLimit: ethers.utils.hexlify(800000),
          }
        );

        await transaction.wait();
        setLoader(false);
        setRecall(reCall + 1);
        setOpenBuyToken(false);
        notifySuccess("Transaction completed successfully");
      } else {
        setLoader(false);
        setOpenBuyToken(false);
        notifyError("Your balance is 0");
      }

    } catch (error) {
      setLoader(false);
      setOpenBuyToken(false);
      notifyError("Something went wrong");
      console.log(error);
    }
  };

  const transferToken = async (transferTokenData) => {
    try {
      if(
        !transferTokenData.address ||
        !transferTokenData.amount ||
        !transferTokenData.tokenAddress
      ) {
        notifyError("Data missing");
        return;
      }
      setLoader(true);
      notifySuccess("Transaction is processing...");

      const address = await connectWallet();
      if (!address) {
        setLoader(false);
        return;
      }

      const contract = await TOKEN_CONTRACT(transferTokenData.tokenAddress);
      const _availableBal = await contract.balanceOf(address);
      const availableToken = ethers.utils.formatEther(_availableBal.toString());

      if(availableToken > 0){
        const payAmount = ethers.utils.parseUnits(
          transferTokenData.amount.toString(),
          "ether"
        );
        const transaction = await contract.transfer(
           transferTokenData.address,
           payAmount,
        {
          gasLimit: ethers.utils.hexlify(800000),
        }
        );
        await transaction.wait();
        setLoader(false);
        setRecall(reCall + 1);
        setOpenTransferToken(false);
        notifySuccess("Transaction completed successfully");
      } else {
        setLoader(false);
        setRecall(reCall + 1);
        setOpenTransferToken(false);
        notifyError("Your balance is 0")
      }

    } catch (error) {
      setLoader(false);
      setRecall(reCall + 1);
      setOpenTransferToken(false);
      notifyError("Something went wrong");
      console.log(error);
    }
  };

  const widthdrawToken = async (widthdrawQuantity) => {
    try {
      if(
        !widthdrawQuantity.amount ||
        !widthdrawQuantity.token
      ) {
        notifyError("Data is missing");
        return;
      }

      setLoader(true);
      notifySuccess("Transaction is processing...");

      const address = await connectWallet();
      if (!address) {
        setLoader(false);
        return;
      }
      const contract = await ICO_MARKETPLACE_CONTRACT();

      const payAmount = ethers.utils.parseUnits(
        widthdrawQuantity.amount.toString(), "ether"
      );

      const transaction = await contract.widthdrawToken(
        widthdrawQuantity.token,
        payAmount,
        {
          gasLimit: ethers.utils.hexlify(800000),
        }
      );

      await transaction.wait();
      setLoader(false);
      setRecall(reCall + 1);
      setOpenWidthdrawToken(false);
      notifySuccess("Transaction completed successfully");

    } catch (error) {
      setLoader(false);
      setRecall(reCall + 1);
      setOpenWidthdrawToken(false);
      notifyError("Something went wrong")
      console.log(error);
    }
  };

  return (
    <StateContext.Provider 
      value={{
        address,
        accountBalance,
        loader,
        reCall,
        currency,
        openBuyToken,
        openWidthdrawToken,
        openTransferToken,
        openTokenCreator,
        openCreateICO,
        setOpenBuyToken,
        setOpenWidthdrawToken,
        setOpenTransferToken,
        setOpenTokenCreator,
        setOpenCreateICO,
        checkIfWalletconnected,
        connectWallet,
        createERC20,
        GET_ALL_ICOSALE_TOKEN,
        GET_ALL_USER_ICOSALE_TOKEN,
        createICOSALE,
        buyToken,
        transferToken,
        widthdrawToken,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
