// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Eligibility.sol";

interface IPolymorph {
    function geneOf(uint256 tokenId) external view returns (uint256 gene);
    function lastTokenId() external view returns (uint256 tokenId);
}

contract UglyEligibility is Eligibility {
    function name() public pure override virtual returns (string memory) {
        return "Ugly";
    }

    function finalized() public view override virtual returns (bool) {
        return true;
    }

    function targetAsset() public pure override virtual returns (address) {
        return 0x06012c8cf97BEaD5deAe237070F9587f8E7A266d;
    }

    event EligibilityInit();

    function __Eligibility_init_bytes(
        bytes memory /* configData */
    ) public override virtual initializer {
        __Eligibility_init();
    }

    // Parameters here should mirror the config struct.
    function __Eligibility_init() public initializer {
        emit EligibilityInit();
    }

    function _checkIfEligible(uint256 _tokenId)
        internal
        view
        override
        virtual
        returns (bool)
    {
        uint256 gene = IPolymorph(targetAsset())
            .geneOf(_tokenId);
        return gene == 0;
    }
}
