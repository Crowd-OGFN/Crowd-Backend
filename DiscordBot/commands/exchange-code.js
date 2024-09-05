const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const User = require("../../model/user.js");
const functions = require("../../structs/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('exchange-code')
        .setDescription('Generates an exchange code for login. (One time use and expires after 5 minutes if unused).')
        .setDefaultMemberPermissions(null),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const user = await User.findOne({ discordId: interaction.user.id }).lean();
        if (!user) {
            return interaction.editReply({ content: "You do not have a registered account!", ephemeral: true });
        }

        let exchangeCode = functions.MakeID().replace(/-/g, "");
        global.exchangeCodes.push({
            accountId: user.accountId,
            exchange_code: exchangeCode,
            creatingClientId: ""
        });

        setTimeout(() => {
            let index = global.exchangeCodes.findIndex(code => code.exchange_code === exchangeCode);
            if (index !== -1) global.exchangeCodes.splice(index, 1);
        }, 300000); // 5 minutes

        let embed = new EmbedBuilder()
            .setColor("#302c34")
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL()
            })
            .addFields({ name: "Exchange Code", value: exchangeCode })
            .setTimestamp();

        interaction.editReply({
            content: "Successfully generated an exchange code.",
            embeds: [embed],
            ephemeral: true
        });
    }
};
