// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ERC721NFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIDCounter;
    uint256 private _tokenNumLimit;
    string private _description;

    event SafeMintReturnValue(uint256);

    constructor(uint256 tokenNumLimit, string memory description) ERC721("ERC721NFT", "Joy") {
        _tokenNumLimit = tokenNumLimit;
        _description = description;
    }

    function safeMint(address target, string memory tokenMetadataURI) public returns (uint256) {
        require(_tokenIDCounter.current() <= _tokenNumLimit, "NFT number reaches the limit");
        uint256 tokenID = _tokenIDCounter.current();
        _tokenIDCounter.increment();
        _safeMint(target, tokenID);
        _setTokenURI(tokenID, tokenMetadataURI);
        emit SafeMintReturnValue(tokenID);
        return tokenID;
    }

    function getDescription() public view returns (string memory) {
        return _description;
    }

    function setDescription(string memory description) public onlyOwner returns (string memory) {
        _description = description;
        return _description;
    }

    // 以下为父类要求实现的接口

    function _beforeTokenTransfer(address from, address to, uint256 firstTokenID, uint batchSize) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenID, batchSize);
    }

    function _burn(uint256 tokenID) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenID);
    }

    function supportsInterface(bytes4 interfaceID) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceID);
    }

    function tokenURI(uint256 tokenID) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenID);
    }
}