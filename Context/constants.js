import {ethers} from "ethers"
import web3Modal from "web3modal"

import ERC20Generator from "./ERC20Generator.json"
import icoMarketplace from "./icoMarketplace.json"

export const ICO_MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_ICO_MARKETPLACE_ADDRESS;
export const ICO_MARKETPLACE_ABI = icoMarketplace;

//PINATTA KEY
export const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
export const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRECT_KEY;

//NETWORKS
const networks = {
    polygon_amoy: {
        chainId: `0x${Number(8002).toString(16)}`,
        chainName: "Polygon Amoy",
        nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimails: 18,
        },
        rpcUrls: ["https://rpc-amoy.polygon.technology"],
        blockExplorerUrls: ["https://www.oklink.com/amoy"],
    },
    polygon: {
        chainId: `0x${Number(137).toString(16)}`,
        chainName: "Polygon Mainnet",
        nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimails: 18,
        },
        rpcUrls: ["https://rpc-ankr.com/polygon"],
        blockExplorerUrls: ["https:/polygonscan.com/"],
    },
    bsc: {
        chainId: `0x${Number(56).toString(16)}`,
        chainName: "Binance Mainnet",
        nativeCurrency: {
            name: "Binance Chain",
            symbol: "BNB",
            decimails: 18,
        },
        rpcUrls: ["https://rpc-ankr.com/polygon"],
        blockExplorerUrls: ["https:/polygonscan.com/"],
    },
    bsc: {
        chainId: `0x${Number(56).toString(16)}`,
        chainName: "Base Mainnet",
        nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimails: 18,
        },
        rpcUrls: ["https://mainnet.base.org"],
        blockExplorerUrls: ["https:/bscscan.com/"],
    },
};


const changeNetwork = async({networkName}) => {
    try{
        if (!window.ethereum) throw new Error("No crypto wallet found");
        await window.ethereum.request({
            method: "wallet_addEtheriumChain",
            params: [
                {
                  ...networkName[networkName],
            },
                
            ],
        });
    } catch (error) {
        console.log(error);
    }
};

export const handleNetworkSwitch = async () => {
    const networkName = "polygon_amoy";
    await changeNetwork({networkName});
}

