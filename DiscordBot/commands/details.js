const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const User = require("../../model/user.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('details')
        .setDescription('Retrieves your account info.')
        .setDefaultMemberPermissions(null),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const user = await User.findOne({ discordId: interaction.user.id }).lean();
        if (!user) {
            return interaction.editReply({ content: "You do not have a registered account!", ephemeral: true });
        }

        let onlineStatus = global.Clients.some(client => client.accountId === user.accountId);

        const embed = new EmbedBuilder()
            .setColor("#00aaff")
            .setTitle("Account Details")
            .setThumbnail(interaction.user.avatarURL())
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL(),
            })
            .addFields(
                { name: "Username", value: user.username, inline: true },
                { name: "Account ID", value: user.accountId, inline: true },
                { name: "Created", value: `${new Date(user.created).toDateString()}`, inline: true },
                { name: "Online", value: onlineStatus ? "✅ Yes" : "❌ No", inline: true },
                { name: "Banned", value: user.banned ? "❌ Yes" : "✅ No", inline: true },
                { name: "Email", value: `||${user.email}||`, inline: true }
            )
            .setFooter({
                text: "Account Information",
                iconURL: interaction.guild.iconURL(),
            })
            .setTimestamp();

        interaction.editReply({ embeds: [embed], ephemeral: true });
    }
};
