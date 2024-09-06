const { EmbedBuilder } = require("discord.js");
const User = require("../../model/user.js");

module.exports = {
    commandInfo: {
        name: "details",
        description: "Retrieves your account info."
    },
    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const user = await User.findOne({ discordId: interaction.user.id }).lean();
        if (!user) {
            return interaction.editReply({ content: "You do not have a registered account!", ephemeral: true });
        }

        let onlineStatus = global.Clients.some(i => i.accountId == user.accountId);

        const embed = new EmbedBuilder()
            .setColor("#3498db") // A nice blue color
            .setTitle("Account Details")
            .setThumbnail(interaction.user.avatarURL())
            .addFields(
                { name: "Created", value: new Date(user.created).toLocaleDateString(), inline: true },
                { name: "Online Status", value: onlineStatus ? "🟢 Yes" : "🔴 No", inline: true },
                { name: "Banned", value: user.banned ? "🔴 Yes" : "🟢 No", inline: true },
                { name: "Account ID", value: `\`${user.accountId}\``, inline: false },
                { name: "Username", value: user.username, inline: true },
                { name: "Email", value: `||${user.email}||`, inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setTimestamp();

        interaction.editReply({ embeds: [embed], ephemeral: true });
    }
}
