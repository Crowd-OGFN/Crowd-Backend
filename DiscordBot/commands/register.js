const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require("discord.js");
const functions = require("../../structs/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("register")
        .setDescription("Register an account on Crowd.")
        .setDefaultMemberPermissions(null),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('accountCreationModal')
            .setTitle('Register an Account on Crowd Backend');

        const emailInput = new TextInputBuilder()
            .setCustomId('emailInput')
            .setLabel("Email")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Enter your desired email address")
            .setRequired(true);

        const usernameInput = new TextInputBuilder()
            .setCustomId('usernameInput')
            .setLabel("Username")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Enter your desired username")
            .setRequired(true);

        const passwordInput = new TextInputBuilder()
            .setCustomId('passwordInput')
            .setLabel("Password")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Enter your desired password")
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(emailInput),
            new ActionRowBuilder().addComponents(usernameInput),
            new ActionRowBuilder().addComponents(passwordInput)
        );

        await interaction.showModal(modal);

        const filter = (i) => i.customId === 'accountCreationModal' && i.user.id === interaction.user.id;
        interaction.awaitModalSubmit({ filter, time: 60000 })
            .then(async modalInteraction => {
                const email = modalInteraction.fields.getTextInputValue('emailInput');
                const username = modalInteraction.fields.getTextInputValue('usernameInput');
                const password = modalInteraction.fields.getTextInputValue('passwordInput');

                const discordId = interaction.user.id;

                await functions.registerUser(discordId, username, email, password).then(resp => {
                    let embed = new EmbedBuilder()
                        .setColor(resp.status >= 400 ? "#ff0000" : "#00ff00")
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                        .setTitle(resp.status >= 400 ? "Account Creation Failed" : "Account Created Successfully")
                        .setDescription(resp.message)
                        .setTimestamp()
                        .setFooter({ text: "Crowd Account Creation", iconURL: interaction.client.user.avatarURL() });

                    modalInteraction.reply({ embeds: [embed], ephemeral: true });
                });
            })
            .catch((err) => {
                console.error(err);
                interaction.followUp({ content: "Account creation process timed out.", ephemeral: true });
            });
    }
};
