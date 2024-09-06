const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const User = require("../../model/user.js");
require('dotenv').config();

module.exports = {
    commandInfo: {
        name: "unban",
        description: "Unban a user from the backend by their username.",
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

        // Check if the user has moderator permissions
        const moderators = process.env.MODERATORS.split(',');
        if (!moderators.includes(interaction.user.id)) {
            return interaction.editReply({ content: "You do not have moderator permissions.", ephemeral: true });
        }

        const username = interaction.options.getString("username").toLowerCase();
        const targetUser = await User.findOne({ username_lower: username });

        if (!targetUser) {
            return interaction.editReply({ content: "The account username you entered does not exist.", ephemeral: true });
        } else if (!targetUser.banned) {
            return interaction.editReply({ content: "This account is not banned.", ephemeral: true });
        }

        await targetUser.updateOne({ $set: { banned: false } });

        const embed = new EmbedBuilder()
            .setColor("#32CD32") 
            .setTitle("User Unbanned")
            .setDescription(`Successfully unbanned **${targetUser.username}**.`)
            .setThumbnail(interaction.user.avatarURL())
            .setTimestamp()
            .setFooter({ text: `Action performed by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() });

        interaction.editReply({ embeds: [embed], ephemeral: true });
    }
}
