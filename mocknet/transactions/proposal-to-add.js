import { randomUtxo, TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  ProposalToAddContract,
  provider,
} from '../setup.js';
import { binToHex, cashAddressToLockingBytecode } from '@bitauth/libauth';

export const main = async () => {
  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos[0];
  const proposalToAddUtxos = await provider.getUtxos(ProposalToAddContract.address);
  const proposalToAddUtxo = proposalToAddUtxos[0];

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(proposalToAddUtxo, ProposalToAddContract.unlock.test())
    .addOutput({ to: ProposalToAddContract.address, amount: 800n })
    .send();

  console.log(tx);
} 