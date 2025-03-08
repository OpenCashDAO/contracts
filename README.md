# OpenCashDAO

> **Note:** This project is under active development.


OpenCashDAO is a feature-rich decentralized autonomous organization (DAO) template, designed to empower stakeholders to influence the project's direction. It serves as a proposal and voting platform for the community, enabling them to vote on various proposals to modify the project's functionality.

**Key Features:**

- 1 DAO, ∞ projects
- Proposals and Voting by stakeholders
- Upgradable Project


## Table of Contents
1. [DAO contracts](#dao-contracts)
    - [Controller.cash](#controller.cash)
    - [SubmitProposal.cash](#submitproposal.cash)
    - [Voting.cash](#voting.cash)
    - [ExecuteProposal.cash](#executeproposal.cash)
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

DAO is a system of 4 contracts where the controller is the main contract that is part of every transaction that happens in the DAO.


#### Controller.cash
The Controller contract functions as the control and storage hub for the DAO. 

Constructor:
  - `daoCategory`: The category of the DAO NFTs.

Transaction Structure:
| # | Inputs | Outputs |
|---|--------|---------|
| 0 | [AuthorizedThreadNFT](#authorizedthreadnfts) NFT with authorized contract's locking bytecode as commitment from self | [AuthorizedThreadNFT](#authorizedthreadnfts) back to self |
| 1 | Any UTXO from Authorized contract | UTXO back to Authorized contract |


#### SubmitProposal.cash
Anyone can submit new proposals to the DAO, which can have one of three intentions: to add, remove, or replace functionality. Once a proposal is submitted, a timer starts(`voteWindow`), and the proposal is open for voting. The proposal remains open for a set period, after which it can be executed. Based on the number of votes, the proposal is either passed or failed. If a proposal passes(`voteThreshold` is met), it can be executed by anyone, implementing the new changes to the project. While the DAO's contracts are static, the projects it controls are upgradable in nature.

The proposal requires a `commitmentDeposit` to prevent spam and ensure serious commitment from the proposal creator. If the proposal passes, the creator gets back the commitment deposit. If the proposal fails, the BCH is sent to anyone who calls the `completeOrFail` function of the [ExecuteProposal.cash](#executeproposalcash) contract.

Constructor:
  - `minCommitmentDeposit`: The minimum amount of satoshis the creator has to commit to the proposal.

There are 3 functions in in the SubmitProposal contract:

1. **add** This function allows anyone to submit a proposal to add new authorizedThreadNFTs to the Upgradable Project Contract.

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


2. **remove** This function allows anyone to submit a proposal to remove authorizedThreadNFTs from the Project. In order to remove the threads, an existing thread should be used as the input.


Transaction Structure:
| # | Inputs | Outputs |
|---|--------|---------|
| 0 | [AuthorizedThreadNFT](#authorizedthreadnfts) from controller.cash | [AuthorizedThreadNFT](#authorizedthreadnfts) back to controller.cash |
| 1 | Any input from this contract | Input1 back to this contract without any change |
| 2 | [ProposalCounterNFT](#mintingnfts) from controller.cash | [ProposalCounterNFT](#mintingnfts) back to controller.cash |
| 3 | [AuthorizedThreadNFT](#authorizedthreadnfts) from the Project Contract | [VoteProposalNFT](#proposalnfts) to controller.cash |
| 4 | Funding UTXO | [TimeProposalNFT](#proposaltnft) to controller.cash |
| 5 |                        | [AuthorizedThreadNFT](#authorizedthreadnfts) back to the Project Contract |
| 6 |                        | OP_RETURN with the proposal data |
| 7 |                        | Change pure BCH |


3. **replace** This function allows anyone to submit a proposal to replace authorizedThreadNFTs in the Project.

Parameters:
  - `proposalScriptHash`: 32 bytes scriptHash of the new contract to be included in the project. The proposalId of the contract to be replaced is taken from the authorizedThreadNFT included in the input.

Transaction Structure:
| # | Inputs | Outputs |
|---|--------|---------|
| 0 | [AuthorizedThreadNFT](#authorizedthreadnfts) from controller.cash | [AuthorizedThreadNFT](#authorizedthreadnfts) back to controller.cash |
| 1 | Any input from this contract | Input1 back to this contract without any change |
| 2 | [ProposalCounterNFT](#mintingnfts) from controller.cash | [ProposalCounterNFT](#mintingnfts) back to controller.cash |
| 3 | [AuthorizedThreadNFT](#authorizedthreadnfts) from the Project Contract | [VoteProposalNFT](#proposalnfts) to controller.cash |
| 4 | Funding UTXO | [TimeProposalNFT](#proposaltnft) to controller.cash |
| 5 |                        | [AuthorizedThreadNFT](#authorizedthreadnfts) back to the Project Contract |
| 6 |                        | OP_RETURN with the proposal data |
| 7 |                        | Change pure BCH |

#### Voting.cash
This contract allows stakeholders to vote on proposals. The votes send their tokens to the [proposalNFT](#proposalcounternft) and receive a [VoteNFT](#votenft) in return that can be used to retract their vote.

There are 2 functions in in the Voting contract:

1. **vote** This function allows anyone to cast their vote on a proposal.

Parameters:
  - `voteAmount`: The amount of tokens to be committed to the proposal.

Transaction Structure:
| # | Inputs | Outputs |
|---|--------|---------|
| 0 | [AuthorizedThreadNFT](#authorizedthreadnfts) from controller.cash | [AuthorizedThreadNFT](#authorizedthreadnfts) back to controller.cash |
| 1 | Any input from this contract | Input1 back to this contract without any change |
| 2 | [VoteMintingNFT](#mintingnfts) from Controller.cash | [VoteMintingNFT](#mintingnfts) back to Controller.cash |
| 3 | [VoteProposalNFT](#proposalnfts) from Controller.cash | [VoteProposalNFT](#proposalnfts) back to Controller.cash with tokenAmount (Equal to `voteAmount`) |
| 4 | Utxo to cast vote with tokenAmount | [VoteNFT](#votenft) of Vote to the lockingbytecode of the voter |
| 5 |                        | Change tokenAmount and BCH |


  - **retract** The Retract Voting contract allows anyone to retract their vote from a proposal.

> **Note:** When the proposal is being executed, the votes are temporarily locked in the timeProposalNFT so the votes can't be retracted during the execution.

Transaction Structure:
| # | Inputs | Outputs |
|---|--------|---------|
| 0 | [AuthorizedThreadNFT](#authorizedthreadnfts) from controller.cash | [AuthorizedThreadNFT](#authorizedthreadnfts) back to controller.cash |
| 1 | Any input from this contract | Input1 back to this contract without any change |
| 2 | [VoteProposalNFT](#proposalnfts) from controller.cash | [VoteProposalNFT](#proposalnfts) back to controller.cash (minus the tokenAmount in the recieptNFT) |
| 3 | [VoteNFT](#votenft) used to cast vote | tokenAmount to the voteNFT provider |
| 4 | Funding UTXO | Change pure BCH |


### ExecuteProposal.cash

The ExecuteProposal contract allows anyone to execute a proposal. The contract ensures that the proposal is valid and updates the project's authorizedThreadNFTs accordingly.

 - **execute** The Execute function.
 - **completeOrFail** The CompleteOrFail function.

## Upgradable Contract

This is a single contract with the ability to call multiple contracts. The DAO controls which contracts are accessible by the OpenCash contract.

### Cashtokens

The contracts talk to each other through cashtokens. There are a few types in this system:

- [Controller.cash](#controllercash) holds [AuthorizedThreadNFTs](#authorizedthreadnfts), [ProposalCounterNFTs](#proposalcounternft) and [MintingNFTs](#mintingnfts), [VoteProposalNFTs](#voteproposalnfts), [TimeProposalNFTs](#timeproposaltnft)
- [UpgradableProject.cash](#upgradableproject.cash) holds the project's authorizedThreadNFTs.
- Each individual votes holds the [voteNFTs](#votenft)

#### AuthorizedThreadNFTs

- **[DAO] AuthorizedThreadNFT**:
These are immutable NFTs that control the transaction's execution flow of the DAO. These NFTs exist as utxos in the [Controller.cash](#controllercash) contract.

  - `category`: daoCategory
  - `commitment`: 35 bytes
  - Allocates 1 thread.

- **[Project] AuthorizedThreadNFT**:
These are immutable NFTs that exist with the project's controller contract. These are responsible to manage the transaction's execution flow of the project.

The DAO is responsible to create/remove/replace these NFTs from the project's controller contract. Making it possible for the project to upgrade itself.

For any project to be compatible with the DAO, it must hold an AuthorizedThreadNFT with the following commitment pattern:
  - `category`: projectCategory
  - `commitment`: 39 bytes < proposalID >< threadCount >< proposedScriptHash >


#### MintingNFTs

The [Controller.cash](#controllercash) contract holds the following minting NFTs:
- **ProposalCounterNFT**: This NFT is used to create new proposals for users to vote on. Since each proposal should be unique, the commitment of this NFT holds can't as a counter which increments by 1 for each new proposal.
  - `category`: daoCategory
  - `commitment`: 4 bytes
  - `capability`: minting
  - 1 threads/utxos
- **VoteMintingNFT**: This NFT is used to create NFT reciepts for new votes, the minted immutable NFT is send to the voter, that can be used to retract their vote.
  - `category`: daoCategory
  - `commitment`: 0 bytes
  - `capability`: immutable
  - x threads/utxos
- **ProjectThreadMintingNFT**: This NFT is used to mint or replace the project's authorizedThreadNFTs.
  - `category`: projectCategory
  - `commitment`: 0 bytes
  - `capability`: minting
  - x threads/utxos


#### ProposalNFTs

- **TimeProposalNFT**: An immutable NFT used to manage the timing of proposals, this NFT is created when a new proposal is created. Initially it's used as timer for the proposal, but once the proposal is executed, it's used to lock the proposalNFT's votes and commitmentDeposit.
  - `category`: daoCategory
  - `commitment`: 29 bytes
  - `capability`: immutable
  - 1 thread/utxo for each proposal

- **VoteProposalNFT**: This NFT holds all the votes for a proposal, whenever a user votes on a proposal, the vote amount is added to this NFT. This NFT also holds the proposal's commitmentDeposit. This NFT has different behaviour depending on the type of proposal.
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
    - `commitment`: `36 bytes <ProposalID (4 bytes), ThreadLeft (2 bytes), ProposedScriptHash (32 bytes)>`
    - `capability`: mutable

Once the proposal is eligible to be passed, the proposal is executed. During this process, the `threadLeft` is decremented by 1 for each thread that is minted, removed or replaced. until it reaches 0, at which point the proposal is fully executed.

During the proposal execution, the votes and commitmentDeposit are locked in the timeProposalNFT.

Once all the threadsLeft reaches 0, the timeProposalNFT is burned and the votes and commitmentDeposit are returned to the proposalNFT allowing the votes to take back their tokens.

#### VoteNFT
Each vote cast results in the issuance of a VoteNFT.
  - `category`: daoCategory
  - `commitment`: 12 bytes
  - `capability`: immutable
  - `breakup`: < ProposalID >< VoteAmount >

### FAQs


#### How does voting occur?

Token holders cast their votes on proposals by submitting their tokenAmount to the proposalNFT. In exchange, they receive a VoteNFT, which they can later use to reclaim their tokens. Voters have the flexibility to retract their votes at any time, regardless of the proposal deadline.

There is another NFT called timeProposalNFT, minted simultaneously with the proposalNFT. This NFT remains with the contract and cannot be included in any transaction until the minWait period has elapsed. Once this period is over, the proposal can be executed. Depending on the number of votes in the proposalNFT, the proposal will either be executed or fail.

Upon reaching the deadline, anyone can execute the proposal and initiate the process of minting, replacing, or removing threads. When the proposal is executed, the tokenAmount from the proposalNFT is transferred to the timeNFT and locked until all threads are minted. During this period, votes cannot be withdrawn. Additionally, the commitment deposit is sent to the proposal creator.

Once all threads are minted, removed, or replaced, the timeNFT is burned, and the tokenAmount from the timeNFT is returned to the proposalNFT, enabling withdrawals. At this point, the proposalNFT becomes immutable and remains permanently in the DAO contract, while the timeNFT is destroyed.

In the event of a failure, only a single transaction occurs because the minThresholdAmount was not met. Consequently, the proposalNFT is made immutable, the timeNFT is burned, and the commitment deposit is sent to the recipient designated by the transaction initiator.