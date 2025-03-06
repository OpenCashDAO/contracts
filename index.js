import { main as daoSetup } from './mocknet/setup/dao.js';
import { main as upgradableProjectSetup } from './mocknet/setup/upgradable-project.js';

import { main as proposalToAdd } from './mocknet/transactions/submissions/add.js';
import { main as proposalToRemove } from './mocknet/transactions/submissions/remove.js';
import { main as proposalToReplace } from './mocknet/transactions/submissions/replace.js';

import { main as setupForVote } from './mocknet/setup/vote.js';
import { main as vote } from './mocknet/transactions/vote.js';

import { main as setupForRetractVote } from './mocknet/setup/refactor-vote.js';
import { main as retractVote } from './mocknet/transactions/retract-vote.js';

import { main as setupForAddThreads } from './mocknet/setup/add-threads.js';
import { main as addThreads } from './mocknet/transactions/executions/add-threads.js';

import { main as setupForRemoveThreads } from './mocknet/setup/remove-threads.js';
import { main as removeThreads } from './mocknet/transactions/executions/remove-threads.js';

import { main as setupForReplaceThreads } from './mocknet/setup/replace-threads.js';
import { main as replaceThreads } from './mocknet/transactions/executions/replace-threads.js';

import { main as setupForEndExecution } from './mocknet/setup/end-execution.js';
import { main as endExecutionForAddThread } from './mocknet/transactions/executions/end-add-thread.js';

import { main as failProposal } from './mocknet/transactions/executions/fail-proposal.js';

const main = async () => {
  await daoSetup();
  await upgradableProjectSetup();

  await proposalToAdd();
  await proposalToRemove();
  await proposalToReplace();

  await setupForVote();
  await vote();

  await setupForRetractVote();
  await retractVote();

  await setupForAddThreads();
  await addThreads();

  await setupForRemoveThreads();
  await removeThreads();

  await setupForReplaceThreads();
  await replaceThreads();

  await setupForEndExecution();
  await endExecutionForAddThread();

  await failProposal();
}

main();