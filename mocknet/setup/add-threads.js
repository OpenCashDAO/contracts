import {
  randomUtxo,
  randomNFT
} from 'cashscript';
import { hexToBin, binToHex } from '@bitauth/libauth';
import { intToBytesToHex, hexToInt } from '../utils.js';
import {
  provider,
  DAOControllerContract,
  daoCategory,
  contractNewLockingBytecode,
  aliceAddressLockingBytecode
} from './index.js';


export const main = async () => {
  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const daoMintingUtxo = contractUtxos.find(utxo => 
    utxo.token?.category === daoCategory &&
    utxo.token?.nft?.capability === 'minting'
  );
  if(!daoMintingUtxo) { throw new Error('DAO minting utxo not found'); }

  // Create an 'ADD' type ProposalNFT with the vote amount
  const proposalScriptHash = hexToBin(contractNewLockingBytecode.slice(4, -2));
  const threadCount = intToBytesToHex({value: 2, length: 2});

  const proposalId = intToBytesToHex({value: hexToInt(daoMintingUtxo.token.nft.commitment) + 1, length: 4});
  const proposalCommitment = proposalId + threadCount + threadCount + binToHex(proposalScriptHash);

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
}