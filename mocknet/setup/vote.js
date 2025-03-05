import {
  randomUtxo,
  randomNFT
} from 'cashscript';
import { provider, DAOControllerContract, daoCategory, contractALockingBytecode, proposalId, threadCount } from './index.js';


export const main = async () => {
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
}