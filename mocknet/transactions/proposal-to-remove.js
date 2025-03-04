import { randomUtxo, TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  ProposalToRemoveContract,
  provider,
} from '../setup.js';
import { binToHex, cashAddressToLockingBytecode } from '@bitauth/libauth';

export const main = async () => {
  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos[0];
  const proposalToRemoveUtxos = await provider.getUtxos(ProposalToRemoveContract.address);
  const proposalToRemoveUtxo = proposalToRemoveUtxos[0];

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(proposalToRemoveUtxo, ProposalToRemoveContract.unlock.test())
    .addOutput({ to: ProposalToRemoveContract.address, amount: 800n })
    .send();

  console.log(tx);
} 