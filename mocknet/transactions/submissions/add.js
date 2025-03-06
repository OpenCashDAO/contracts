import { TransactionBuilder } from 'cashscript';
import { hexToBin, binToHex } from '@bitauth/libauth';
import {
  DAOControllerContract,
  SubmitProposalContract,
  provider,
  daoCategory,
  submitProposalContractLockingBytecode,
  contractNewLockingBytecode,
  aliceAddress,
  aliceTemplate,
  aliceAddressLockingBytecode,
  minCommitmentDeposit
} from '../../setup/index.js';
import { intToBytesToHex, hexToInt } from '../../utils.js';

export const main = async () => {
  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos.find(utxo => 
    utxo.token?.category === daoCategory &&
    utxo.token?.nft?.capability === 'none' &&
    utxo.token?.nft?.commitment === submitProposalContractLockingBytecode
  );
  if(!authorizedThreadUtxo) { throw new Error('Authorized thread utxo not found'); }
  
  const proposalUtxos = await provider.getUtxos(SubmitProposalContract.address);
  const proposalUtxo = proposalUtxos[0];
  if(!proposalUtxo) { throw new Error('Proposal utxo not found'); }

  const daoMintingUtxo = contractUtxos.find(utxo => 
    utxo.token?.category === daoCategory &&
    utxo.token?.nft?.capability === 'minting'
  );
  if(!daoMintingUtxo) { throw new Error('DAO minting utxo not found'); }

  const aliceUtxos = await provider.getUtxos(aliceAddress);
  const aliceUtxo = aliceUtxos.find(utxo => utxo.satoshis > minCommitmentDeposit + 2000n);
  if(!aliceUtxo) { throw new Error('Alice utxo not found'); }

  // Variables
  const proposalScriptHash = hexToBin(contractNewLockingBytecode.slice(4, -2));
  const threadCount = intToBytesToHex({value: 2, length: 2});

  const proposalId = intToBytesToHex({value: hexToInt(daoMintingUtxo.token.nft.commitment) + 1, length: 4});
  const proposalCommitment = proposalId + threadCount + threadCount + binToHex(proposalScriptHash);

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(proposalUtxo, SubmitProposalContract.unlock.add(proposalScriptHash, threadCount))
    .addInput(daoMintingUtxo, DAOControllerContract.unlock.call())
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
    .addOutput({ to: SubmitProposalContract.address, amount: proposalUtxo.satoshis })
    .addOutput({
      to: DAOControllerContract.tokenAddress,
      amount: daoMintingUtxo.satoshis,
      token: {
        category: daoMintingUtxo.token.category,
        amount: daoMintingUtxo.token.amount,
        nft: {
          commitment: proposalId,
          capability: daoMintingUtxo.token.nft.capability
        }
      },
    })
    .addOutput({
      to: DAOControllerContract.tokenAddress,
      amount: BigInt(1000n),
      token: {
        category: daoMintingUtxo.token.category,
        amount: daoMintingUtxo.token.amount,
        nft: {
          commitment: proposalCommitment,
          capability: 'mutable'
        }
      },
    })
    .addOutput({
      to: DAOControllerContract.tokenAddress,
      amount: BigInt(minCommitmentDeposit),
      token: {
        category: daoMintingUtxo.token.category,
        amount: daoMintingUtxo.token.amount,
        nft: {
          commitment: proposalId + binToHex(aliceAddressLockingBytecode),
          capability: 'none'
        }
      },
    })
    .addOpReturnOutput([])
    .addOutput({
      to: aliceAddress,
      amount: aliceUtxo.satoshis - BigInt(minCommitmentDeposit) - BigInt(2000n),
    })
    .send();

  console.log(tx);
  // console.log(tx.hex.length);
} 