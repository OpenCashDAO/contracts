import { TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  ExecuteProposalContract,
  provider,
  daoCategory,
  executeProposalContractLockingBytecode,
  projectCategory,
  aliceAddress,
  aliceTemplate,
  ProjectCoordinatorContract
} from '../../setup/index.js';
import { intToBytesToHex, hexToInt } from '../../utils.js';

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
    utxo.token?.amount > BigInt(0)
  );
  if(!voteProposalUtxo) { throw new Error('Vote proposal utxo not found'); }

  const timeProposalUtxo = contractUtxos.find(utxo => 
    utxo.token?.category === daoCategory &&
    utxo.token?.nft?.capability === 'none' &&
    utxo.token?.nft?.commitment.length === 29 * 2 &&
    utxo.token?.nft?.commitment.slice(0, 8) === voteProposalUtxo.token.nft.commitment.slice(0, 8)
  );
  if(!timeProposalUtxo) { throw new Error('Time proposal utxo not found'); }

  const aliceUtxos = await provider.getUtxos(aliceAddress);
  const aliceUtxo = aliceUtxos.find(utxo => utxo.satoshis > 10000n);
  if(!aliceUtxo) { throw new Error('Alice utxo not found'); }

  const proposalId = voteProposalUtxo.token.nft.commitment.slice(0, 8);
  const threadLeft = voteProposalUtxo.token.nft.commitment.slice(8, 12);
  const threadCount = voteProposalUtxo.token.nft.commitment.slice(12, 16);
  const proposalScriptHash = voteProposalUtxo.token.nft.commitment.slice(16, 80);

  const newThreadCount = intToBytesToHex({value: hexToInt(threadLeft) - 1, length: 2});

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(executeUtxo, ExecuteProposalContract.unlock.execute())
    .addInput(voteProposalUtxo, DAOControllerContract.unlock.call())
    .addInput(timeProposalUtxo, DAOControllerContract.unlock.call())
    .addInput(aliceUtxo, aliceTemplate.unlockP2PKH())
    .addInput(projectMintingUtxo, DAOControllerContract.unlock.call())
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
      amount: voteProposalUtxo.satoshis,
      token: {
        category: voteProposalUtxo.token.category,
        amount: BigInt(0),
        nft: {
          commitment: proposalId + newThreadCount + threadCount + proposalScriptHash,
          capability: voteProposalUtxo?.token?.nft?.capability
        }
      },
    })
    .addOutput({
      to: DAOControllerContract.tokenAddress,
      amount: timeProposalUtxo.satoshis,
      token: {
        category: timeProposalUtxo.token.category,
        amount: timeProposalUtxo?.token?.amount + voteProposalUtxo?.token?.amount,
        nft: {
          commitment: timeProposalUtxo?.token?.nft?.commitment,
          capability: timeProposalUtxo?.token?.nft?.capability
        }
      },
    })
    .addOutput({
      to: aliceAddress,
      amount: aliceUtxo.satoshis - BigInt(5000n),
    })
    .addOutput({
      to: DAOControllerContract.tokenAddress,
      amount: projectMintingUtxo.satoshis,
      token: {
        category: projectMintingUtxo.token.category,
        amount: projectMintingUtxo?.token?.amount,
        nft: {
          commitment: projectMintingUtxo?.token?.nft?.commitment,
          capability: projectMintingUtxo?.token?.nft?.capability
        }
      },
    })
    .addOutput({
      to: ProjectCoordinatorContract.tokenAddress,
      amount: BigInt(1000n),
      token: {
        category: projectMintingUtxo.token.category,
        amount: BigInt(0),
        nft: {
          commitment: proposalId + threadCount + proposalScriptHash,
          capability: 'none'
        }
      },
    })
    .send()
    // .bitauthUri()

  console.log(tx)
}