import { randomUtxo, TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  VoteContract,
  provider,
} from '../setup.js';
import { binToHex, cashAddressToLockingBytecode } from '@bitauth/libauth';

export const main = async () => {
  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos[0];
  const voteUtxos = await provider.getUtxos(VoteContract.address);
  const voteUtxo = voteUtxos[0];

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(voteUtxo, VoteContract.unlock.test())
    .addOutput({ to: VoteContract.address, amount: 800n })
    .send();

  console.log(tx);
} 