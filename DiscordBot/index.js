const { Client, GatewayIntentBits, Collection, ActivityType } = require("discord.js");
const { config } = require("dotenv");
config(); // Load environment variables from .env file

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});
const fs = require("fs");

const log = require("../structs/log.js");

client.once("ready", async () => {
    log.bot("Discord Bot is online!");

    // Set the bot's activity status
    client.user.setPresence({
        activities: [{ name: "Crowd", type: ActivityType.Watching }],
        status: "online"
    });


    const commands = client.application.commands;

    // Ensure that all commands are loaded before the bot is ready
    const commandFiles = fs.readdirSync("./DiscordBot/commands").filter(file => file.endsWith(".js"));
    for (const fileName of commandFiles) {
        const command = require(`./commands/${fileName}`);

        // Handle permissions with PermissionsBitField
        const defaultPermissions = command.commandInfo?.default_member_permissions
            ? PermissionsBitField.resolve(command.commandInfo.default_member_permissions)
            : null;

        // Check if commandInfo exists and handle it
        if (command.commandInfo) {
            await commands.create({
                ...command.commandInfo,
                default_member_permissions: defaultPermissions
            });
        } else if (command.data) {
            // Fallback to using command.data if commandInfo is not available
            const defaultPermissionsData = command.data.default_member_permissions
                ? PermissionsBitField.resolve(command.data.default_member_permissions)
                : null;
            await commands.create({
                ...command.data,
                default_member_permissions: defaultPermissionsData
            });
        } else {
            console.error(`Command file ${fileName} is missing commandInfo or data.`);
        }
    }
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const commandPath = `./DiscordBot/commands/${interaction.commandName}.js`;
    if (fs.existsSync(commandPath)) {
        const command = require(commandPath);
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
