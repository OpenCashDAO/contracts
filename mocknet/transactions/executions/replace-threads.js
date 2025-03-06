import { TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  ExecuteProposalContract,
  provider,
} from '../../setup/index.js';

export const main = async () => {
  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos[0];
  const executeProposalUtxos = await provider.getUtxos(ExecuteProposalContract.address);
  const executeProposalUtxo = executeProposalUtxos[0];

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(executeProposalUtxo, ExecuteProposalContract.unlock.test())
    .addOutput({ to: ExecuteProposalContract.address, amount: 800n })
    .send();

  console.log(tx);
} 