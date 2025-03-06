import { compileFile } from 'cashc';
import {
  MockNetworkProvider,
  Contract,
  SignatureTemplate,
  randomUtxo,
  randomNFT
} from 'cashscript';
import {
  hexToBin,
  binToHex,
  cashAddressToLockingBytecode
} from '@bitauth/libauth';
import { intToBytesToHex, hexToInt } from '../utils.js';
import { alicePriv, aliceAddress, aliceTokenAddress, alicePkh, alicePub } from '../common.js';
export { alicePriv, aliceAddress, aliceTokenAddress, alicePkh, alicePub };

// Steps:
// - Load contacts
// - Initiate provider
// - Compile contracts
// - Add UTXOs to the provider
// - Create authorizedThreadNFT

// Upgradable Project contract
const Upgradable = compileFile(new URL('../../Upgradable/Upgradable.cash', import.meta.url));
const ContractA = compileFile(new URL('../../Upgradable/ContractA.cash', import.meta.url));
const ContractNew = compileFile(new URL('../../Upgradable/ContractNew.cash', import.meta.url));

// DAO contracts
const Controller = compileFile(new URL('../../DAO/Controller.cash', import.meta.url));
const ExecuteProposal = compileFile(new URL('../../DAO/ExecuteProposal.cash', import.meta.url));
const Proposal = compileFile(new URL('../../DAO/Proposal.cash', import.meta.url));
const Voting = compileFile(new URL('../../DAO/Voting.cash', import.meta.url));


export const minVoteThreshold = BigInt(1);
export const minWait = BigInt(10);
export const minCommitmentDeposit = BigInt(1000);
export const commitmentLengthForProposalType = {
  ADD: 80,
  REMOVE: 12,
  REPLACE: 72
}

export const provider = new MockNetworkProvider();
export const addressType = 'p2sh32';
export const options = { provider, addressType }

export const DAOControllerNFT = randomNFT({nft: {commitment: intToBytesToHex({value: 0, length: 4}), capability: 'minting'}});
export const UpgradableProjectNFT = randomNFT({nft: {commitment: '', capability: 'minting'}});

export const daoCategory = DAOControllerNFT.category
export const reverseDaoTokenCategory = binToHex(hexToBin(daoCategory).reverse())
export const upgradableProjectCategory = UpgradableProjectNFT.category
export const reverseUpgradableProjectCategory = binToHex(hexToBin(upgradableProjectCategory).reverse())

export const proposalId = intToBytesToHex({value: hexToInt(DAOControllerNFT.nft.commitment) + 1, length: 4});
export const threadCount = intToBytesToHex({value: 1, length: 2});

export const aliceTemplate = new SignatureTemplate(alicePriv);
export const aliceAddressLockingBytecode = cashAddressToLockingBytecode(aliceAddress).bytecode;
provider.addUtxo(aliceAddress, randomUtxo());
provider.addUtxo(aliceAddress, randomUtxo());
provider.addUtxo(aliceAddress, randomUtxo());
// Tokens with the power to Vote on proposals
provider.addUtxo(aliceTokenAddress, {... randomUtxo(), token: { category: daoCategory, amount: 1000000n }});


// DAO
export const DAOControllerContract = new Contract(Controller, [reverseDaoTokenCategory], options);
export const DAOControllerLockingBytecode = cashAddressToLockingBytecode(DAOControllerContract.address)
// Upgradable Project
export const UpgradableProjectContract = new Contract(Upgradable, [reverseUpgradableProjectCategory, DAOControllerLockingBytecode.bytecode], options);
export const upgradableProjectLockingBytecode = cashAddressToLockingBytecode(UpgradableProjectContract.address).bytecode

// DAO Contracts
export const ExecuteProposalContract = new Contract(ExecuteProposal, [minVoteThreshold, minWait, reverseUpgradableProjectCategory, upgradableProjectLockingBytecode], options);
export const executeProposalContractLockingBytecode = binToHex(cashAddressToLockingBytecode(ExecuteProposalContract.address).bytecode);
provider.addUtxo(ExecuteProposalContract.address, randomUtxo());

export const ProposalContract = new Contract(Proposal, [minCommitmentDeposit], options);
export const proposalContractLockingBytecode = binToHex(cashAddressToLockingBytecode(ProposalContract.address).bytecode);
provider.addUtxo(ProposalContract.address, randomUtxo());

export const VotingContract = new Contract(Voting, [], options);
export const votingContractLockingBytecode = binToHex(cashAddressToLockingBytecode(VotingContract.address).bytecode);
provider.addUtxo(VotingContract.address, randomUtxo());

// Upgradable Project Contracts
export const ContractAContract = new Contract(ContractA, [], options);
export const contractALockingBytecode = binToHex(cashAddressToLockingBytecode(ContractAContract.address).bytecode);
provider.addUtxo(ContractAContract.address, randomUtxo());

export const ContractNewContract = new Contract(ContractNew, [], options);
export const contractNewLockingBytecode = binToHex(cashAddressToLockingBytecode(ContractNewContract.address).bytecode);
provider.addUtxo(ContractNewContract.address, randomUtxo());