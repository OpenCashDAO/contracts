import { TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  RemoveThreadsContract,
  provider,
} from '../setup/index.js';

export const main = async () => {
  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos[0];
  const removeThreadsUtxos = await provider.getUtxos(RemoveThreadsContract.address);
  const removeThreadsUtxo = removeThreadsUtxos[0];

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(removeThreadsUtxo, RemoveThreadsContract.unlock.test())
    .addOutput({ to: RemoveThreadsContract.address, amount: 800n })
    .send();

  console.log(tx);
} 