import { TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  ExecuteProposalContract,
  provider,
  daoCategory,
  executeProposalContractLockingBytecode,
  projectCategory,
  aliceAddress,
  aliceTemplate
} from '../../setup/index.js';
import { lockingBytecodeToCashAddress, hexToBin } from '@bitauth/libauth';

export const main = async () => {
  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos.find(utxo => 
    utxo.token?.category === daoCategory &&
    utxo.token?.nft?.capability === 'none' &&
    utxo.token?.nft?.commitment === executeProposalContractLockingBytecode
  );
  if(!authorizedThreadUtxo) { throw new Error('Authorized thread utxo not found'); }

  const executeUtxos = await provider.getUtxos(ExecuteProposalContract.address);
  const executeUtxo = executeUtxos[0];
  if(!executeUtxo) { throw new Error('Execute utxo not found'); }

  const projectMintingUtxo = contractUtxos.find(utxo => 
    utxo.token?.category === projectCategory &&
    utxo.token?.nft?.capability === 'minting'
  );
  if(!projectMintingUtxo) { throw new Error('Project minting utxo not found'); }

  const voteProposalUtxo = contractUtxos.find(utxo => 
    utxo.token?.category === daoCategory &&
    utxo.token?.nft?.capability === 'mutable' &&
    utxo.token?.nft?.commitment.length === 40 * 2 && 
    utxo.token?.nft?.commitment.slice(8, 12) === '0000'
  );
  if(!voteProposalUtxo) { throw new Error('Vote proposal utxo not found'); }

  const timeProposalUtxo = contractUtxos.find(utxo => 
    utxo.token?.category === daoCategory &&
    utxo.token?.nft?.capability === 'none' &&
    utxo.token?.nft?.commitment.length === 29 * 2 &&
    utxo.token?.nft?.commitment.slice(0, 8) === voteProposalUtxo.token.nft.commitment.slice(0, 8)
  );
  if(!timeProposalUtxo) { throw new Error('Time proposal utxo not found'); }

  const lockingBytecode = timeProposalUtxo.token.nft.commitment.slice(8, timeProposalUtxo.token.nft.commitment.length);
  const creatorCashAddress = lockingBytecodeToCashAddress({ bytecode: hexToBin(lockingBytecode) }).address;

  const aliceUtxos = await provider.getUtxos(aliceAddress);
  const aliceUtxo = aliceUtxos.find(utxo => utxo.satoshis > 10000n);
  if(!aliceUtxo) { throw new Error('Alice utxo not found'); }

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(executeUtxo, ExecuteProposalContract.unlock.completeOrFail())
    .addInput(voteProposalUtxo, DAOControllerContract.unlock.call())
    .addInput(timeProposalUtxo, DAOControllerContract.unlock.call())
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
    .addOutput({ to: ExecuteProposalContract.address, amount: executeUtxo.satoshis })
    .addOutput({
      to: DAOControllerContract.tokenAddress,
      amount: timeProposalUtxo.satoshis,
      token: {
        category: voteProposalUtxo.token.category,
        amount: timeProposalUtxo?.token?.amount,
        nft: {
          commitment: voteProposalUtxo.token.nft.commitment,
          capability: 'none'
        }
      },
    })
    .addOutput({
      to: creatorCashAddress,
      amount: timeProposalUtxo.satoshis,
    })
    .addOutput({
      to: aliceAddress,
      amount: aliceUtxo.satoshis - BigInt(5000n),
    })
    .send()
    // .bitauthUri()

  console.log(tx)
}