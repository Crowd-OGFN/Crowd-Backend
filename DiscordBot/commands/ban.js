const { PermissionsBitField, MessageEmbed } = require("discord.js");
const User = require("../../model/user.js");
const functions = require("../../structs/functions.js");
require('dotenv').config();

module.exports = {
    commandInfo: {
        name: "ban",
        description: "Ban a user from the backend by their username.",
        options: [
            {
                name: "username",
                description: "Target username.",
                required: true,
                type: 3 // string
            }
        ]
    },
    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.editReply({ content: "You do not have the required permissions to ban members.", ephemeral: true });
        }


        const { options } = interaction;
        const targetUser = await User.findOne({ username_lower: (options.get("username").value).toLowerCase() });

        if (!targetUser) {
            return interaction.editReply({ content: "The account username you entered does not exist.", ephemeral: true });
        } else if (targetUser.banned) {
            return interaction.editReply({ content: "This account is already banned.", ephemeral: true });
        }

        await targetUser.updateOne({ $set: { banned: true } });

        let refreshToken = global.refreshTokens.findIndex(i => i.accountId == targetUser.accountId);
        if (refreshToken != -1) global.refreshTokens.splice(refreshToken, 1);

        let accessToken = global.accessTokens.findIndex(i => i.accountId == targetUser.accountId);
        if (accessToken != -1) {
            global.accessTokens.splice(accessToken, 1);

            let xmppClient = global.Clients.find(client => client.accountId == targetUser.accountId);
            if (xmppClient) xmppClient.client.close();
        }

        if (accessToken != -1 || refreshToken != -1) functions.UpdateTokens();

        const embed = new MessageEmbed()
            .setColor("#FF0000")
            .setTitle("User Banned")
            .setDescription(`Successfully banned ${targetUser.username}`)
            .setTimestamp()
            .setFooter({ text: `Banned by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() });

        interaction.editReply({ embeds: [embed], ephemeral: true });
    }
}
