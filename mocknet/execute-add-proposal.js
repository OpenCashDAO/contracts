import { randomUtxo, TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  ExecuteAddProposalContract,
  provider,
} from './setup.js';
import { binToHex, cashAddressToLockingBytecode } from '@bitauth/libauth';
export const main = async () => {

  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos[0];
  const executeAddProposalUtxos = await provider.getUtxos(ExecuteAddProposalContract.address);
  const executeAddProposalUtxo = executeAddProposalUtxos[0];

  const daoControllerLockingBytecode = binToHex(cashAddressToLockingBytecode(DAOControllerContract.address).bytecode);
  const executeAddProposalLockingBytecode = binToHex(cashAddressToLockingBytecode(ExecuteAddProposalContract.address).bytecode);


  // nft commitment should have execute proposal's locking bytecode
  console.log('authorizedThreadUtxo: ', authorizedThreadUtxo)
  console.log('executeAddProposalUtxo: ', executeAddProposalUtxo)
  console.log('daoControllerLockingBytecode: ', daoControllerLockingBytecode)
  console.log('executeAddProposalLockingBytecode: ', executeAddProposalLockingBytecode)

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(executeAddProposalUtxo, ExecuteAddProposalContract.unlock.test())
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
    .addOutput({ to: ExecuteAddProposalContract.address, amount: 800n })
    .send()
    // .bitauthUri()

  console.log(tx)
}