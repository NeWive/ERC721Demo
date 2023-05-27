import { HardhatUserConfig } from "hardhat/config";
import config from "./config.json";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";

const hardhatUserConfig: HardhatUserConfig = {
    solidity: "0.8.18",
    networks: {
        "sepolia": {
            url: config.alchemyHTTPURL,
            accounts: [config.privateKey]
        }
    }
};

export default hardhatUserConfig;
