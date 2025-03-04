import { TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  ReplaceThreadsContract,
  provider,
} from '../setup.js';

export const main = async () => {
  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos[0];
  const replaceThreadsUtxos = await provider.getUtxos(ReplaceThreadsContract.address);
  const replaceThreadsUtxo = replaceThreadsUtxos[0];

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(replaceThreadsUtxo, ReplaceThreadsContract.unlock.test())
    .addOutput({ to: ReplaceThreadsContract.address, amount: 800n })
    .send();

  console.log(tx);
} 