// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";


contract MockERC1155 is ERC1155 {

    constructor(string memory uri_) ERC1155(uri_) {
    }

    function publicMint(address to, uint256 tokenId, uint256 amount) public virtual {
        _mint(to, tokenId, amount, "");
    }

    function publicMintBatch(address to, uint256[] memory tokenIds, uint256[] memory amounts) public virtual {
        _mintBatch(to, tokenIds, amounts, "");
    }
}