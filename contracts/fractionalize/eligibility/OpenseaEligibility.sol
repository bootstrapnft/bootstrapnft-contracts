// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Eligibility.sol";

contract OpenseaEligibility is Eligibility {

    function name() public pure override virtual returns (string memory) {    
        return "Opensea";
    }

    function finalized() public view override virtual returns (bool) {    
        return true;
    }

    function targetAsset() public pure override virtual returns (address) {
        return 0x495f947276749Ce646f68AC8c248420045cb7b5e;
    }

    uint256 public collectionId;

    event EligibilityInit(uint256 collectionId);

    struct Config {
        uint256 collectionId;
    }

    function __Eligibility_init_bytes(
        bytes memory configData
    ) public override virtual initializer {
        (uint256 _collectionId) = abi.decode(configData, (uint256));
        __Eligibility_init(_collectionId);
    }

    // Parameters here should mirror the config struct. 
    function __Eligibility_init(
        uint256 _collectionId
    ) public initializer {
        require(_collectionId != 0, "Can't be 0");
        collectionId = _collectionId;
        emit EligibilityInit(_collectionId);
    }

    function _checkIfEligible(
        uint256 _tokenId
    ) internal view override virtual returns (bool) {
        uint256 _tokenCollectionId = uint160(_tokenId >> 96);
        return _tokenCollectionId == collectionId;
    }
}
