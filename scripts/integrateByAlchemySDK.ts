import {Network, Utils, Wallet, Alchemy} from "alchemy-sdk";
import config from "../config.json";
import contractArtifacts from "../artifacts/contracts/ERC721NFT.sol/ERC721NFT.json";
import {TransactionRequest} from "@ethersproject/providers";
import {ethers} from "ethers";

const settings = {
    apiKey: config.APIKey,
    network: Network.ETH_SEPOLIA
};

interface FunctionName {
    [key: string]: string;
}

const web3 = new Alchemy(settings);
const wallet = new Wallet(config.privateKey, web3);

async function integrateAlchemySDK() {
    // 获取给出地址的所有的NFT
    const allNFTs = await web3.nft.getNftsForOwner(config.publicKey);
    console.log(allNFTs);
    // // 根据tokenID获取Owner
    const owner = await web3.nft.getOwnersForNft(config.contractAddress, 0);
    console.log(owner);
    // // 根据合约获取所有owner
    const owners = await web3.nft.getOwnersForContract(config.contractAddress, {
        withTokenBalances: true
    });
    console.log(owners);
    
    // 调用会改变链上状态的方法
    // 解析ABI
    const contractInterface = new Utils.Interface(contractArtifacts.abi);
    const functionName: FunctionName = {};
    for (let k in contractInterface.functions) {
        if (Object.prototype.hasOwnProperty.call(contractInterface.functions, k)) {
            functionName[contractInterface.functions[k].name as string] = k;
        }
    }
    // 对方法进行ABI编码
    const safeMintEncoded = contractInterface.encodeFunctionData("safeMint", [config.publicKey, "ipfs://QmbUiW4nYKPzdXQB6nrpcAw4Ya7b1JmVQMekBcfCQAbRQF"])
    console.log(safeMintEncoded);
    // 获取nonce
    const nonce = await web3.core.getTransactionCount(
        wallet.address,
        "latest"
    );
    // 获取gasPrice，是必要的一步，不获取会抛出Transaction Underpriced错误
    const gasPrice = (await web3.core.getFeeData()).gasPrice;
    const transaction = {
        from: config.publicKey,
        to: config.contractAddress,
        gasLimit: 21000000,
        data: safeMintEncoded,
        nonce,
        gasPrice
    }
    const signedTransact = await wallet.signTransaction(transaction as TransactionRequest);
    const sentTX = await (await web3.core.sendTransaction(signedTransact)).wait();
    console.log(sentTX);
    // 获取事件日志
    const SafeMintReturnValue = contractInterface.encodeFilterTopics("SafeMintReturnValue", []);
    const logs = await web3.core.getLogs({
        toBlock: "latest",
        address: config.contractAddress,
        topics: SafeMintReturnValue
    });
    console.log("日志: ");
    console.log(logs[0].data);
    
    // call不能调用改变链上状态的方法
    const messageABIEncoded = contractInterface.encodeFunctionData("getDescription");
    const resHex = (await web3.core.call({
        from: config.publicKey,
        to: config.contractAddress,
        data: messageABIEncoded,
        nonce: await wallet.getTransactionCount()
    }));
    console.log(resHex);
    // 解析字符串
    console.log(ethers.utils.toUtf8String(resHex));
}

integrateAlchemySDK();