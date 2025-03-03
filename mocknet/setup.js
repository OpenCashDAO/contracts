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

import { alicePriv, aliceAddress, aliceTokenAddress, alicePkh, alicePub } from './common.js';
export { alicePriv, aliceAddress, aliceTokenAddress, alicePkh, alicePub };

// Upgradable Project contract
const Upgradable = compileFile(new URL('../Upgradable/Upgradable.cash', import.meta.url));

// DAO contracts
const Controller = compileFile(new URL('../DAO/Controller.cash', import.meta.url));
const ExecuteAddProposal = compileFile(new URL('../DAO/executions/ExecuteAddProposal.cash', import.meta.url));
const ExecuteRemoveProposal = compileFile(new URL('../DAO/executions/ExecuteRemoveProposal.cash', import.meta.url));
const ExecuteReplaceProposal = compileFile(new URL('../DAO/executions/ExecuteReplaceProposal.cash', import.meta.url));
const FailProposal = compileFile(new URL('../DAO/executions/FailProposal.cash', import.meta.url));
const ProposalToAdd = compileFile(new URL('../DAO/submissions/ProposalToAdd.cash', import.meta.url));
const ProposalToRemove = compileFile(new URL('../DAO/submissions/ProposalToRemove.cash', import.meta.url));
const ProposalToReplace = compileFile(new URL('../DAO/submissions/ProposalToReplace.cash', import.meta.url));


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
const commitmentDeposit = BigInt(1000);
const projectCategory = reverseDaoTokenCategory;

export const UpgradableContractLockingBytecode = cashAddressToLockingBytecode(UpgradableContract.address)
const projectLockingBytecode = UpgradableContractLockingBytecode.bytecode;

export const ExecuteAddProposalContract = new Contract(ExecuteAddProposal, [voteThreshold, voteWindow, projectCategory, projectLockingBytecode], options);
export const ExecuteAddProposalContractLockingBytecode = binToHex(cashAddressToLockingBytecode(ExecuteAddProposalContract.address).bytecode);
provider.addUtxo(ExecuteAddProposalContract.address, randomUtxo());

export const ExecuteRemoveProposalContract = new Contract(ExecuteRemoveProposal, [voteThreshold, voteWindow, projectCategory, projectLockingBytecode], options);
export const ExecuteRemoveProposalContractLockingBytecode = binToHex(cashAddressToLockingBytecode(ExecuteRemoveProposalContract.address).bytecode);
provider.addUtxo(ExecuteRemoveProposalContract.address, randomUtxo());

export const ExecuteReplaceProposalContract = new Contract(ExecuteReplaceProposal, [voteThreshold, voteWindow, projectCategory, projectLockingBytecode], options);
export const ExecuteReplaceProposalContractLockingBytecode = binToHex(cashAddressToLockingBytecode(ExecuteReplaceProposalContract.address).bytecode);
provider.addUtxo(ExecuteReplaceProposalContract.address, randomUtxo());

export const FailProposalContract = new Contract(FailProposal, [voteThreshold, voteWindow], options);
export const FailProposalContractLockingBytecode = binToHex(cashAddressToLockingBytecode(FailProposalContract.address).bytecode);
provider.addUtxo(FailProposalContract.address, randomUtxo());

export const ProposalToAddContract = new Contract(ProposalToAdd, [commitmentDeposit], options);
export const ProposalToAddContractLockingBytecode = binToHex(cashAddressToLockingBytecode(ProposalToAddContract.address).bytecode);
provider.addUtxo(ProposalToAddContract.address, randomUtxo());

export const ProposalToRemoveContract = new Contract(ProposalToRemove, [commitmentDeposit], options);
export const ProposalToRemoveContractLockingBytecode = binToHex(cashAddressToLockingBytecode(ProposalToRemoveContract.address).bytecode);
provider.addUtxo(ProposalToRemoveContract.address, randomUtxo());

export const ProposalToReplaceContract = new Contract(ProposalToReplace, [commitmentDeposit], options);
export const ProposalToReplaceContractLockingBytecode = binToHex(cashAddressToLockingBytecode(ProposalToReplaceContract.address).bytecode);
provider.addUtxo(ProposalToReplaceContract.address, randomUtxo());


// Create authorizedThreadNFT

let authorizedThreadNFTUtxo = {
  token: {
    ...randomNFT({
      category: daoCategory,
      nft: {
        commitment: ExecuteAddProposalContractLockingBytecode,
        capability: 'none'
      }
    })
  },
  ...randomUtxo()
};

// Add threads
provider.addUtxo(DAOControllerContract.address, authorizedThreadNFTUtxo);

authorizedThreadNFTUtxo = {
  token: {
    ...randomNFT({
      category: daoCategory,
      nft: {
        commitment: ExecuteRemoveProposalContractLockingBytecode,
        capability: 'none'
      }
    })
  },
  ...randomUtxo()
};

// Add threads
provider.addUtxo(DAOControllerContract.address, authorizedThreadNFTUtxo);

authorizedThreadNFTUtxo = {
  token: {
    ...randomNFT({
      category: daoCategory,
      nft: {
        commitment: ExecuteReplaceProposalContractLockingBytecode,
        capability: 'none'
      }
    })
  },
  ...randomUtxo()
};

// Add threads
provider.addUtxo(DAOControllerContract.address, authorizedThreadNFTUtxo);

authorizedThreadNFTUtxo = {
  token: {
    ...randomNFT({
      category: daoCategory,
      nft: {
        commitment: FailProposalContractLockingBytecode,
        capability: 'none'
      }
    })
  },
  ...randomUtxo()
};

// Add threads
provider.addUtxo(DAOControllerContract.address, authorizedThreadNFTUtxo);

authorizedThreadNFTUtxo = {
  token: {
    ...randomNFT({
      category: daoCategory,
      nft: {
        commitment: ProposalToAddContractLockingBytecode,
        capability: 'none'
      }
    })
  },
  ...randomUtxo()
};

// Add threads
provider.addUtxo(DAOControllerContract.address, authorizedThreadNFTUtxo);

authorizedThreadNFTUtxo = {
  token: {
    ...randomNFT({
      category: daoCategory,
      nft: {
        commitment: ProposalToRemoveContractLockingBytecode,
        capability: 'none'
      }
    })
  },
  ...randomUtxo()
};

// Add threads
provider.addUtxo(DAOControllerContract.address, authorizedThreadNFTUtxo);

authorizedThreadNFTUtxo = {
  token: {
    ...randomNFT({
      category: daoCategory,
      nft: {
        commitment: ProposalToReplaceContractLockingBytecode,
        capability: 'none'
      }
    })
  },
  ...randomUtxo()
};

// Add threads
provider.addUtxo(DAOControllerContract.address, authorizedThreadNFTUtxo);

