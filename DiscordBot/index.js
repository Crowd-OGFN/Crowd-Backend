const { Client, GatewayIntentBits, Collection, InteractionType } = require("discord.js");
const { config } = require("dotenv");
const fs = require("fs");

config(); // Load environment variables from .env file

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.commands = new Collection();

const commandFiles = fs.readdirSync("./DiscordBot/commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.commandInfo.name, command);
}

client.once("ready", () => {
    console.log("Discord Bot is online!");

    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);
    let commands;

    if (guild) {
        commands = guild.commands;
    } else {
        commands = client.application.commands;
    }

    commandFiles.forEach(file => {
        const command = require(`./commands/${file}`);
        commands.create(command.commandInfo);
    });
});

client.on("interactionCreate", async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) await command.execute(interaction);
    } else if (interaction.type === InteractionType.ModalSubmit) {
        const command = client.commands.get('create');
        if (command) await command.handleModal(interaction);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
