const { EmbedBuilder } = require("discord.js");
const User = require("../../model/user.js");
const functions = require("../../structs/functions.js");

module.exports = {
    commandInfo: {
        name: "exchange-code",
        description: "Generates an exchange code for login. (One time use and expires after 5 mins if unused)."
    },
    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const user = await User.findOne({ discordId: interaction.user.id }).lean();
        if (!user) {
            return interaction.editReply({ content: "You do not have a registered account!", ephemeral: true });
        }

        const exchange_code = functions.MakeID().replace(/-/ig, "");

        global.exchangeCodes.push({
            accountId: user.accountId,
            exchange_code: exchange_code,
            creatingClientId: ""
        });

        setTimeout(() => {
            const index = global.exchangeCodes.findIndex(i => i.exchange_code === exchange_code);
            if (index !== -1) global.exchangeCodes.splice(index, 1);
        }, 300000); // 5 minutes

        const embed = new EmbedBuilder()
            .setColor("#00FF00") // Green color to signify success
            .setTitle("Exchange Code Generated")
            .setThumbnail(interaction.user.avatarURL())
            .addFields(
                { name: "Exchange Code", value: `\`${exchange_code}\``, inline: true },
                { name: "Valid For", value: "5 minutes", inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setTimestamp();

        interaction.editReply({ content: "Successfully generated an exchange code.", embeds: [embed], ephemeral: true });
    }
}
