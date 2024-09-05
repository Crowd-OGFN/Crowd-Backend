const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const User = require("../../model/user.js");
const functions = require("../../structs/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sign-out-of-all-sessions')
        .setDescription('Signs you out of all active sessions.')
        .setDefaultMemberPermissions(null),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = await User.findOne({ discordId: interaction.user.id }).lean();
        if (!targetUser) {
            return interaction.editReply({
                content: "You do not have a registered account!",
                ephemeral: true
            });
        }

        let refreshTokenIndex = global.refreshTokens.findIndex(i => i.accountId === targetUser.accountId);
        if (refreshTokenIndex !== -1) global.refreshTokens.splice(refreshTokenIndex, 1);

        let accessTokenIndex = global.accessTokens.findIndex(i => i.accountId === targetUser.accountId);
        if (accessTokenIndex !== -1) {
            global.accessTokens.splice(accessTokenIndex, 1);

            let xmppClient = global.Clients.find(client => client.accountId === targetUser.accountId);
            if (xmppClient) xmppClient.client.close();
        }

        if (accessTokenIndex !== -1 || refreshTokenIndex !== -1) {
            functions.UpdateTokens();

            const successEmbed = new EmbedBuilder()
                .setColor("#00ff00")
                .setTitle("Signed Out of All Sessions")
                .setDescription("You have been successfully signed out of all active sessions.")
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.avatarURL()
                })
                .setTimestamp();

            return interaction.editReply({ embeds: [successEmbed], ephemeral: true });
        }

        const noSessionEmbed = new EmbedBuilder()
            .setColor("#ff0000")
            .setTitle("No Active Sessions")
            .setDescription("You currently have no active sessions to sign out of.")
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.avatarURL()
            })
            .setTimestamp();

        interaction.editReply({ embeds: [noSessionEmbed], ephemeral: true });
    }
};
