import { randomUtxo, TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  RetractVoteContract,
  provider,
} from '../setup.js';
import { binToHex, cashAddressToLockingBytecode } from '@bitauth/libauth';

export const main = async () => {
  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos[0];
  const retractVoteUtxos = await provider.getUtxos(RetractVoteContract.address);
  const retractVoteUtxo = retractVoteUtxos[0];

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(retractVoteUtxo, RetractVoteContract.unlock.test())
    .addOutput({ to: RetractVoteContract.address, amount: 800n })
    .send();

  console.log(tx);
} 