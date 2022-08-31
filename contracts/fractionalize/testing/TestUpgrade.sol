// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../VaultFactoryUpgradeable.sol";

contract TestFactoryUpgrade is VaultFactoryUpgradeable {
    function isUpgraded() public pure returns (bool) {
        return true;
    }
}
