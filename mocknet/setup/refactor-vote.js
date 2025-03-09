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
  aliceTokenAddress,
  contractNewLockingBytecode
} from './index.js';

const proposalVoteAmount = BigInt(50000);
const aliceVoteAmount = BigInt(1000);

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

  provider.addUtxo(DAOControllerContract.address, {
    token: {
    ...randomNFT({
      category: daoCategory,
      amount: proposalVoteAmount,
      nft: {
          commitment: proposalCommitment,
          capability: 'mutable'
        }
      })
    },
    ...randomUtxo()
  });

  // Create a VoteNFT for alice
  provider.addUtxo(aliceTokenAddress, {
    token: {
    ...randomNFT({
      category: daoCategory,
      nft: {
          commitment: proposalId + intToBytesToHex({value: Number(aliceVoteAmount), length: 8}),
          capability: 'none'
        }
      })
    },
    ...randomUtxo()
  });
}