const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const User = require("../../model/user.js");
const functions = require("../../structs/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick someone out of their current session by their username.")
        .addStringOption(option =>
            option.setName("username")
                .setDescription("Target username.")
                .setRequired(true))
        .setDefaultMemberPermissions(null),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            const noPermEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("Permission Denied")
                .setDescription("You do not have the required **Kick Members** permission to use this command.")
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.avatarURL()
                })
                .setTimestamp();

            return interaction.editReply({ embeds: [noPermEmbed], ephemeral: true });
        }

        const username = interaction.options.getString("username").toLowerCase();

        const targetUser = await User.findOne({ username_lower: username });

        if (!targetUser) {
            const notFoundEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("User Not Found")
                .setDescription(`The account username **${username}** does not exist.`)
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.avatarURL()
                })
                .setTimestamp();

            return interaction.editReply({ embeds: [notFoundEmbed], ephemeral: true });
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
                .setTitle("User Kicked")
                .setDescription(`Successfully kicked **${targetUser.username}** from their current session.`)
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
            .setDescription(`There are no current active sessions for **${targetUser.username}**.`)
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.avatarURL()
            })
            .setTimestamp();

        interaction.editReply({ embeds: [noSessionEmbed], ephemeral: true });
    }
};
