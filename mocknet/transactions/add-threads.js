import { randomUtxo, TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  AddThreadsContract,
  provider,
} from '../setup/index.js';

export const main = async () => {

  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos[0];
  const addThreadsUtxos = await provider.getUtxos(AddThreadsContract.address);
  const addThreadsUtxo = addThreadsUtxos[0];

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(addThreadsUtxo, AddThreadsContract.unlock.test())
    .addOutput({
      to: DAOControllerContract.tokenAddress,
      amount: authorizedThreadUtxo.satoshis,
      token: {
        category: authorizedThreadUtxo.token.category,
        amount: authorizedThreadUtxo.token.amount,
        nft: {
          commitment: authorizedThreadUtxo.token.nft.commitment,
          capability: authorizedThreadUtxo.token.nft.capability
        }
      },
    })
    .addOutput({ to: AddThreadsContract.address, amount: addThreadsUtxo.satoshis })
    .send()
    // .bitauthUri()

  console.log(tx)
}