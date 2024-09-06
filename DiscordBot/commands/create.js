const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const functions = require("../../structs/functions.js");

module.exports = {
    commandInfo: {
        name: "create",
        description: "Creates an account on Crowd."
    },
    execute: async (interaction) => {
        const modal = new ModalBuilder()
            .setCustomId('createAccountModal')
            .setTitle('Create Account on Crowd');

        const emailInput = new TextInputBuilder()
            .setCustomId('emailInput')
            .setLabel("Your Email")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const usernameInput = new TextInputBuilder()
            .setCustomId('usernameInput')
            .setLabel("Your Username")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const passwordInput = new TextInputBuilder()
            .setCustomId('passwordInput')
            .setLabel("Your Password")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const emailRow = new ActionRowBuilder().addComponents(emailInput);
        const usernameRow = new ActionRowBuilder().addComponents(usernameInput);
        const passwordRow = new ActionRowBuilder().addComponents(passwordInput);

        modal.addComponents(emailRow, usernameRow, passwordRow);

        await interaction.showModal(modal);
    },

    handleModal: async (interaction) => {
        if (interaction.customId !== 'createAccountModal') return;

        const email = interaction.fields.getTextInputValue('emailInput');
        const username = interaction.fields.getTextInputValue('usernameInput');
        const password = interaction.fields.getTextInputValue('passwordInput');

        const discordId = interaction.user.id;

        await functions.registerUser(discordId, username, email, password).then(async (resp) => {
            const embed = new EmbedBuilder()
                .setColor(resp.status >= 400 ? "#FF0000" : "#00FF00")
                .setTitle(resp.status >= 400 ? "Account Creation Failed" : "Account Created Successfully")
                .setDescription(resp.message)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTimestamp()
                .setFooter({ text: "Crowd Account Creation", iconURL: interaction.guild.iconURL() });

            await interaction.reply({ content: resp.status >= 400 ? undefined : "You successfully created an account!", embeds: [embed], ephemeral: true });
        }).catch(error => {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("Error")
                .setDescription("An error occurred while creating the account.")
                .setTimestamp()
                .setFooter({ text: "Crowd Account Creation", iconURL: interaction.guild.iconURL() });
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        });
    }
}
