// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../VaultFactoryUpgradeable.sol";

// Authors: @0xKiwi_ and @alexgausman.

contract VaultFactoryUpgradeable2 is VaultFactoryUpgradeable {
    function twiceNumVaults() public view returns (uint256) {
        return vaults.length * 2;
    }
}
