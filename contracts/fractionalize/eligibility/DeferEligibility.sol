// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Eligibility.sol";
import "../interface/IPrevContract.sol";

contract DeferEligibility is Eligibility {

    function name() public pure override virtual returns (string memory) {    
        return "Defer";
    }

    function finalized() public view override virtual returns (bool) {    
        return true;
    }

    function targetAsset() public pure override virtual returns (address) {
        return address(0);
    }

    address public deferAddress;
    uint256 public deferVaultId;

    event EligibilityInit(address deferAddress, uint256 deferralVaultId);

    struct Config {
        address deferAddress;
        uint256 deferVaultId;
    }

    function __Eligibility_init_bytes(
        bytes memory configData
    ) public override virtual initializer {
        (address _deferAddress, uint256 _deferId) = abi.decode(configData, (address, uint256));
        __Eligibility_init(_deferAddress, _deferId);
    }

    // Parameters here should mirror the config struct. 
    function __Eligibility_init(
        address _deferAddress,
        uint256 _deferVaultId
    ) public initializer {
        require(_deferAddress != address(0), "deferAddress != address(0)");
        deferAddress = _deferAddress;
        deferVaultId = _deferVaultId;
        emit EligibilityInit(_deferAddress, _deferVaultId);
    }

    function _checkIfEligible(
        uint256 _tokenId
    ) internal view override virtual returns (bool) {
        return IPrevContract(deferAddress).isEligible(deferVaultId, _tokenId);
    }
}
