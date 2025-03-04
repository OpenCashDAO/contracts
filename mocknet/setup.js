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
import { intToBytesToHex, hexToInt } from './utils.js';
import { alicePriv, aliceAddress, aliceTokenAddress, alicePkh, alicePub } from './common.js';
export { alicePriv, aliceAddress, aliceTokenAddress, alicePkh, alicePub };

// Steps:
// - Load contacts
// - Initiate provider
// - Compile contracts
// - Add UTXOs to the provider
// - Create authorizedThreadNFT

// Upgradable Project contract
const Upgradable = compileFile(new URL('../Upgradable/Upgradable.cash', import.meta.url));

// DAO contracts
const Controller = compileFile(new URL('../DAO/Controller.cash', import.meta.url));
const AddThreads = compileFile(new URL('../DAO/executions/AddThreads.cash', import.meta.url));
const RemoveThreads = compileFile(new URL('../DAO/executions/RemoveThreads.cash', import.meta.url));
const ReplaceThreads = compileFile(new URL('../DAO/executions/ReplaceThreads.cash', import.meta.url));
const FailProposal = compileFile(new URL('../DAO/executions/FailProposal.cash', import.meta.url));
const ProposalToAdd = compileFile(new URL('../DAO/proposals/Add.cash', import.meta.url));
const ProposalToRemove = compileFile(new URL('../DAO/proposals/Remove.cash', import.meta.url));
const ProposalToReplace = compileFile(new URL('../DAO/proposals/Replace.cash', import.meta.url));
const Vote = compileFile(new URL('../DAO/voting/Vote.cash', import.meta.url));
const RetractVote = compileFile(new URL('../DAO/voting/RetractVote.cash', import.meta.url));
const ContractA = compileFile(new URL('../Upgradable/ContractA.cash', import.meta.url));
const ContractNew = compileFile(new URL('../Upgradable/ContractNew.cash', import.meta.url));

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
export const UpgradableProjectNFT = randomNFT({nft: {commitment: undefined, capability: 'minting'}});

export const daoCategory = DAOControllerNFT.category
export const reverseDaoTokenCategory = binToHex(hexToBin(daoCategory).reverse())
export const upgradableProjectCategory = UpgradableProjectNFT.category
export const reverseUpgradableProjectCategory = binToHex(hexToBin(upgradableProjectCategory).reverse())

export const aliceTemplate = new SignatureTemplate(alicePriv);
export const aliceAddressLockingBytecode = cashAddressToLockingBytecode(aliceAddress).bytecode;
provider.addUtxo(aliceAddress, randomUtxo());
provider.addUtxo(aliceAddress, randomUtxo());
provider.addUtxo(aliceAddress, randomUtxo());
provider.addUtxo(aliceTokenAddress, {... randomUtxo(), token: { category: daoCategory, amount: 1000000n }});

const proposalId = intToBytesToHex({value: hexToInt(DAOControllerNFT.nft.commitment) + 1, length: 4});
const threadCount = intToBytesToHex({value: 1, length: 2});

// Export all the contracts

export const DAOControllerContract = new Contract(Controller, [reverseDaoTokenCategory], options);
export const DAOControllerLockingBytecode = cashAddressToLockingBytecode(DAOControllerContract.address)
export const UpgradableProjectContract = new Contract(Upgradable, [reverseUpgradableProjectCategory, DAOControllerLockingBytecode.bytecode], options);
export const upgradableProjectLockingBytecode = cashAddressToLockingBytecode(UpgradableProjectContract.address).bytecode


export const AddThreadsContract = new Contract(AddThreads, [minVoteThreshold, minWait, reverseUpgradableProjectCategory, upgradableProjectLockingBytecode], options);
export const addThreadsContractLockingBytecode = binToHex(cashAddressToLockingBytecode(AddThreadsContract.address).bytecode);
provider.addUtxo(AddThreadsContract.address, randomUtxo());

export const RemoveThreadsContract = new Contract(RemoveThreads, [minVoteThreshold, minWait, reverseUpgradableProjectCategory, upgradableProjectLockingBytecode], options);
export const removeThreadsContractLockingBytecode = binToHex(cashAddressToLockingBytecode(RemoveThreadsContract.address).bytecode);
provider.addUtxo(RemoveThreadsContract.address, randomUtxo());

export const ReplaceThreadsContract = new Contract(ReplaceThreads, [minVoteThreshold, minWait, reverseUpgradableProjectCategory, upgradableProjectLockingBytecode], options);
export const replaceThreadsContractLockingBytecode = binToHex(cashAddressToLockingBytecode(ReplaceThreadsContract.address).bytecode);
provider.addUtxo(ReplaceThreadsContract.address, randomUtxo());

export const FailProposalContract = new Contract(FailProposal, [minVoteThreshold, minWait], options);
export const failProposalContractLockingBytecode = binToHex(cashAddressToLockingBytecode(FailProposalContract.address).bytecode);
provider.addUtxo(FailProposalContract.address, randomUtxo());

export const ProposalToAddContract = new Contract(ProposalToAdd, [minCommitmentDeposit], options);
export const proposalToAddContractLockingBytecode = binToHex(cashAddressToLockingBytecode(ProposalToAddContract.address).bytecode);
provider.addUtxo(ProposalToAddContract.address, randomUtxo());

export const ProposalToRemoveContract = new Contract(ProposalToRemove, [minCommitmentDeposit], options);
export const proposalToRemoveContractLockingBytecode = binToHex(cashAddressToLockingBytecode(ProposalToRemoveContract.address).bytecode);
provider.addUtxo(ProposalToRemoveContract.address, randomUtxo());

export const ProposalToReplaceContract = new Contract(ProposalToReplace, [minCommitmentDeposit], options);
export const proposalToReplaceContractLockingBytecode = binToHex(cashAddressToLockingBytecode(ProposalToReplaceContract.address).bytecode);
provider.addUtxo(ProposalToReplaceContract.address, randomUtxo());

export const VoteContract = new Contract(Vote, [], options);
export const voteContractLockingBytecode = binToHex(cashAddressToLockingBytecode(VoteContract.address).bytecode);
provider.addUtxo(VoteContract.address, randomUtxo());

export const RetractVoteContract = new Contract(RetractVote, [], options);
export const retractVoteContractLockingBytecode = binToHex(cashAddressToLockingBytecode(RetractVoteContract.address).bytecode);
provider.addUtxo(RetractVoteContract.address, randomUtxo());

export const ContractAContract = new Contract(ContractA, [], options);
export const contractALockingBytecode = binToHex(cashAddressToLockingBytecode(ContractAContract.address).bytecode);

export const ContractNewContract = new Contract(ContractNew, [], options);
export const contractNewLockingBytecode = binToHex(cashAddressToLockingBytecode(ContractNewContract.address).bytecode);


// Minting NFTs to the DAO controller

provider.addUtxo(DAOControllerContract.address, {
  token: {
    ...DAOControllerNFT,
  },
  ...randomUtxo()
});

provider.addUtxo(DAOControllerContract.address, {
  token: {
    ...UpgradableProjectNFT,
  },
  ...randomUtxo()
});

// Add Proposal NFTs

const proposalNFTUtxoAdd = {
  token: {
    ...randomNFT({
      category: daoCategory,
      nft: {
        commitment: proposalId + threadCount + threadCount + contractALockingBytecode.slice(4, -2),
        capability: 'mutable'
      }
    })
  },
  ...randomUtxo()
};
const proposalNFTUtxoRemove = {
  token: {
    ...randomNFT({
      category: daoCategory,
      nft: {
        commitment: proposalId + threadCount,
        capability: 'mutable'
      }
    })
  },
  ...randomUtxo()
};
const proposalNFTUtxoReplace = {
  token: {
    ...randomNFT({
      category: daoCategory,
      nft: {
        commitment: proposalId + threadCount + contractALockingBytecode.slice(4, -2),
        capability: 'mutable'
      }
    })
  },
  ...randomUtxo()
};
provider.addUtxo(DAOControllerContract.address, proposalNFTUtxoAdd);
provider.addUtxo(DAOControllerContract.address, proposalNFTUtxoRemove);
provider.addUtxo(DAOControllerContract.address, proposalNFTUtxoReplace);


// Create authorizedThreadNFT for the Upgradable Project
const authorizedThreadNFTUtxoForProject = {
  token: {
    ...randomNFT({
      category: upgradableProjectCategory,
      nft: {
        commitment: proposalId + threadCount + contractALockingBytecode.slice(4, -2),
        capability: 'none'
      }
    })
  },
  ...randomUtxo()
};

// Add threads
provider.addUtxo(UpgradableProjectContract.address, authorizedThreadNFTUtxoForProject);

// Create authorizedThreadNFT for the DAO

let authorizedThreadNFTUtxo = {
  token: {
    ...randomNFT({
      category: daoCategory,
      nft: {
        commitment: addThreadsContractLockingBytecode,
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
        commitment: removeThreadsContractLockingBytecode,
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
        commitment: replaceThreadsContractLockingBytecode,
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
        commitment: failProposalContractLockingBytecode,
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
        commitment: proposalToAddContractLockingBytecode,
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
        commitment: proposalToRemoveContractLockingBytecode,
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
        commitment: proposalToReplaceContractLockingBytecode,
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
        commitment: voteContractLockingBytecode,
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
        commitment: retractVoteContractLockingBytecode,
        capability: 'none'
      }
    })
  },
  ...randomUtxo()
};

// Add threads
provider.addUtxo(DAOControllerContract.address, authorizedThreadNFTUtxo);
