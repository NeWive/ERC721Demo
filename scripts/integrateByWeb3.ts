import Web3 from "web3";
import config from "../config.json";
import contractArtifacts from "../artifacts/contracts/ERC721NFT.sol/ERC721NFT.json";
import {AbiItem} from "web3-utils";
import {TransactionConfig, EventLog} from "web3-core";

async function integrateByWeb3() {
    // 将alchemyHTTP作为Provider传递给Web3
    const alchemy = new Web3(config.alchemyHTTPURL);
    // 添加一个钱包账号
    const account = alchemy.eth.accounts.wallet.add(config.privateKey);
    // 创建一个合约实例
    const contract = new alchemy.eth.Contract(contractArtifacts.abi as Array<AbiItem>, config.contractAddress);
    // 事件监听
    const safeMintEventListener = await contract
        .events
        .SafeMintReturnValue({
            filter: {},
            fromBlock: "latest"
        });
    
    // 创建交易， works
    // safeMintEventListener.on("data", (e:EventLog) => {
    //     console.log(e.returnValues);
    // });
    // safeMintEventListener.on("connected", function(subscriptionId: EventLog){
    //     console.log(subscriptionId);
    // });
    const gasPrice = await alchemy.eth.getGasPrice();
    const tx: TransactionConfig = {
        from: config.publicKey,
        to: config.contractAddress,
        gasPrice,
        nonce: await alchemy.eth.getTransactionCount(config.publicKey),
        data: contract.methods.safeMint(config.publicKey, "ipfs://1145141910811").encodeABI(),
        gas: 210000
    };
    // 发送交易，如果该交易是通过一个存在的账号发送则会自动签署
    const response = await alchemy.eth.sendTransaction(tx);
    console.log(response);
    
    // 通过签署交易然后发送
    console.log(await contract.methods.getDescription().call());
    const tx1: TransactionConfig = {
        from: config.publicKey,
        to: config.contractAddress,
        gasPrice,
        nonce: await alchemy.eth.getTransactionCount(config.publicKey),
        data: contract.methods.setDescription("你是一个一个一个").encodeABI(),
        gas: 210000
    }
    const signedTX = await account.signTransaction(tx1);
    const res1 = await alchemy.eth.sendSignedTransaction(signedTX.rawTransaction as string);
    console.log(res1);
    console.log(await contract.methods.getDescription().call());
    
    // Not Work, 只获取到返回值而sepolia etherscan中没有mint记录，call不会改变链上的状态
    // const tx = await contract.methods.safeMint(config.publicKey, "ipfs://1145141910811").call();
    // console.log(tx);
}

integrateByWeb3();
