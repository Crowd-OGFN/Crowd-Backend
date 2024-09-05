const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../model/user.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lookup")
        .setDescription("Retrieves someone's account info.")
        .addStringOption(option =>
            option.setName("username")
                .setDescription("Target username.")
                .setRequired(true))
        .setDefaultMemberPermissions(null),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const usernameInput = interaction.options.getString("username").toLowerCase();

        const user = await User.findOne({ username_lower: usernameInput }).lean();
        if (!user) {
            return interaction.editReply({
                content: "The account username you entered does not exist.",
                ephemeral: true
            });
        }

        const onlineStatus = global.Clients.some(i => i.accountId == user.accountId);

        let embed = new EmbedBuilder()
            .setColor(user.banned ? "#ff0000" : "#00ff00")
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL()
            })
            .setTitle(`Account Info for ${user.username}`)
            .setThumbnail(interaction.user.avatarURL())
            .addFields(
                { name: "Discord", value: `<@${user.discordId}>`, inline: true },
                { name: "Created On", value: `${new Date(user.created).toDateString()}`, inline: true },
                { name: "Online", value: `${onlineStatus ? "Yes" : "No"}`, inline: true },
                { name: "Banned", value: `${user.banned ? "Yes" : "No"}`, inline: true },
                { name: "Username", value: `${user.username}`, inline: true }
            )
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.avatarURL()
            })
            .setTimestamp();

        interaction.editReply({ embeds: [embed], ephemeral: true });
    }
};
