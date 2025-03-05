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
import { hexToInt  } from '../utils.js';


export const main = async () => {
  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos.find(utxo => 
    utxo.token?.category === daoCategory &&
    utxo.token?.nft?.capability === 'none'
  );
  if (!authorizedThreadUtxo) { throw new Error('Authorized thread utxo not found'); }

  const votingUtxos = await provider.getUtxos(VotingContract.address);
  const votingUtxo = votingUtxos[0];
  if (!votingUtxo) { throw new Error('Vote utxo not found'); }

  const proposalUtxo = contractUtxos.find(utxo => 
    utxo.token?.category === daoCategory &&
    utxo.token?.nft?.capability === 'mutable' &&
    utxo.token?.nft?.commitment.length === commitmentLengthForProposalType['ADD'] &&
    utxo.token.amount > 0n
  );
  if (!proposalUtxo) { throw new Error('Proposal utxo not found'); }

  const aliceUtxos = await provider.getUtxos(aliceAddress);
  const aliceUtxo = aliceUtxos.find(utxo => utxo.satoshis >= 10000);
  if (!aliceUtxo) { throw new Error('Alice utxo not found'); }

  const aliceVoteUtxo = aliceUtxos.find(utxo => 
    utxo.token?.category === daoCategory &&
    utxo?.token?.amount === 0n &&
    (utxo.token?.nft?.capability === 'mutable' || utxo.token?.nft?.capability === 'none') &&
    utxo.token?.nft?.commitment.length === 24 // 12 bytes
  );
  if (!aliceVoteUtxo) { throw new Error('Alice vote utxo not found'); }

  const commitment = aliceVoteUtxo.token.nft.commitment;
  const voteAmount = hexToInt(commitment.slice(8));

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(votingUtxo, VotingContract.unlock.retract())
    .addInput(proposalUtxo, DAOControllerContract.unlock.call())
    .addInput(aliceVoteUtxo, aliceTemplate.unlockP2PKH())
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
    .addOutput({ to: VotingContract.address, amount: votingUtxo.satoshis })
    .addOutput({
      to: DAOControllerContract.tokenAddress,
      amount: proposalUtxo.satoshis,
      token: {
        category: proposalUtxo.token.category,
        amount: proposalUtxo.token.amount - BigInt(voteAmount),
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
        amount: BigInt(voteAmount),
      },
    })
    .addOutput({
      to: aliceTokenAddress,
      amount: aliceVoteUtxo.satoshis,
    })
    .send();

  console.log(tx);
}
