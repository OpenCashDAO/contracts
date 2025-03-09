# OpenCashDAO

OpenCashDAO is a decentralized autonomous organization (DAO) template for the Bitcoin Cash Blockchain. It is designed to empower stakeholders/token holders to influence the project's direction. It serves as a proposal and voting platform enabling token holders to vote on various proposals to modify the project's functionality.

- **1 DAO, ∞ projects**: A single DAO can control multiple projects.
- **Proposals and Voting by stakeholders**: Anyone can submit proposals and stakeholders/token holders can vote on them.
- **Project Upgradability**: Projects can be dynamically updated through community-approved proposals, allowing for the addition, removal, or replacement of functionalities.


## Table of Contents
1. [DAO contracts](#dao-contracts)
    - [Controller.cash](#controllercash)
    - [SubmitProposal.cash](#submitproposalcash)
    - [Voting.cash](#votingcash)
    - [ExecuteProposal.cash](#executeproposalcash)
2. [Upgradable Project](#upgradable-project)
    - [Coordinator.cash](#coordinatorcash)
3. [Cashtokens](#cashtokens)
    - [AuthorizedThreadNFTs](#authorizedthreadnfts)
    - [MintingNFTs](#mintingnfts)
    - [ProposalCounterNFT](#proposalcounternft)
    - [TimeProposalNFT](#timeproposaltnft)
    - [VoteProposalNFTs](#voteproposalnfts)
    - [UpgradableContractNFT](#upgradablecontractnft)
    - [VoteNFT](#votenft)
4. [License](#license)


### DAO contracts

DAO is a system of 4 contracts where the Controller.cash is the main contract that is part of every transaction that happens in the DAO.

#### Controller.cash
The Controller contract functions as the control and storage hub for the DAO. It holds DAO's [AuthorizedThreadNFTs](#authorizedthreadnfts), [MintingNFTs](#mintingnfts), [VoteProposalNFTs](#proposalnfts), and [TimeProposalNFTs](#proposaltnft).

Constructor:
  - `daoCategory`: The category of the DAO NFTs.

Transaction Structure:
| # | Inputs | Outputs |
|---|--------|---------|
| 0 | [AuthorizedThreadNFT](#authorizedthreadnfts) NFT with authorized contract's locking bytecode as commitment from self | [AuthorizedThreadNFT](#authorizedthreadnfts) back to self |
| 1 | Any UTXO from Authorized contract | UTXO back to Authorized contract |


#### SubmitProposal.cash
Anyone can submit new proposals to the DAO, which can have one of three intentions: to add, remove, or replace functionality. Once a proposal is submitted, a timer starts (`voteWindow`), and the proposal is open for voting. The proposal remains open for a set period, after which it can be executed. Based on the number of votes, the proposal is either passed or failed. If a proposal passes (`voteThreshold` is met), it can be executed by anyone, implementing the new changes to the project. While the DAO's contracts are static, the projects it controls are upgradable in nature.

The proposal requires a `commitmentDeposit` to prevent spam and ensure serious commitment from the proposal creator. Also reducing the risk of vote splitting. It requires a commitment from the creator to ensure that the proposal is widely accepted and socially agreed upon, else they will lose the commitment deposit.

If the proposal passes, the creator gets back the commitment deposit. If the proposal fails, the BCH is sent to anyone who calls the `completeOrFail` function of the [ExecuteProposal.cash](#executeproposalcash) contract.

Constructor:
  - `minCommitmentDeposit`: The minimum amount of satoshis the creator has to commit to the proposal.

There are 3 functions in the SubmitProposal contract:

1. **add** This function allows anyone to submit a proposal to add new authorizedThreadNFTs to the Project Coordinator.

Parameters:
  - `proposalScriptHash`: 32 bytes scriptHash of the new contract to be included in the project.
   - `threadCount`: 2 bytes thread count represents the number of authorizedThreadNFTs to be added to the project.

Transaction Structure:
| # | Inputs | Outputs |
|---|--------|---------|
| 0 | [AuthorizedThreadNFT](#authorizedthreadnfts) from controller.cash | [AuthorizedThreadNFT](#authorizedthreadnfts) back to controller.cash |
| 1 | Any input from this contract | Input1 back to this contract without any change |
| 2 | [ProposalCounterNFT](#mintingnfts) from controller.cash | [ProposalCounterNFT](#mintingnfts) back to controller.cash |
| 3 | Funding UTXO | [VoteProposalNFT](#proposalnfts) to controller.cash |
| 4 |                        | [TimeProposalNFT](#proposaltnft) to controller.cash |
| 5 |                        | OP_RETURN with the proposal data |
| 6 |                        | Change pure BCH |


2. **remove** This function allows anyone to submit a proposal to remove authorizedThreadNFTs from the Project Coordinator. In order to remove the threads, an existing thread should be used as the input.


Transaction Structure:
| # | Inputs | Outputs |
|---|--------|---------|
| 0 | [AuthorizedThreadNFT](#authorizedthreadnfts) from controller.cash | [AuthorizedThreadNFT](#authorizedthreadnfts) back to controller.cash |
| 1 | Any input from this contract | Input1 back to this contract without any change |
| 2 | [ProposalCounterNFT](#mintingnfts) from controller.cash | [ProposalCounterNFT](#mintingnfts) back to controller.cash |
| 3 | [AuthorizedThreadNFT](#authorizedthreadnfts) from the Project Contract | [AuthorizedThreadNFT](#authorizedthreadnfts) back to the Project Contract |
| 4 | | [VoteProposalNFT](#proposalnfts) to controller.cash |
| 5 | Funding UTXO | [TimeProposalNFT](#proposalnfts) to controller.cash |
| 6 |                        | OP_RETURN with the proposal data |
| 7 |                        | Change pure BCH |


3. **replace** This function allows anyone to submit a proposal to replace authorizedThreadNFTs in the Project. In order to replace the threads, an existing thread should be used as the input.

Parameters:
  - `proposalScriptHash`: 32 bytes scriptHash of the new contract to be included in the project. The proposalId of the contract to be replaced is taken from the authorizedThreadNFT included in the input.

Transaction Structure:
| # | Inputs | Outputs |
|---|--------|---------|
| 0 | [AuthorizedThreadNFT](#authorizedthreadnfts) from controller.cash | [AuthorizedThreadNFT](#authorizedthreadnfts) back to controller.cash |
| 1 | Any input from this contract | Input1 back to this contract without any change |
| 2 | [ProposalCounterNFT](#mintingnfts) from controller.cash | [ProposalCounterNFT](#mintingnfts) back to controller.cash |
| 3 | [AuthorizedThreadNFT](#authorizedthreadnfts) from the Project Contract | [AuthorizedThreadNFT](#authorizedthreadnfts) back to the Project Contract |
| 4 | Funding UTXO | [VoteProposalNFT](#proposalnfts) to controller.cash |
| 5 |                        | [TimeProposalNFT](#timeproposaltnft) to controller.cash |
| 6 |                        | OP_RETURN with the proposal data |
| 7 |                        | Change pure BCH |

#### Voting.cash
Token holders cast their votes on proposals by submitting their token amount to the [proposalNFT](#proposalcounternft). In exchange, they receive a [VoteNFT](#votenft), which they can later use to reclaim their tokens. Voters have the flexibility to retract their votes at any time, regardless of the proposal deadline.

There are 2 functions in the Voting contract:

1. **vote** This function allows anyone to cast their vote on a proposal.

Parameters:
  - `voteAmount`: The amount of tokens to be committed to the proposal.

Transaction Structure:
| # | Inputs | Outputs |
|---|--------|---------|
| 0 | [AuthorizedThreadNFT](#authorizedthreadnfts) from controller.cash | [AuthorizedThreadNFT](#authorizedthreadnfts) back to controller.cash |
| 1 | Any input from this contract | Input1 back to this contract without any change |
| 2 | [VoteMintingNFT](#mintingnfts) from Controller.cash | [VoteMintingNFT](#mintingnfts) back to Controller.cash |
| 3 | [VoteProposalNFT](#proposalnfts) from Controller.cash | [VoteProposalNFT](#proposalnfts) back to Controller.cash with token amount (Equal to `voteAmount`) |
| 4 | Utxo to cast vote with token amount | [VoteNFT](#votenft) of Vote to the locking bytecode of the voter |
| 5 | Funding UTXO | Change token amount |
| 6 |  | Change BCH |


2. **retract** The Retract Voting contract allows anyone to retract their vote from a proposal.

> **Note:** When the proposal is being executed, the votes are temporarily locked in the timeProposalNFT so the votes can't be retracted during the execution.

Transaction Structure:
| # | Inputs | Outputs |
|---|--------|---------|
| 0 | [AuthorizedThreadNFT](#authorizedthreadnfts) from controller.cash | [AuthorizedThreadNFT](#authorizedthreadnfts) back to controller.cash |
| 1 | Any input from this contract | Input1 back to this contract without any change |
| 2 | [VoteProposalNFT](#proposalnfts) from controller.cash | [VoteProposalNFT](#proposalnfts) back to controller.cash (minus the token amount in the receiptNFT) |
| 3 | [VoteNFT](#votenft) used to cast vote | token amount to the voteNFT provider |
| 4 | Funding UTXO | Change pure BCH |


### ExecuteProposal.cash

The ExecuteProposal contract allows anyone to execute a proposal. The contract ensures that the proposal is valid and updates the project's authorizedThreadNFTs accordingly.

Constructor:
  - `voteThreshold`: The minimum number of votes required for the proposal to pass.
  - `voteWindow`: The minimum time window during which votes can be cast.
  - `projectCategory`: The category of the project for which the proposal is being applied. [reversed]
  - `projectLockingBytecode`: The locking bytecode of the project for which the proposal is being applied.


There are two functions in the ExecuteProposal contract:

1. **execute** This function is responsible for executing the proposal. Since the proposal can be of three types, the function behaves differently based on the type of proposalNFT used in the transaction. Below are the details of the function for each type of proposalNFT.

Transaction Structure:
| # | Inputs | Outputs |
|---|--------|---------|
| 0 | [DAO Contract's authorizedThreadNFT](#authorizedthreadnfts) from Controller.cash | [DAO Contract's authorizedThreadNFT](#authorizedthreadnfts) back to Controller.cash |
| 1 | Any input from this contract | Input1 back to this contract without any change |
| 2 | [VoteProposalNFT](#proposalnfts) from Controller.cash | [VoteProposalNFT](#proposalnfts) back to Controller.cash |
| 3 | [TimeProposalNFT](#proposaltnft) from Controller.cash | [TimeProposalNFT](#proposaltnft) back to Controller.cash |
| 4 | Funding UTXO | Change UTXO |

ADD

| # | Inputs | Outputs |
|---|--------|---------|
| 5 | [Minting NFT of the Upgradable Project](#mintingnfts) from Controller.cash | [Minting NFT of the Upgradable Project](#mintingnfts) back to Controller.cash |
| 6 | | [New authorizedThreadNFT](#authorizedthreadnfts) to the Project Controller |

REMOVE

| # | Inputs | Outputs |
|---|--------|---------|
| 5 | [authorizedThreadNFT](#authorizedthreadnfts) to the Project Controller | |


REPLACE

| # | Inputs | Outputs |
|---|--------|---------|
| 5 | [Minting NFT of the Upgradable Project](#mintingnfts) from Controller.cash | [Minting NFT of the Upgradable Project](#mintingnfts) back to Controller.cash |
| 6 | [authorizedThreadNFT](#authorizedthreadnfts) to the Project Controller | [New authorizedThreadNFT](#authorizedthreadnfts) to the Project Controller |

2. **completeOrFail** This function burns the timeProposalNFT and makes the proposalNFT immutable. It ensures that the proposalNFT has the votes and commitment deposit is sent to the correct party.
This function is called under two circumstances:
    - When the voteThreshold is not met, anyone can call this function and claim the commitment deposit.
    - When the proposal is executed, and all the threads are minted or removed already. At this stage, the timeProposalNFT has all the votes and commitment deposit.

Transaction Structure:
| # | Inputs | Outputs |
|---|--------|---------|
| 0 | [DAO Contract's authorizedThreadNFT](#authorizedthreadnfts) from Controller.cash | [DAO Contract's authorizedThreadNFT](#authorizedthreadnfts) back to Controller.cash |
| 1 | Any input from this contract | Input1 back to this contract without any change |
| 2 | [VoteProposalNFT](#proposalnfts) from Controller.cash | [VoteProposalNFT](#proposalnfts) back to Controller.cash |
| 3 | [TimeProposalNFT](#proposaltnft) from Controller.cash | Commitment deposit to the creator |
| 4 | Funding UTXO | Change BCH |


### Upgradable Project

The DAO is responsible for changing the project's functionality. It does so by managing the AuthorizedThreadNFTs that exist within the project's coordinator contract.

#### Coordinator.cash

In order for a contract to be upgradable and compatible with the DAO, it must fulfill the following requirements:

1. **AuthorizedThreadNFT**: The project must hold an AuthorizedThreadNFT with the following commitment pattern:
  - `category`: projectCategory
  - `commitment`: 39 bytes < proposalID >< threadCount >< scriptHash >

2. **useAuthorizedThread**: It must have a function `useAuthorizedThread` that can only be called when used with the DAO's [Controller.cash](#controllercash). This function lets the DAO remove or replace the project's authorizedThreadNFTs.

Transaction Structure:
| # | Inputs | Outputs |
|---|--------|---------|
| 0 | [DAO Contract's authorizedThreadNFT](#authorizedthreadnfts) from Controller.cash | |


3. **call**: It must have a function `call` that lets the project use the authorizedThreadNFTs with other contracts.

Transaction Structure:
| # | Inputs | Outputs |
|---|--------|---------|
| 0 | [Project's authorizedThreadNFT](#authorizedthreadnfts) from Coordinator.cash | [Project's authorizedThreadNFT](#authorizedthreadnfts) back to Coordinator.cash |
| 1 | Any UTXO from Authorized contract | UTXO back to Authorized contract |


### Cashtokens

The contracts talk to each other through cashtokens.

#### AuthorizedThreadNFTs

- **[DAO] AuthorizedThreadNFT**:
These are immutable NFTs that control the transaction's execution flow of the DAO. These NFTs exist as UTXOs in the [Controller.cash](#controllercash) contract.
  - `category`: daoCategory
  - `commitment`: 35 bytes
  - `capability`: immutable
  - Allocates 1 thread.
  - exists in the [Controller.cash](#controllercash) contract

- **[Project] AuthorizedThreadNFT**:
These immutable NFTs reside within the project's coordinator contract and are responsible for managing the project's transaction execution flow. The DAO has the authority to create, remove, or replace these NFTs within the coordinator contract, enabling the project to upgrade itself. To be compatible with the DAO, a project must hold an AuthorizedThreadNFT with the following commitment pattern:
  - `category`: projectCategory
  - `commitment`: `38 bytes < 4 bytes proposalID >< 2 bytes threadCount >< 32 bytes proposedScriptHash >`
  - `capability`: immutable
  - exists in the project's coordinator contract

#### MintingNFTs

- **ProposalCounterNFT**: This NFT is used to create new proposals for users to vote on. Since each proposal should be unique, the commitment of this NFT holds can't as a counter which increments by 1 for each new proposal.
  - `category`: daoCategory
  - `commitment`: 4 bytes
  - `capability`: minting
  - 1 thread/UTXO
  - exists in the [Controller.cash](#controllercash) contract
- **VoteMintingNFT**: This NFT is used to create NFT receipts for new votes, the minted immutable NFT is sent to the voter, that can be used to retract their vote.
  - `category`: daoCategory
  - `commitment`: 0 bytes
  - `capability`: minting
  - x threads/UTXOs
  - exists in the [Controller.cash](#controllercash) contract
- **ProjectThreadMintingNFT**: This NFT is used to mint or replace the project's authorizedThreadNFTs.
  - `category`: projectCategory
  - `commitment`: 0 bytes
  - `capability`: minting
  - x threads/UTXOs
  - exists in the [Controller.cash](#controllercash) contract


#### ProposalNFTs

- **TimeProposalNFT**: An immutable NFT used to manage the timing of proposals, this NFT is created when a new proposal is created. Initially, it's used as a timer for the proposal and holds the commitment deposit, but once the proposal is executed, it's used to lock the proposalNFT's votes and commitment deposit until the proposal is executed.
  - `category`: daoCategory
  - `commitment`: 29 bytes
  - `capability`: immutable
  - 1 thread/UTXO for each proposal
  - exists in the [Controller.cash](#controllercash) contract

- **VoteProposalNFT**: This NFT holds all the votes for a proposal, whenever a user votes on a proposal, the vote amount is added to this NFT. This NFT has a different commitment pattern depending on the type of proposal.
  - If the proposal is to add a new contract to the project, then the 
   nftCommitment must be of 40 bytes and holds the following information:
    - `category`: daoCategory
    - `capability`: mutable
    - `commitment`: `40 bytes <ProposalID (4 bytes), ThreadLeft (2 bytes), ThreadCount (2 bytes), ProposedScriptHash (32 bytes)>`
  - If the proposal is a remove proposal, then the nftCommitment must be of 6 bytes and holds the following information:
    - `category`: daoCategory
    - `commitment`: `6 bytes <ProposalID (4 bytes), ThreadLeft (2 bytes)>`
    - `capability`: mutable
  - If the proposal is a replace proposal, then the nftCommitment must be of 36 bytes and holds the following information:
    - `category`: daoCategory
    - `commitment`: `38 bytes <ProposalID (4 bytes), ThreadLeft (2 bytes), ProposedScriptHash (32 bytes)>`
    - `capability`: mutable
  - exists in the [Controller.cash](#controllercash) contract

Once the proposal is eligible to be passed, the proposal is executed. During this process, the `threadLeft` is decremented by 1 for each thread that is minted, removed, or replaced until it reaches 0, at which point the proposal is fully executed.

During the proposal execution, the votes and commitment deposit are locked in the timeProposalNFT.

Once all the threadsLeft reach 0, the voteProposalNFT is turned immutable, the timeProposalNFT is burned and the votes and commitment deposit are returned to the proposalNFT allowing the votes to take back their tokens.

#### VoteNFT
Each vote cast on a proposal results in the issuance of a VoteNFT.
  - `category`: daoCategory
  - `commitment`: 12 bytes `< ProposalID (4 bytes), VoteAmount (8 bytes) >`
  - `capability`: immutable
  - exists with the voter

---

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.