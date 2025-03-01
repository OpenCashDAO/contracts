import { randomUtxo, TransactionBuilder } from 'cashscript';
import {
  DAOControllerContract,
  ExecuteProposalContract,
  provider,
} from './setup.js';
import { binToHex, cashAddressToLockingBytecode } from '@bitauth/libauth';
export const main = async () => {

  const contractUtxos = await provider.getUtxos(DAOControllerContract.address);
  const authorizedThreadUtxo = contractUtxos[0];
  const executeProposalUtxos = await provider.getUtxos(ExecuteProposalContract.address);
  const executeProposalUtxo = executeProposalUtxos[0];

  const daoControllerLockingBytecode = binToHex(cashAddressToLockingBytecode(DAOControllerContract.address).bytecode);
  const executeProposalLockingBytecode = binToHex(cashAddressToLockingBytecode(ExecuteProposalContract.address).bytecode);


  // nft commitment should have execute proposal's locking bytecode
  console.log('authorizedThreadUtxo: ', authorizedThreadUtxo)
  console.log('executeProposalUtxo: ', executeProposalUtxo)
  console.log('daoControllerLockingBytecode: ', daoControllerLockingBytecode)
  console.log('executeProposalLockingBytecode: ', executeProposalLockingBytecode)

  const tx = await new TransactionBuilder({ provider })
    .addInput(authorizedThreadUtxo, DAOControllerContract.unlock.call())
    .addInput(executeProposalUtxo, ExecuteProposalContract.unlock.test())
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
    .addOutput({ to: ExecuteProposalContract.address, amount: 800n })
    .send()
    // .bitauthUri()

  console.log(tx)
}