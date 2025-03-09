import { TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  VotingContract,
  provider,
  daoCategory,
  aliceAddress,
  aliceTemplate,
  aliceTokenAddress,
  commitmentLengthForProposalType
} from '../setup/index.js';
import { intToBytesToHex } from '../utils.js';


export const main = async () => {
  // variables
  const voteAmount = BigInt(1000);
  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos.find(utxo => 
    utxo.token?.category === daoCategory &&
    utxo.token?.nft?.capability === 'none'
  );
  if (!authorizedThreadUtxo) { throw new Error('Authorized thread utxo not found'); }

  const votingUtxos = await provider.getUtxos(VotingContract.address);
  const votingUtxo = votingUtxos[0];
  if (!votingUtxo) { throw new Error('Vote utxo not found'); }

  const daoMintingUtxo = contractUtxos.find(utxo => 
    utxo.token?.category === daoCategory &&
    utxo.token?.nft?.capability === 'minting'
  );
  if (!daoMintingUtxo) { throw new Error('DAO minting utxo not found'); }

  const proposalUtxo = contractUtxos.find(utxo => 
    utxo.token?.category === daoCategory &&
    utxo.token?.nft?.capability === 'mutable' &&
    utxo.token?.nft?.commitment.length === commitmentLengthForProposalType['ADD']
  );
  if (!proposalUtxo) { throw new Error('Proposal utxo not found'); }

  const aliceUtxos = await provider.getUtxos(aliceAddress);
  const aliceVotingUtxo = aliceUtxos.find(utxo => utxo.token?.amount >= voteAmount);
  if (!aliceVotingUtxo) { throw new Error('Alice voting utxo not found'); }

  const aliceFundingUtxo = aliceUtxos.find(utxo => utxo.satoshis > 5000);
  if (!aliceFundingUtxo) { throw new Error('Alice funding utxo not found'); }

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(votingUtxo, VotingContract.unlock.vote(voteAmount))
    .addInput(daoMintingUtxo, DAOControllerContract.unlock.call())
    .addInput(proposalUtxo, DAOControllerContract.unlock.call())
    .addInput(aliceVotingUtxo, aliceTemplate.unlockP2PKH())
    .addInput(aliceFundingUtxo, aliceTemplate.unlockP2PKH())
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
    .addOutput({ to: VotingContract.address, amount: votingUtxo.satoshis })
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
      amount: aliceVotingUtxo.satoshis - BigInt(2000n),
      token: {
        category: aliceVotingUtxo.token.category,
        amount: aliceVotingUtxo.token.amount - voteAmount
      },
    })
    .addOutput({
      to: aliceAddress,
      amount: aliceFundingUtxo.satoshis - BigInt(2000n),
    })
    .send();

  console.log(tx);
} 