import hardhat from "hardhat";
import config from "../config.json";

async function integrateByHardhat() {
    // 链接合约
    const Contract = await hardhat.ethers.getContractFactory("ERC721NFT");
    const contract = await Contract.attach(config.contractAddress);
    
    // 合约信息
    const name = await contract.name();
    const symbol = await contract.symbol();
    const description = await contract.getDescription();
    console.log(`Contract name: ${name}, Contract symbol: ${symbol}, Description: ${description}`);
    
    // 用户信息
    const signers = await hardhat.ethers.getSigners();
    const owner = signers.splice(0, 1)[0];
    console.log(`Contract Owner: ${owner.address}`);
    const collectors = signers.map(i => i.address);
    console.log(`Contract Collectors: ${collectors.join(",")}`);
    
    // 铸币
    contract.once("SafeMintReturnValue", (tokenID) => {
       console.log(`铸币成功，tokenID为${tokenID}`);
    });
    const tx = (await contract.safeMint(owner.address, "ipfs://QmbUiW4nYKPzdXQB6nrpcAw4Ya7b1JmVQMekBcfCQAbRQF"));
    await tx.wait();
    
    // owner拥有的NFT数量
    const balanceOfOwner = await contract.balanceOf(owner.address);
    console.log(`The balance of the owner: ${balanceOfOwner}`);
    
    // 修改信息
    const tx1 = await contract.setDescription(`${new Date().toLocaleDateString()}`);
    await tx1.wait();
    const nDescription = await contract.getDescription();
    console.log(nDescription);
}

integrateByHardhat();