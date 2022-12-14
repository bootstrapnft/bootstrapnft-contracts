// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Eligibility.sol";

// Maybe use guardian here?
contract RangeEligibility is Eligibility {
    function name() public pure override virtual returns (string memory) {
        return "Range";
    }

    function finalized() public view override virtual returns (bool) {
        return true;
    }

    function targetAsset() public pure override virtual returns (address) {
        return address(0);
    }

    uint256 public rangeStart;
    uint256 public rangeEnd;

    struct Config {
        uint256 rangeStart;
        uint256 rangeEnd;
    }
    event RangeSet(uint256 rangeStart, uint256 rangeEnd);
    event EligibilityInit(
        uint256 rangeStart,
        uint256 rangeEnd
    );

    function __Eligibility_init_bytes(bytes memory _configData)
        public
        override
        virtual
        initializer
    {
        (uint256 _rangeStart, uint256 _rangeEnd) = abi.decode(_configData, (uint256, uint256));
        __Eligibility_init(_rangeStart, _rangeEnd);
    }

    function __Eligibility_init(
        uint256 _rangeStart,
        uint256 _rangeEnd
    ) public initializer {
        require(_rangeStart <= _rangeEnd, "start > end");
        rangeStart = _rangeStart;
        rangeEnd = _rangeEnd;
        emit RangeSet(_rangeStart, _rangeEnd);
        emit EligibilityInit(_rangeStart, _rangeEnd);
    }

    function _checkIfEligible(uint256 _tokenId)
        internal
        view
        override
        virtual
        returns (bool)
    {
        return _tokenId >= rangeStart && _tokenId <= rangeEnd;
    }
}
