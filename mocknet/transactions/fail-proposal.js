import { randomUtxo, TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  FailProposalContract,
  provider,
} from '../setup/index.js';
import { binToHex, cashAddressToLockingBytecode } from '@bitauth/libauth';

export const main = async () => {
  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos[0];
  const failProposalUtxos = await provider.getUtxos(FailProposalContract.address);
  const failProposalUtxo = failProposalUtxos[0];

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(failProposalUtxo, FailProposalContract.unlock.test())
    .addOutput({ to: FailProposalContract.address, amount: 800n })
    .send();

  console.log(tx);
} 