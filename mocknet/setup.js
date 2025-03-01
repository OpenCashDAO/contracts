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

import { alicePriv, aliceAddress, aliceTokenAddress, alicePkh } from './common.js';
export { alicePriv, aliceAddress, aliceTokenAddress, alicePkh };

// Upgradable Project contract
const Upgradable = compileFile(new URL('../Upgradable/Upgradable.cash', import.meta.url));

// DAO contracts
const Controller = compileFile(new URL('../DAO/Controller.cash', import.meta.url));
const ExecuteProposal = compileFile(new URL('../DAO/ExecuteProposal.cash', import.meta.url));
// const DelegateFactory = compileFile(new URL('../DAO/DelegateFactory.cash', import.meta.url));


export const provider = new MockNetworkProvider();
export const addressType = 'p2sh32';
export const options = { provider, addressType }

export const aliceTemplate = new SignatureTemplate(alicePriv);

export const randomNFTForDAOUtxo = randomNFT({satoshis: 10_000n, nft: {commitment: undefined, capability: 'none'}});

export const daoCategory = randomNFTForDAOUtxo.category
export const reverseDaoTokenCategory = binToHex(hexToBin(daoCategory).reverse())



// Export all the contracts

export const DAOControllerContract = new Contract(Controller, [reverseDaoTokenCategory], options);

export const randomNFTForUpgradableUtxo = randomNFT({satoshis: 10_000n, nft: {commitment: undefined, capability: 'none'}});
export const reverseUpgradableTokenCategory = binToHex(hexToBin(randomNFTForUpgradableUtxo.category).reverse())

export const DAOControllerLockingBytecode = cashAddressToLockingBytecode(DAOControllerContract.address)
export const UpgradableContract = new Contract(Upgradable, [reverseUpgradableTokenCategory, DAOControllerLockingBytecode.bytecode], options);


const voteThreshold = BigInt(1);
const voteWindow = BigInt(1000);
const projectCategory = reverseDaoTokenCategory;

export const UpgradableContractLockingBytecode = cashAddressToLockingBytecode(UpgradableContract.address)
const projectLockingBytecode = UpgradableContractLockingBytecode.bytecode;

export const ExecuteProposalContract = new Contract(ExecuteProposal, [voteThreshold, voteWindow, projectCategory, projectLockingBytecode], options);
export const ExecuteProposalContractLockingBytecode = binToHex(cashAddressToLockingBytecode(ExecuteProposalContract.address).bytecode);
provider.addUtxo(ExecuteProposalContract.address, randomUtxo());

// Create authorizedThreadNFT

const authorizedThreadNFTUtxo = {
  ...randomNFT({category: daoCategory, nft: { commitment: ExecuteProposalContractLockingBytecode, capability: 'none'}}),
  ...randomUtxo()
};

// Add 2 threads
provider.addUtxo(DAOControllerContract.address, authorizedThreadNFTUtxo);
provider.addUtxo(DAOControllerContract.address, authorizedThreadNFTUtxo);

