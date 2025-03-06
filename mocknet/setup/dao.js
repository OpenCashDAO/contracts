import {
  randomUtxo,
  randomNFT
} from 'cashscript';
import {
  DAOControllerContract,
  DAOControllerNFT,
  daoCategory,
  executeProposalContractLockingBytecode,
  submitProposalContractLockingBytecode,
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
          commitment: executeProposalContractLockingBytecode,
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
          commitment: submitProposalContractLockingBytecode,
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