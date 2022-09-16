// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Imports

import ".././libraries/BootstrapNftSafeMath.sol";

// Contracts

/*
 * @author BootstrapNft Labs
 * @title Wrap BootstrapNftSafeMath for testing
*/
contract BootstrapNftSafeMathMock {
    function bmul(uint a, uint b) external pure returns (uint) {
        return BootstrapNftSafeMath.bmul(a, b);
    }

    function bdiv(uint a, uint b) external pure returns (uint) {
        return BootstrapNftSafeMath.bdiv(a, b);
    }

    function bsub(uint a, uint b) external pure returns (uint) {
        return BootstrapNftSafeMath.bsub(a, b);
    }

    function badd(uint a, uint b) external pure returns (uint) {
        return BootstrapNftSafeMath.badd(a, b);
    }

    function bmod(uint a, uint b) external pure returns (uint) {
        return BootstrapNftSafeMath.bmod(a, b);
    }

    function bmax(uint a, uint b) external pure returns (uint) {
        return BootstrapNftSafeMath.bmax(a, b);
    }

    function bmin(uint a, uint b) external pure returns (uint) {
        return BootstrapNftSafeMath.bmin(a, b);
    }

    function baverage(uint a, uint b) external pure returns (uint) {
        return BootstrapNftSafeMath.baverage(a, b);
    }
}