import {
  randomUtxo,
  randomNFT
} from 'cashscript';
import {
  DAOControllerContract,
  DAOControllerNFT,
  daoCategory,
  addThreadsContractLockingBytecode,
  removeThreadsContractLockingBytecode,
  replaceThreadsContractLockingBytecode,
  failProposalContractLockingBytecode,
  proposalContractLockingBytecode,
  votingContractLockingBytecode,
  provider
} from './index.js';

export const main = async () => {
  // Minting NFTs to the DAO controller
  provider.addUtxo(DAOControllerContract.address, {
    token: {
      ...DAOControllerNFT,
    },
    ...randomUtxo()
  });


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
          commitment: proposalContractLockingBytecode,
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
          commitment: votingContractLockingBytecode,
          capability: 'none'
        }
      })
    },
    ...randomUtxo()
  };
}