import { TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  RetractVoteContract,
  provider,
  daoCategory,
  aliceAddress,
  aliceTemplate,
  aliceTokenAddress
} from '../setup.js';
import { intToBytesToHex, getProposalUtxo } from '../utils.js';


export const main = async () => {
  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos.find(utxo => 
    utxo.token?.category === daoCategory &&
    utxo.token?.nft?.capability === 'none'
  );
  if (!authorizedThreadUtxo) { throw new Error('Authorized thread utxo not found'); }

  const retractVoteUtxos = await provider.getUtxos(RetractVoteContract.address);
  const retractVoteUtxo = retractVoteUtxos[0];
  if (!retractVoteUtxo) { throw new Error('Vote utxo not found'); }

  const daoMintingUtxo = contractUtxos.find(utxo => 
    utxo.token?.category === daoCategory &&
    utxo.token?.nft?.capability === 'minting'
  );
  if (!daoMintingUtxo) { throw new Error('DAO minting utxo not found'); }

  const proposalUtxo = getProposalUtxo({ contractUtxos, proposalType: 'ADD' })

  const aliceUtxos = await provider.getUtxos(aliceAddress);
  const aliceUtxo = aliceUtxos.find(utxo => utxo.satoshis >= 10000);
  if (!aliceUtxo) { throw new Error('Alice utxo not found'); }

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(retractVoteUtxo, RetractVoteContract.unlock.call())
    .addInput(daoMintingUtxo, DAOControllerContract.unlock.call())
    .addInput(proposalUtxo, DAOControllerContract.unlock.call())
    .addInput(aliceUtxo, aliceTemplate.unlockP2PKH())
    .addOutput({
      to: DAOControllerContract.tokenAddress,
      amount: authorizedThreadUtxo.satoshis,
      token: {
        category: authorizedThreadUtxo.token.category,
        amount: authorizedThreadUtxo.token.amount,
        nft: {
          commitment: authorizedThreadUtxo.token.nft.commitment,
          capability: authorizedThreadUtxo.token.nft.capability
        }
      },
    })
    .addOutput({ to: VoteContract.address, amount: retractVoteUtxo.satoshis })
    .addOutput({
      to: DAOControllerContract.tokenAddress,
      amount: daoMintingUtxo.satoshis,
      token: {
        category: daoMintingUtxo.token.category,
        amount: daoMintingUtxo.token.amount,
        nft: {
          commitment: daoMintingUtxo.token.nft.commitment,
          capability: daoMintingUtxo.token.nft.capability
        }
      },
    })
    .addOutput({
      to: DAOControllerContract.tokenAddress,
      amount: proposalUtxo.satoshis,
      token: {
        category: proposalUtxo.token.category,
        amount: proposalUtxo.token.amount + voteAmount,
        nft: {
          commitment: proposalUtxo.token.nft.commitment,
          capability: proposalUtxo.token.nft.capability
        }
      },
    })
    .addOutput({
      to: aliceTokenAddress,
      amount: BigInt(1000),
      token: {
        category: proposalUtxo.token.category,
        amount: proposalUtxo.token.amount,
        nft: {
          commitment: proposalUtxo.token.nft.commitment.slice(0, 8) + intToBytesToHex({value: Number(voteAmount), length: 8}),
          capability: 'none'
        }
      },
    })
    .addOutput({
      to: aliceTokenAddress,
      amount: aliceUtxo.satoshis - BigInt(2000n),
      token: {
        category: aliceUtxo.token.category,
        amount: aliceUtxo.token.amount - voteAmount
      },
    })
    .send();

  console.log(tx);
} 