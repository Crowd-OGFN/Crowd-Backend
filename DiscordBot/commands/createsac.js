const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");
const functions = require("../../structs/functions.js");
require("dotenv").config(); // Load environment variables from .env file

module.exports = {
    commandInfo: {
        name: "createsac",
        description: "Creates a Support-A-Creator Code.",
        options: [
            {
                name: "code",
                description: "The Code.",
                required: true,
                type: ApplicationCommandOptionType.String // string
            },
            {
                name: "owner-id",
                description: "Owner ID of the Code.",
                required: true,
                type: ApplicationCommandOptionType.String
            },
        ],
    },
    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const moderators = process.env.MODERATORS.split(','); // Convert string to array

        if (!moderators.includes(interaction.user.id)) {
            return interaction.editReply({ content: "You do not have moderator permissions.", ephemeral: true });
        }

        const code = interaction.options.getString("code");
        const accountId = interaction.options.getString("owner-id");
        const creator = interaction.user.id;

        try {
            const resp = await functions.createSAC(code, accountId, creator);

            if (!resp.message) {
                return interaction.editReply({ content: "There was an unknown error!", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor(resp.status >= 400 ? "#FF0000" : "#00FF00")
                .setTitle("Support-A-Creator Code Creation")
                .setDescription(resp.message)
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() });

            return interaction.editReply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: "An error occurred while creating the SAC code.", ephemeral: true });
        }
    }
}
