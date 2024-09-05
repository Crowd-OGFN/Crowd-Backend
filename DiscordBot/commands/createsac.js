const { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } = require("discord.js");
const functions = require("../../structs/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createsac')
        .setDescription('Creates a Support-A-Creator Code.')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('The Support-A-Creator Code to create.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('owner-id')
                .setDescription('Owner ID of the Code.')
                .setRequired(true))
        .setDefaultMemberPermissions(null),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return interaction.editReply({
                content: "You need the 'Manage Nicknames' permission to use this command.",
                ephemeral: true,
            });
        }

        const code = interaction.options.getString('code');
        const accountId = interaction.options.getString('owner-id');
        const creator = interaction.user.id;

        await functions.createSAC(code, accountId, creator).then(resp => {
            if (resp.message === undefined) {
                return interaction.editReply({ content: "There was an unknown error!", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor(resp.status >= 400 ? "#ff0000" : "#00ff00")
                .setTitle("Support-A-Creator Code Creation")
                .setDescription(resp.message)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.avatarURL(),
                });

            interaction.editReply({ embeds: [embed], ephemeral: true });
        });
    }
};
