import hardhat from "hardhat";
import path from "path";
import fs from "fs/promises";
import {Config} from "./type";

const configPath = path.resolve("./config.json");

const defaultConfig = {
    "APIKey": "114514",
    "privateKey": "114514",
    "publicKey": "114514",
    "alchemyHTTPURL": "https://eth-sepolia.g.alchemy.com/v2/114514",
    "contractName": "NFT",
    "contractAddress": "",
    "networkName": "sepolia",
    "description": "A ERC721-NFT Demo of NeWive",
    "limit": 10
};

async function readConfig(): Promise<Config> {
    try {
        return JSON.parse((await fs.readFile(configPath)).toString()) as Config;
    } catch (e) {
        console.error(e);
        console.error(`采用默认配置: ${defaultConfig}`);
        return defaultConfig;
    }
}

async function updateContractAddress(config: Config, address: string) {
    try {
        config.contractAddress = address;
        await fs.writeFile(configPath, JSON.stringify(config));
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

async function deploy() {
    const config = await readConfig();
    const ERC721NFTContractFactory = await hardhat.ethers.getContractFactory("ERC721NFT");
    const contractInstance = await ERC721NFTContractFactory.deploy(config.limit, config.description);
    await contractInstance.deployed();
    console.log(`Contract deployed at address: ${contractInstance.address}, owner: ${await contractInstance.signer.getAddress()}`);
    if(await updateContractAddress(config, contractInstance.address)) {
        console.log("Contract address updated successfully");
    }
}

deploy()
    .then(() => {
        console.log("Deployed Succeeded");
    })
    .catch((e) => {
        console.error(e);
    });