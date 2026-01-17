# DadDeck™ Discord Bot

The official Discord bot for DadDeck™ Trading Card Game. Allows users to open booster packs, view collections, and sync accounts.

## Features

- **/openpack** - Open a booster pack (6 random cards)
- **/collection** - View your collection statistics
- **/bindaccount** - Link your Discord account to your DadDeck™ account
- **/premium** - Admin command to grant premium status

## Cooldown System

- **Free users**: 1 pack per hour
- **Premium users**: No cooldown (unlimited packs)

## Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Copy the bot token
5. Enable these Privileged Gateway Intents:
   - Message Content Intent
   - Server Members Intent

### 2. Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp discord-bot/.env.example discord-bot/.env
   ```

2. Fill in your values:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   DISCORD_CLIENT_ID=your_client_id_here
   DISCORD_GUILD_ID=your_guild_id_here  # Optional, for dev
   ```

### 3. Invite Bot to Server

1. Go to OAuth2 > URL Generator
2. Select scopes: `bot` and `applications.commands`
3. Select bot permissions:
   - Send Messages
   - Embed Links
   - Use Slash Commands
   - Administrator (for /premium command)
4. Copy the generated URL and open it in your browser

### 4. Run the Bot

Development mode (with hot reload):
```bash
bun run discord-bot:dev
```

Production mode:
```bash
bun run discord-bot
```

## Commands

### /openpack
Open a DadDeck™ booster pack containing 6 random cards.

**Options:**
- `reveal` (boolean) - Show cards immediately (default: true)

**Cooldown:** 1 hour for free users, none for premium users.

### /collection
View your collection statistics including total packs opened and account binding status.

### /bindaccount
Link your Discord account to your DadDeck™ web account for cross-platform collection tracking.

**Options:**
- `account_id` (string) - Your DadDeck™ account ID (optional)

### /premium
**Admin only** - Grant or revoke premium status for users. Premium users bypass pack opening cooldowns.

**Options:**
- `user` (user) - The user to modify
- `status` (boolean) - Premium status (true = grant, false = revoke)

## Architecture

```
discord-bot/
├── index.ts           # Main bot entry point
├── types/             # TypeScript types
├── utils/             # Helper functions
│   ├── database.ts    # User database (JSON file)
│   ├── cooldowns.ts   # Cooldown management
│   └── packs.ts       # Pack generation integration
├── commands/          # Slash command implementations
│   ├── openPack.ts
│   ├── bindAccount.ts
│   ├── collection.ts
│   └── premium.ts
└── data/              # User database (generated at runtime)
```

## Data Storage

The bot uses a simple JSON file database located at `discord-bot/data/users.json`. This stores:
- Discord user IDs
- Account bindings
- Premium status
- Pack opening history
- Cooldown timestamps

## Integration with Main Game

The bot imports the existing pack generation system:
- `src/lib/pack/generator.ts` - Pack generation logic
- `src/lib/cards/database.ts` - Card database

This ensures consistency between the web game and Discord bot.

## Development

### Adding New Commands

1. Create a new command file in `discord-bot/commands/`:
   ```typescript
   import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

   export const data = new SlashCommandBuilder()
     .setName('commandname')
     .setDescription('Description');

   export async function execute(interaction: ChatInputCommandInteraction) {
     // Command logic
   }
   ```

2. Register the command in `discord-bot/commands/index.ts`:
   ```typescript
   import { newCommand } from './newCommand';

   export const commands = {
     // ... existing commands
     newCommand,
   };
   ```

### Testing Commands

During development, set `DISCORD_GUILD_ID` in your `.env` file. This will register commands instantly for your test server instead of waiting for global propagation (up to 1 hour).

## License

MIT License - Part of the DadDeck™ TCG project.
