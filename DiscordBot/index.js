const { Client, GatewayIntentBits, Collection, InteractionType } = require("discord.js");
const { config } = require("dotenv");
const fs = require("fs");
const logger = require('../structs/log');

config(); // Load environment variables from .env file

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.commands = new Collection();

const loadCommands = () => {
    const commandFiles = fs.readdirSync("./DiscordBot/commands").filter(file => file.endsWith(".js"));

    client.commands.clear();

    for (const file of commandFiles) {
        delete require.cache[require.resolve(`./commands/${file}`)];
        const command = require(`./commands/${file}`);
        client.commands.set(command.commandInfo.name, command);
    }
};

loadCommands();

client.once("ready", () => {
    logger.bot(`Bot online and logged in as ${client.user.username}`);

    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);
    let commands;

    if (guild) {
        commands = guild.commands;
    } else {
        commands = client.application.commands;
    }

    client.commands.forEach(command => {
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
