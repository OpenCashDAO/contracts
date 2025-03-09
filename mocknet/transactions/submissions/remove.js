import { TransactionBuilder } from 'cashscript';
import { binToHex } from '@bitauth/libauth';
import {
  DAOControllerContract,
  ProjectCoordinatorContract,
  SubmitProposalContract,
  provider,
  daoCategory,
  projectCategory,
  submitProposalContractLockingBytecode,
  aliceAddress,
  aliceTemplate,
  aliceAddressLockingBytecode,
  minCommitmentDeposit
} from '../../setup/index.js';


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

  const projectUtxos = await provider.getUtxos(ProjectCoordinatorContract.address);
  const projectAuthorizedUtxo = projectUtxos.find(utxo => 
    utxo.token?.category === projectCategory &&
    utxo.token?.nft?.capability === 'none'
  );
  if(!projectAuthorizedUtxo) { throw new Error('Project authorized utxo not found'); }

  const aliceUtxos = await provider.getUtxos(aliceAddress);
  const aliceUtxo = aliceUtxos.find(utxo => utxo.satoshis > minCommitmentDeposit + 2000n);
  if(!aliceUtxo) { throw new Error('Alice utxo not found'); }

  // Variables
  const proposalCommitment = projectAuthorizedUtxo.token.nft.commitment.slice(0, 12);
  const proposalId = projectAuthorizedUtxo.token.nft.commitment.slice(0, 8);

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(proposalUtxo, SubmitProposalContract.unlock.remove())
    .addInput(daoMintingUtxo, DAOControllerContract.unlock.call())
    .addInput(projectAuthorizedUtxo, ProjectCoordinatorContract.unlock.useAuthorizedThread())
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
          commitment: daoMintingUtxo.token.nft.commitment,
          capability: daoMintingUtxo.token.nft.capability
        }
      },
    })
    .addOutput({
      to: ProjectCoordinatorContract.tokenAddress,
      amount: projectAuthorizedUtxo.satoshis,
      token: {
        category: projectAuthorizedUtxo.token.category,
        amount: projectAuthorizedUtxo.token.amount,
        nft: {
          commitment: projectAuthorizedUtxo.token.nft.commitment,
          capability: projectAuthorizedUtxo.token.nft.capability
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
} 