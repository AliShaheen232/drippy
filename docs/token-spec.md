# Drippy Token Specification

## Token Details
- **Name:** Drippy Token
- **Ticker:** DRIPPY
- **Total Supply:** 5,890,000,000 DRIPPY
- **Issuer:** [Issuer XRPL Address]

## Tokenomics
### Buy Tax (5%):
- 30%: XRP Rewards to NFT holders (min 5 NFTs)
- 50%: XRP Reflections to DRIPPY holders
- 20%: Team wallet (development/marketing)

### Sell Tax (5%):
- 40%: DRIPPY to liquidity pool
- 40%: XRP to liquidity pool
- 20%: Team wallet (treasury)

> Optional: future buy tax allocation to LP

## Reflection Mechanism
- XRP collected from taxes is redistributed to eligible token/NFT holders
- Rewards handled through XRPL Hooks
- NFT threshold required for rewards: 5+ NFTs

## Hook Architecture Plan
- **Trigger on Buy/Sell:** Hooks detect transfer events
- **Tax Routing Logic:**
  - Split % of XRP and send to different addresses
  - XRP held temporarily before redistribution
- **Configurable Fields:**
  - Buy/Sell tax %
  - Minimum NFT requirement
  - Reflection frequency

## Smart Contract (Hook) Requirements
- Dynamic % routing
- Exclusion addresses (burn, LP, team)
- Efficient XRP airdrop/distribution


## NFT Integration (Planned)
Drippy Token will integrate NFTs for bonus XRP reflections. NFT holders (5+ NFTs) will receive a share of buy tax rewards.

References:
- [XRPL NFT Transfer Tutorial](https://xrpl.org/docs/tutorials/javascript/nfts/transfer-nfts)
