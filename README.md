# OpenCash

OpenCash is a feature loaded DAO

- Submit Proposals
- Vote on Proposals
- Delegate votes
- Upgradable contracts
  - Add
  - Remove
  - Replace


## Table of Contents
1. [OpenCashDAO contracts](#opencashdao-contracts)
2. [Delegate contract](#delegate-contract)
3. [Upgradable Contract](#upgradable-contract)


## OpenCashDAO contracts

- Controller contract
  - This has the nfts that have the locking bytecode of all the contracts within the DAO.
- Voting contract
  - Allows anyone to vote on a proposal.
- Retract Voting Contract
  - Used for retracting votes anytime, both during the proposal is running or after it has ended.
- Submit Proposal Contracts
  - Add
  - Remove
  - Replace
- Apply Proposal Contracts
  - Add
  - Remove
  - Replace
- Burn Proposal Contract
  - If a proposal has not been successful in collecting enough votes it can be burned. Both the VoteProposalNFT and TimeProposalNFT are burned.

## Delegate contract

This contract allows a user to delegate their votes to another user.


## Upgradable Contract

This is a single contract that has the abolity to call multiple contracts.
The DAO controlls what contracts are accessable by the OpenCash contract.
