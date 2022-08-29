const {ethers} = require("hardhat");


async function getCurrentBlockTime() {
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const timestamp = block.timestamp;
    return timestamp
}

async function setBlockTime(blockTime) {
    let params = [blockTime]
    await ethers.provider.send('evm_setNextBlockTimestamp', params);
    await ethers.provider.send('evm_mine', []);
}

async function increaseBlockTime(increaseTime) {
    let params = [increaseTime]
    await ethers.provider.send('evm_increaseTime', params);
    await ethers.provider.send('evm_mine', []);
}


async function advanceBlock() {
    return ethers.provider.send("evm_mine", [])
}

async function advanceBlockTo(blockNumber) {
    for (let i = await ethers.provider.getBlockNumber(); i < blockNumber; i++) {
        await advanceBlock()
    }
}

module.exports = {
    getCurrentBlockTime, setBlockTime, increaseBlockTime, advanceBlockTo, advanceBlock
};
