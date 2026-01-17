/**
 * Discord User Database
 *
 * Simple JSON file-based database for storing Discord user accounts,
 * cooldowns, and premium status.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { DiscordUser, UserDatabase } from '../types/index.js';

const DEFAULT_DB_PATH = './discord-bot/data/users.json';

/**
 * Load user database from JSON file
 */
export async function loadDatabase(dbPath: string = DEFAULT_DB_PATH): Promise<UserDatabase> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(data) as UserDatabase;
    // Convert date strings back to Date objects
    for (const userId in db.users) {
      const user = db.users[userId];
      user.createdAt = new Date(user.createdAt);
      user.updatedAt = new Date(user.updatedAt);
      if (user.lastPackOpenAt) {
        user.lastPackOpenAt = new Date(user.lastPackOpenAt);
      }
      if (user.cooldownUntil) {
        user.cooldownUntil = new Date(user.cooldownUntil);
      }
    }
    return db;
  } catch (error) {
    // File doesn't exist or is invalid, return empty database
    return {
      users: {},
      lastUpdated: new Date(),
    };
  }
}

/**
 * Save user database to JSON file
 */
export async function saveDatabase(db: UserDatabase, dbPath: string = DEFAULT_DB_PATH): Promise<void> {
  // Ensure directory exists
  const dir = path.dirname(dbPath);
  await fs.mkdir(dir, { recursive: true });

  db.lastUpdated = new Date();
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}

/**
 * Get a user by Discord ID
 */
export async function getUser(discordId: string, dbPath?: string): Promise<DiscordUser | null> {
  const db = await loadDatabase(dbPath);
  return db.users[discordId] || null;
}

/**
 * Create a new Discord user
 */
export function createUser(discordId: string, username: string): DiscordUser {
  return {
    discordId,
    username,
    isPremium: false,
    totalPacksOpened: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Save or update a user
 */
export async function saveUser(user: DiscordUser, dbPath?: string): Promise<void> {
  const db = await loadDatabase(dbPath);
  db.users[user.discordId] = user;
  await saveDatabase(db, dbPath);
}

/**
 * Update a user's premium status
 */
export async function setPremiumStatus(discordId: string, isPremium: boolean, dbPath?: string): Promise<void> {
  const db = await loadDatabase(dbPath);
  const user = db.users[discordId];

  if (user) {
    user.isPremium = isPremium;
    user.updatedAt = new Date();
    await saveDatabase(db, dbPath);
  }
}

/**
 * Increment pack open count for a user
 */
export async function incrementPackCount(discordId: string, dbPath?: string): Promise<DiscordUser> {
  const db = await loadDatabase(dbPath);
  let user = db.users[discordId];

  if (!user) {
    throw new Error(`User ${discordId} not found in database`);
  }

  user.totalPacksOpened++;
  user.updatedAt = new Date();

  await saveDatabase(db, dbPath);
  return user;
}

/**
 * Delete a user from database
 */
export async function deleteUser(discordId: string, dbPath?: string): Promise<void> {
  const db = await loadDatabase(dbPath);
  delete db.users[discordId];
  await saveDatabase(db, dbPath);
}
