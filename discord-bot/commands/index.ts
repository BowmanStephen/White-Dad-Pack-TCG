/**
 * Command Registry
 *
 * Central registry of all Discord bot commands.
 */

import * as openPackModule from './openPack.js';
import * as bindAccountModule from './bindAccount.js';
import * as collectionModule from './collection.js';
import * as premiumModule from './premium.js';

export const commands = {
  openPack: openPackModule,
  bindAccount: bindAccountModule,
  collection: collectionModule,
  premium: premiumModule,
} as const;
