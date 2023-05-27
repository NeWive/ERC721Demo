import hardhat from "hardhat";
import chai from "chai";
import config from "../config.json";
import {expect} from "chai";

describe("ERC721MFT", function () {
    before(async function () {
        this.Contract = await hardhat.ethers.getContractFactory("ERC721NFT");
    });
    
    beforeEach(async function () {
        try {
            this.contract = await this.Contract.deploy(config.limit, config.description);
            await this.contract.deployed();
            const signers = await hardhat.ethers.getSigners();
            this.owner = signers.splice(0,1)[0];
            this.collector = signers;
            this.mintCount = 3;
            this.tokenID = [];
            let p = [];
            for(let i = 0; i < this.mintCount; ++i) {
                p.push(this.contract.safeMint(this.collector[i].address, i.toString()));
                this.tokenID.push(i);
            }
            await Promise.all(p);
        } catch (e) {
            console.log(e);
            process.exit(1);
        }
    });
    
    it("Contract Name: ERC721", async function () {
        expect(await this.contract.name()).to.equal("ERC721NFT");
    });
    
    it('合约的Symbol为Joy', async function () {
        expect(await this.contract.symbol()).to.equal("Joy");
    });
    
    it("合约拥有者能正确对应", async function() {
        for(let i = 0; i < this.mintCount; ++i) {
            expect(await this.contract.ownerOf(this.tokenID[i])).to.equal(this.collector[i].address);
        }
    });
    
    it("可以遍历NFT个数", async function () {
        console.log(this.tokenID.length);
        expect((await this.contract.balanceOf(this.collector[0].address)).toString()).to.equal("1");
    });
    
    it("可以铸造新的NFT", async function () {
        const nTokenID = this.tokenID.length;
        await this.contract.safeMint(this.collector[nTokenID].address, nTokenID);
        expect(await this.contract.ownerOf(nTokenID)).to.equal(this.collector[nTokenID].address);
    });
    
    it("触发SafeMintReturnValue事件", async function () {
        const nTokenID = this.tokenID.length;
        await this.contract.safeMint(this.collector[nTokenID].address, nTokenID);
        expect(await this.contract.ownerOf(nTokenID))
            .to
            .emit(this.contract, "SafeMintReturnValue")
            .withArgs(nTokenID);
    });
    
    it("只能铸造一定次数的NFT", async function () {
        for(let i = 3; i <= 10; ++i) {
            await this.contract.safeMint(this.collector[i].address, i);
        }
        await expect(this.contract.safeMint(this.collector[11].address, "11"))
            .to
            .be
            .revertedWith("NFT number reaches the limit");
    });
    
    it('可以正确展示合约描述', async function () {
        expect(await this.contract.getDescription())
            .to
            .equal(config.description);
    });
    
    it("可以修改合约描述", async function () {
        await this.contract.setDescription("114514");
        expect(await this.contract.getDescription())
            .to
            .equal("114514");
    });
});