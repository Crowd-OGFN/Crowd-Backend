const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const User = require("../../model/user.js");
const functions = require("../../structs/functions.js");
require('dotenv').config();

module.exports = {
    commandInfo: {
        name: "kick",
        description: "Kick someone out of their current session by their username.",
        options: [
            {
                name: "username",
                description: "Target username.",
                required: true,
                type: ApplicationCommandOptionType.String
            }
        ]
    },
    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const moderators = process.env.MODERATORS.split(',');
        if (!moderators.includes(interaction.user.id)) {
            return interaction.editReply({ content: "You do not have moderator permissions.", ephemeral: true });
        }

        const username = interaction.options.getString("username").toLowerCase();
        const targetUser = await User.findOne({ username_lower: username });

        if (!targetUser) {
            return interaction.editReply({ content: "The account username you entered does not exist.", ephemeral: true });
        }

        let sessionActive = false;
        let refreshTokenIndex = global.refreshTokens.findIndex(i => i.accountId === targetUser.accountId);
        if (refreshTokenIndex !== -1) {
            global.refreshTokens.splice(refreshTokenIndex, 1);
            sessionActive = true;
        }

        let accessTokenIndex = global.accessTokens.findIndex(i => i.accountId === targetUser.accountId);
        if (accessTokenIndex !== -1) {
            global.accessTokens.splice(accessTokenIndex, 1);

            let xmppClient = global.Clients.find(client => client.accountId === targetUser.accountId);
            if (xmppClient) xmppClient.client.close();

            sessionActive = true;
        }

        if (sessionActive) {
            functions.UpdateTokens();
            const embed = new EmbedBuilder()
                .setColor("#FF4500")
                .setTitle("User Session Terminated")
                .setDescription(`Successfully kicked **${targetUser.username}** out of their current session.`)
                .setTimestamp()
                .setFooter({ text: `Action performed by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() });

            return interaction.editReply({ embeds: [embed], ephemeral: true });
        } else {
            return interaction.editReply({ content: `There are no current active sessions by **${targetUser.username}**`, ephemeral: true });
        }
    }
}
