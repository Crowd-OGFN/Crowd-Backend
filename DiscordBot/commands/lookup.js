const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const User = require("../../model/user.js");

module.exports = {
    commandInfo: {
        name: "lookup",
        description: "Retrieves someone's account info.",
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

        const username = interaction.options.getString("username").toLowerCase();
        const user = await User.findOne({ username_lower: username }).lean();

        if (!user) {
            return interaction.editReply({ content: "The account username you entered does not exist.", ephemeral: true });
        }

        const onlineStatus = global.Clients.some(i => i.accountId === user.accountId);

        const embed = new EmbedBuilder()
            .setColor("#1E90FF")
            .setTitle("User Account Information")
            .setThumbnail(interaction.user.avatarURL())
            .addFields(
                { name: "Discord User", value: `<@${user.discordId}>`, inline: true },
                { name: "Created On", value: new Date(user.created).toLocaleDateString(), inline: true },
                { name: "Online Status", value: onlineStatus ? "🟢 Yes" : "🔴 No", inline: true },
                { name: "Banned", value: user.banned ? "🔴 Yes" : "🟢 No", inline: true },
                { name: "Username", value: user.username, inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setTimestamp();

        interaction.editReply({ embeds: [embed], ephemeral: true });
    }
}
