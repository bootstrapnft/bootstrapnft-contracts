// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract MockERC721 is ERC721 {

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
    }


    function publicMint(address to, uint256 tokenId) public virtual {
        _safeMint(to, tokenId, "");
    }
}