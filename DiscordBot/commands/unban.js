const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const User = require("../../model/user.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban a user from the backend by their username.")
        .addStringOption(option =>
            option.setName("username")
                .setDescription("Target username.")
                .setRequired(true))
        .setDefaultMemberPermissions(null),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            const noPermEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("Permission Denied")
                .setDescription("You do not have the required **Ban Members** permission to use this command.")
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

        if (!targetUser.banned) {
            const alreadyUnbannedEmbed = new EmbedBuilder()
                .setColor("#00ff00")
                .setTitle("User Already Unbanned")
                .setDescription(`The account **${targetUser.username}** is not currently banned.`)
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.avatarURL()
                })
                .setTimestamp();

            return interaction.editReply({ embeds: [alreadyUnbannedEmbed], ephemeral: true });
        }

        await targetUser.updateOne({ $set: { banned: false } });

        const successEmbed = new EmbedBuilder()
            .setColor("#00ff00")
            .setTitle("User Unbanned")
            .setDescription(`Successfully unbanned **${targetUser.username}**.`)
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.avatarURL()
            })
            .setTimestamp();

        interaction.editReply({ embeds: [successEmbed], ephemeral: true });
    }
};
