require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load environment variables
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!GUILD_ID || !CHANNEL_ID || !BOT_TOKEN || !CLIENT_ID) {
    console.error('One or more required environment variables are missing.');
    process.exit(1);
}

// Create a new REST instance
const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

// Read commands from the ./DiscordBot/commands directory
const commands = [];
const commandsPath = path.join(__dirname, 'DiscordBot', 'commands');

fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')).forEach(file => {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
});

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        // Deploy commands to the specific guild
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands,
        });

        console.log('Successfully reloaded application (/) commands.');

    } catch (error) {
        console.error(error);
    }
})();
