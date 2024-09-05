const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const User = require("../../model/user.js");
const functions = require("../../structs/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a user from the backend by their username.")
        .addStringOption(option =>
            option.setName("username")
                .setDescription("Target username.")
                .setRequired(true))
        .setDefaultMemberPermissions(null),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.editReply({
                content: "You need the 'Ban Members' permission to use this command.",
                ephemeral: true,
            });
        }

        const username = interaction.options.getString("username").toLowerCase();

        const targetUser = await User.findOne({ username_lower: username });

        if (!targetUser) {
            return interaction.editReply({ content: "The account username you entered does not exist.", ephemeral: true });
        } else if (targetUser.banned) {
            return interaction.editReply({ content: "This account is already banned.", ephemeral: true });
        }

        await targetUser.updateOne({ $set: { banned: true } });

        let refreshTokenIndex = global.refreshTokens.findIndex(i => i.accountId === targetUser.accountId);
        if (refreshTokenIndex !== -1) global.refreshTokens.splice(refreshTokenIndex, 1);

        let accessTokenIndex = global.accessTokens.findIndex(i => i.accountId === targetUser.accountId);
        if (accessTokenIndex !== -1) {
            global.accessTokens.splice(accessTokenIndex, 1);

            let xmppClient = global.Clients.find(client => client.accountId === targetUser.accountId);
            if (xmppClient) xmppClient.client.close();
        }

        if (accessTokenIndex !== -1 || refreshTokenIndex !== -1) functions.UpdateTokens();

        const embed = new EmbedBuilder()
            .setColor("#ff0000")
            .setTitle("User Banned")
            .setDescription(`Successfully banned ${targetUser.username}.`)
            .setTimestamp()
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.avatarURL(),
            });

        interaction.editReply({ embeds: [embed], ephemeral: true });
    }
};
