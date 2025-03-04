# OpenCashDAO

> **Note:** This project is currently under active development. Features and functionalities are subject to change.

## Summary

OpenCashDAO is a feature-rich decentralized autonomous organization (DAO) template, designed to empower stakeholders to influence the project's direction. It serves as a proposal and voting platform for the community, enabling them to vote on various proposals to modify the project's functionality.

- DAO
- Proposals
- Voting on Proposals by stakeholders
- Upgradable Project

## Summary

- Anyone is allowed to submit new proposals to the DAO. The proposals can only have one of three properties i.e to add, remove, or replace functionality.
- Once a proposal is submitted, the timer starts and the proposal is open for voting.
- The proposal runs for a set period of time and once the timer is up, the proposal can be executed. Depending upon the number of votes, the proposal is considered passed or failed. Once a proposal is passed, it can be executed by anyone, applying the new changes to the project.
- The DAO's contracts are static, but the projects it controls is upgradable in nature.

## Table of Contents
1. [DAO contracts](#dao-contracts)
    - [Controller contract](#controller-contract)
    - [Submit Proposal Contracts](#submit-proposal-contracts)
      - [AddThreads.cash](#addthreadscash)
      - [RemoveThreads.cash](#removethreadscash)
      - [ReplaceThreads.cash](#replacethreadscash)
    - [Voting contract](#voting-contract)
    - [Retract Voting Contract](#retract-voting-contract)
    - [DelegateFactory contract](#delegatefactory-contract)
    - [Execute Proposal Contracts](#execute-proposal-contracts)
      - [Add.cash](#addcash)
      - [Remove.cash](#removecash)
      - [Replace.cash](#replacecash)
      - [Fail.cash](#failcash)
2. [Upgradable Project Contract](#upgradable-project-contract)
3. [Cashtokens](#cashtokens)
    - [AuthorizedThreadNFTs](#authorizedthreadnfts)
    - [MintingNFTs](#mintingnfts)
    - [ProposalCounterNFT](#proposalcounternft)
    - [TimeProposalNFT](#timeproposaltnft)
    - [VoteProposalNFTs](#voteproposalnfts)
    - [UpgradableContractNFT](#upgradablecontractnft)
    - [VoteNFT](#votenft)
4. [FAQs](#faqs)

### DAO contracts

DAO is a system of 11 contracts interacting with each other.

#### Controller contract
  - The Controller contract functions as the control and storage hub for the DAO. It holds authorizedThreadNFTs, proposalCounterNFTs and mintingNFTs.

### Submit Proposal Contracts

#### AddThreads.cash
The AddThreads.cash contract is used to submit proposal that adds new authorizedThreadNFTs to the Upgradable Project Contract.

#### RemoveThreads.cash
The RemoveThreads.cash contract is used to submit proposal that removes authorizedThreadNFTs from the Upgradable Project Contract.

#### ReplaceThreads.cash
The ReplaceThreads.cash contract is used to submit proposal that replaces authorizedThreadNFTs in the Upgradable Project Contract.

#### Voting contract
Allows anyone to vote on an active proposal.

#### Retract Voting Contract
Allows anyone to retract their votes from an proposal. Active or inactive.

### Execute Proposal Contracts

#### Add.cash
Adds new authorizedThreadNFTs to the Upgradable Project Contract.

#### Remove.cash
Removes authorizedThreadNFTs from the Upgradable Project Contract.

#### Replace.cash
Replaces authorizedThreadNFTs in the Upgradable Project Contract.

#### Fail.cash
Disables the proposal and allows anyone to take the commitmentDeposit back.

## DelegateFactory contract
Each delagate has a Delegate Contract

## Upgradable Contract

This is a single contract with the ability to call multiple contracts. The DAO controls which contracts are accessible by the OpenCash contract.

### Cashtokens

The contracts talk to each other through cashtokens. There are a few types in this system:

#### AuthorizedThreadNFTs
These are immutable NFTs used to manage threads for various proposal actions.
  - `category`: daoCategory
  - `commitment`: 35 bytes < lockingbytecode >

AuthorizedThreadNFTs:
  - **submissions:AddThreads**: (~x threads)
  - **submissions:ReplaceThreads**: (~x threads)
  - **submissions:RemoveThreads**: (~x threads)
  - **execute:Add**: (~x threads)
  - **execute:Remove**: (~x threads)
  - **execute:Replace**: (~x threads)
  - **execute:Fail**: (~x threads)
  - **Vote**: (~x threads)
  - **RetractVote**: (~x threads)

#### MintingNFTs
ProposalMintingNFT [~x threads]
ProjectMintingNFT [1 thread]

#### ProposalCounterNFT
A minting NFT used to count proposals.
  - `category`: daoCategory
  - `commitment`: 4 bytes
  - Allocates 1 thread.

#### TimeProposalNFT
An immutable NFT used to manage the timing of proposals.
  - `category`: daoCategory
  - `commitment`: 29 bytes
  - Allocates 1 thread for each proposal.

#### VoteProposalNFTs
These NFTs can be either mutable or immutable and are created by different proposal contracts.
  - `category`: daoCategory
  - **AddProposal Contract**: Creates a mutable NFT.
    - `commitment`: 40 bytes
  - **RemoveProposal Contract**: Creates an immutable NFT.
    - `commitment`: 6 bytes
  - **ReplaceProposal Contract**: Creates a mutable NFT.
    - `commitment`: 36 bytes

#### UpgradableContractNFT
A minting NFT that allows for contract upgrades.
  - `category`: upgradableCategory
  - `commitment`: 0 bytes
  - Allocates 1 thread.

#### VoteNFT
Each vote cast results in the issuance of a VoteNFT.
  - `category`: daoCategory
  - `commitment`: 12 bytes
  - `breakup`: <ProposalId><VoteAmount>

#### DelegateNFT
A minting NFT used to manage delegates.
  - `category`: daoCategory
  - `commitment`: 12 bytes
  - `breakup`: <ProposalId><VoteAmount>

#### ProjectAuthorizedThreadNFTs
A minting NFT used to manage project threads.
  - `category`: projectCategory
  - `commitment`: 35 bytes
  - Allocates 1 thread.




### FAQs

#### How does it work?

After token distribution, which depends on the party working on the DAO, tokens are used for voting on proposals.

Anyone can submit a proposal by depositing a `commitmentDeposit` amount of BCH.

Proposals run for a `voteWindow` period, after which they can be executed.

If a proposal passes, anyone can execute and interact with the contracts:
- Add
- Remove
- Replace

If a proposal doesn't meet the `voteThreshold`, it can be burned, and the `commitmentDeposit` is sent to the party who burns the proposal. This mechanism prevents spam and ensures serious commitment from proposal creators.

Proposals can also be created by other P2SH contracts or contract systems where communities collectively fund a proposal.

## What does a proposal look like?

Once a proposal is passed, it can be executed by anyone. There are three different behaviors for a proposal:
- Add: An `Add` proposal mints new authorizedThreadNFTs in the `authorizedThreadNFTs` contract, resulting in a new contract being created.
- Remove: A `Remove` proposal burns the `authorizedThreadNFTs`, removing the contract from the `authorizedThreadNFTs` contract.
- Replace: A `Replace` proposal burns the `authorizedThreadNFTs` and mints new ones in the `authorizedThreadNFTs` contract.

#### What is the purpose of the DelegateNFT?

The DelegateNFT is used to manage delegates. It allows a user to delegate their votes to another user.

### How to identify what an NFT represents?

VoteProposalNFT:
  - AddProposalNFT:
    - ActiveVoting:
      - `category`: daoCategory
      - `commitment`: 40 bytes
      - `capability`: mutable
    - CompletedVoting:
      - `category`: daoCategory
      - `commitment`: 40 bytes
      - `capability`: immutable

  - RemoveProposalNFT:
    - ActiveVoting:
      - `category`: daoCategory
      - `commitment`: 6 bytes
      - `capability`: mutable
    - CompletedVoting:
      - `category`: daoCategory
      - `commitment`: 6 bytes
      - `capability`: immutable

  - ReplaceProposalNFT:
    - ActiveVoting:
      - `category`: daoCategory
      - `commitment`: 36 bytes
      - `capability`: mutable
    - CompletedVoting:
      - `category`: daoCategory
      - `commitment`: 36 bytes
      - `capability`: immutable

TimeProposalNFT:
  - `category`: daoCategory
  - `commitment`: 29 bytes
  - `capability`: immutable

VoteNFT:
  - `category`: daoCategory
  - `commitment`: 12 bytes
  - `capability`: immutable

ProposalCounterNFT:
  - `category`: daoCategory
  - `commitment`: 4 bytes
  - `capability`: immutable

AuthorizedThreadNFT:
  - `category`: daoCategory
  - `commitment`: 35 bytes
  - `capability`: immutable

ProjectAuthorizedThreadNFT:
  - `category`: projectCategory
  - `commitment`: 39 bytes
  - `capability`: immutable

ProjectMintingNFT:
  - `category`: projectCategory
  - `commitment`: 0 bytes
  - `capability`: immutable
