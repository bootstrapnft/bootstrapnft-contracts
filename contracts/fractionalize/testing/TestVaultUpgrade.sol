pragma solidity ^0.8.0; 

// SPDX-License-Identifier: MIT

import "../VaultUpgradeable.sol";

contract TestVaultUpgrade is VaultUpgradeable {
   function isUpgraded() public pure returns (bool) { 
     return true;
   }
}