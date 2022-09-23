## Introduction

BootstrapNFT improves the liquidity of NFT projects by fragmenting NFTs. It allows more people to trade NFTs at lower prices, enabling more investors to own coveted early-stage blue-chip NFTs. at the same time, it creates a price floor by creating vToken with similar prices, making it easy for investors to redeem original NFT assets.

##  PrimaryContract
### Fractionalize
* VaultFactory
* Vault
* LPStaking
### Auction
* ConfigurableRightsPool
* CRPFactory
* BFactory
* ProxyRegistry
* ExchangeProxy
* BActions

## Contract Addresses
### mumbai
* VaultFactory: 0x943E2F2Ac714Ee8dcFCd15E18F7F7369b3FC6710
* BFactory address: 0x40eE0FEe44B2B42f157123aE46fb9bAfeA02F986
* CRPFactory address: 0xf365f2dA5DF4583015782E4A64F80ad6cce0A7Bd
* BActions address: 0x6Db6a05FE299FB93642f9DeDBd9CCDEd999b4Dfa
* ExchangeProxy address: 0x28D5277Cc372410C63bC6dc3a3E456dE5d313410
* ProxyRegistry address: 0x6ce014F681AD929144e387A3647016998E269966

## Test
### Fractionalize
* Should allow vault creation
* Should allow all vault features
* Should not allow minting after pausing
* Should allow owner to unpause minting
* Should allow owner to unpause redeeming
* Should allow minting
* Should allow redeeming
* Should allow me to swap ERC721
* Should allow me to swap random ERC721
* Should allow me to swap ERC1155
### Auction
* should create proxy
* should create pool
* should add liquidity multi assets
* should remove liquidity multi assets
* should add liquidity single assets
* should remove liquidity single assets
* should direct increase weight
* should direct decrease weight
* should gradually update Weight
* should swap in
* should swap by sor
