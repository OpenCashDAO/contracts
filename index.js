import { main as proposalToAdd } from './mocknet/transactions/proposal-to-add.js';
import { main as proposalToRemove } from './mocknet/transactions/proposal-to-remove.js';
import { main as proposalToReplace } from './mocknet/transactions/proposal-to-replace.js';
import { main as addThreads } from './mocknet/transactions/add-threads.js';
import { main as removeThreads } from './mocknet/transactions/remove-threads.js';
import { main as replaceThreads } from './mocknet/transactions/replace-threads.js';
import { main as failProposal } from './mocknet/transactions/fail-proposal.js';

const main = async () => {
  await proposalToAdd();
  // await proposalToRemove();
  // await proposalToReplace();

  // await addThreads();
  // await removeThreads();
  // await replaceThreads();
  // await failProposal();
}

main();