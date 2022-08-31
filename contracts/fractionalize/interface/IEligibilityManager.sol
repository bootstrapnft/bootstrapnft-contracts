// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IEligibilityManager {
    function nftxVaultFactory() external returns (address);
    function eligibilityImpl() external returns (address);

    function deployEligibility(uint256 vaultId, bytes calldata initData)
        external
        returns (address);
}
