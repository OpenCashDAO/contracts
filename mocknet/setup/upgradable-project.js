import {
  randomUtxo,
  randomNFT
} from 'cashscript';
import {
  provider,
  DAOControllerContract,
  proposalId,
  threadCount,
  projectCategory,
  ProjectCoordinatorNFT,
  ProjectCoordinatorContract,
  contractALockingBytecode,
} from './index.js';


export const main = async () => {
  provider.addUtxo(DAOControllerContract.address, {
    token: {
      ...ProjectCoordinatorNFT,
    },
    ...randomUtxo()
  });

  // Create authorizedThreadNFT for the Upgradable Project
  const authorizedThreadNFTUtxoForProject = {
    token: {
      ...randomNFT({
        category: projectCategory,
        nft: {
          commitment: proposalId + threadCount + contractALockingBytecode.slice(4, -2),
          capability: 'none'
        }
      })
    },
    ...randomUtxo()
  };

  // Add threads
  provider.addUtxo(ProjectCoordinatorContract.address, authorizedThreadNFTUtxoForProject);
}