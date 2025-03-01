import { randomUtxo, TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  ExecuteProposalContract,
  provider
} from './setup.js';

export const main = async () => {

  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos[0];
  console.log(authorizedThreadUtxo)
  const executeProposalUtxos = await provider.getUtxos(ExecuteProposalContract.address);
  console.log(executeProposalUtxos[0])

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(executeProposalUtxos[0], ExecuteProposalContract.unlock.test())
    .addOutput({
      to: DAOControllerContract.tokenAddress,
      amount: authorizedThreadUtxo.satoshis,
      token: {
        category: authorizedThreadUtxo.category,
        amount: authorizedThreadUtxo.amount,
        nft: {
          commitment: authorizedThreadUtxo.nft.commitment,
          capability: authorizedThreadUtxo.nft.capability
        }
      },
    })
    .addOutput({ to: ExecuteProposalContract.address, amount: 800n })
    .build()
    // .bitauthUri()
    // .send()

  console.log(tx)
}