// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IERC165Upgradeable.sol";

interface IPrevContract {
    function isEligible(uint256 vaultId, uint256 nftId) external view returns (bool);
}