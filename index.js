import { main as daoSetup } from './mocknet/setup/dao.js';
import { main as upgradableProjectSetup } from './mocknet/setup/upgradable-project.js';

import { main as proposalToAdd } from './mocknet/transactions/proposals/add.js';
import { main as proposalToRemove } from './mocknet/transactions/proposals/remove.js';
import { main as proposalToReplace } from './mocknet/transactions/proposals/replace.js';

import { main as setupForVote } from './mocknet/setup/vote.js';
import { main as vote } from './mocknet/transactions/vote.js';

import { main as setupForRetractVote } from './mocknet/setup/refactor-vote.js';
import { main as retractVote } from './mocknet/transactions/retract-vote.js';

import { main as addThreads } from './mocknet/transactions/add-threads.js';
import { main as removeThreads } from './mocknet/transactions/remove-threads.js';
import { main as replaceThreads } from './mocknet/transactions/replace-threads.js';
import { main as failProposal } from './mocknet/transactions/fail-proposal.js';


const main = async () => {
  await daoSetup();
  await upgradableProjectSetup();

  // await proposalToAdd();
  // await proposalToRemove();
  // await proposalToReplace();

  // await setupForVote();
  // await vote();

  // await setupForRetractVote();
  // await retractVote();

  await addThreads();
  // await removeThreads();
  // await replaceThreads();
  // await failProposal();
}

main();