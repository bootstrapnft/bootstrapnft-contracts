// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./UniqueEligibility.sol";
import "./Eligibility.sol";

contract ListEligibility is Eligibility, UniqueEligibility {
    function name() public pure override virtual returns (string memory) {    
        return "List";
    }

    function finalized() public view override virtual returns (bool) {    
        return true;
    }

    function targetAsset() public pure override virtual returns (address) {
        return address(0);
    }

    struct Config {
        uint256[] tokenIds;
    }

    event EligibilityInit(uint256[] tokenIds);

    function __Eligibility_init_bytes(
        bytes memory _configData
    ) public override virtual initializer {
        (uint256[] memory _ids) = abi.decode(_configData, (uint256[]));
        __Eligibility_init(_ids);
    }

    function __Eligibility_init(
        uint256[] memory tokenIds
    ) public initializer {
        _setUniqueEligibilities(tokenIds, true);
        emit EligibilityInit(tokenIds);
    }

    function _checkIfEligible(
        uint256 _tokenId
    ) internal view override virtual returns (bool) {
        return isUniqueEligible(_tokenId);
    }
}
