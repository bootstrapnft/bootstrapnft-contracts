pragma solidity ^0.8.0;
import "./IBFactory.sol";
// import "@nomiclabs/buidler/console.sol";

contract sorMultiCall {

    // Calls addr with data which returns (uint256)
//    function getUint(address addr, bytes memory data) internal view returns (uint result) {
//        result = 0;
//
//        assembly {
//            let status := staticcall(16000, addr, add(data, 32), mload(data), 0, 0)
//
//        // Success!
//            if eq(status, 1) {
//                if eq(returndatasize(), 32) {
//                    returndatacopy(0, 0, 32)
//                    result := mload(0)
//                }
//            }
//        }
//    }

    function getPoolInfo(address[][] calldata pools, uint length) external view returns (uint[] memory) {
//        uint[] memory results = new uint[](length);
        uint[] memory results = new uint[](length - pools.length);
        uint count = 0;

        for (uint i = 0; i < pools.length; i++) {
            address poolAddr = pools[i][0];

            for (uint j = 1; j < pools[i].length; j++) {
                address tokenAddr = pools[i][j];
                // results[count] = getUint(poolAddr, abi.encodeWithSignature("getBalance(address)", tokenAddr));
                IBPool bpool = IBPool(poolAddr);
                results[count] = bpool.getBalance(tokenAddr);
                count++;
            }
        }

        return results;
    }
}
