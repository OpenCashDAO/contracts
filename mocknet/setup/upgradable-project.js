import {
  randomUtxo,
  randomNFT
} from 'cashscript';
import {
  provider,
  DAOControllerContract,
  proposalId,
  threadCount,
  upgradableProjectCategory,
  UpgradableProjectNFT,
  UpgradableProjectContract,
  contractALockingBytecode,
} from './index.js';


export const main = async () => {
  provider.addUtxo(DAOControllerContract.address, {
    token: {
      ...UpgradableProjectNFT,
    },
    ...randomUtxo()
  });

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
}