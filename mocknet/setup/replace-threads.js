import {
  randomUtxo,
  randomNFT
} from 'cashscript';
import { hexToBin, binToHex } from '@bitauth/libauth';
import { intToBytesToHex } from '../utils.js';
import {
  provider,
  DAOControllerContract,
  daoCategory,
  projectCategory,
  contractALockingBytecode,
  contractNewLockingBytecode,
  aliceAddressLockingBytecode,
  ProjectCoordinatorContract
} from './index.js';


export const main = async () => {
  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const daoMintingUtxo = contractUtxos.find(utxo => 
    utxo.token?.category === daoCategory &&
    utxo.token?.nft?.capability === 'minting'
  );
  if(!daoMintingUtxo) { throw new Error('DAO minting utxo not found'); }

  // Create an 'REPLACE' type ProposalNFT with the vote amount
  const prevProposalScriptHash = hexToBin(contractALockingBytecode.slice(4, -2));
  const threadCount = intToBytesToHex({value: 1, length: 2});

  const newProposalScriptHash = hexToBin(contractNewLockingBytecode.slice(4, -2));

  const proposalId = intToBytesToHex({value: 0, length: 4});

  const proposalCommitment = proposalId + threadCount + binToHex(newProposalScriptHash);
  const authThreadCommitment = proposalId + threadCount + binToHex(prevProposalScriptHash);

  // Proposal NFT
  provider.addUtxo(DAOControllerContract.address, {
    token: {
    ...randomNFT({
      category: daoCategory,
      amount: BigInt(2),
      nft: {
          commitment: proposalCommitment,
          capability: 'mutable'
        }
      })
    },
    ...randomUtxo()
  });

  // Time Proposal NFT
  provider.addUtxo(DAOControllerContract.address, {
    token: {
    ...randomNFT({
      category: daoCategory,
      nft: {
          commitment: proposalId + binToHex(aliceAddressLockingBytecode),
          capability: 'none'
        }
      })
    },
    ...randomUtxo()
  });

  // Existing authorizedThreadNFT in Project
  provider.addUtxo(ProjectCoordinatorContract.address, {
    token: {
    ...randomNFT({
      category: projectCategory,
      nft: {
          commitment: authThreadCommitment,
          capability: 'none'
        }
      })
    },
    ...randomUtxo()
  });
}