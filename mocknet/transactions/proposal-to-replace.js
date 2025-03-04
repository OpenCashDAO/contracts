import { randomUtxo, TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  ProposalToReplaceContract,
  provider,
} from '../setup.js';
import { binToHex, cashAddressToLockingBytecode } from '@bitauth/libauth';

export const main = async () => {
  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos[0];
  const proposalToReplaceUtxos = await provider.getUtxos(ProposalToReplaceContract.address);
  const proposalToReplaceUtxo = proposalToReplaceUtxos[0];

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(proposalToReplaceUtxo, ProposalToReplaceContract.unlock.test())
    .addOutput({ to: ProposalToReplaceContract.address, amount: 800n })
    .send();

  console.log(tx);
} 