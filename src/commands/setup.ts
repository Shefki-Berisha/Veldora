import { 
    Message, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder, 
    ModalBuilder, 
    ButtonBuilder, 
    ButtonInteraction, 
    ButtonStyle, 
    InteractionCollector, 
    ModalSubmitInteraction, 
    Interaction 
} from "discord.js";
import { mongoClient } from "../index";
import { Command } from "../types";

export const setupCommand: Command = {
    name: "setup",
    description: "Setup verification",
    execute: async (message: Message): Promise<void> => {
        const args = message.content.split(" ");

        const firstArg = args[1];

        const member = message.guild?.members.cache.get(message.author.id);
        if (!member?.permissions.has("Administrator")) {
            await message.reply("Only Administrators can use this command.");
            return;
        }

        const db = mongoClient.db('Veldora');
        const rolesCollection = db.collection('Verification');

        if (firstArg === "--disable") {
            try {
                let query = ({ guildID: message.guildId });
                await rolesCollection.deleteOne({ query });
                await message.reply("Verification has been disabled.");
                return;
            } catch (err) {
                console.log(err);
                await message.reply("There was an error. You can report it in our support server.");
                return;
            }
        }

        let query = ({ guildID: message.guildId });

        if (await rolesCollection.findOne({ guildID: message.guildId })) {
            await message.reply("Verification is already setup. Did you mean `!setup --disable`?");
            return;
        }

        const setupModal = new ModalBuilder()
            .setCustomId('setupModal')
            .setTitle('Setup Verification');

        const setupInput = new TextInputBuilder()
            .setCustomId('setupInput')
            .setLabel('Code, Use `random` for a random string')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const setupRole = new TextInputBuilder()
            .setCustomId("setupRole")
            .setLabel("Enter verification role ID")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const setupUnverified = new TextInputBuilder()
            .setCustomId("setupUnverified")
            .setLabel("Enter unverified role ID")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const setupChannel = new TextInputBuilder()
            .setCustomId("setupChannel")
            .setLabel("Enter verification channel ID")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const setupActionRow1 = new ActionRowBuilder<TextInputBuilder>().addComponents(setupInput);
        const setupActionRow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(setupRole);
        const setupActionRow3 = new ActionRowBuilder<TextInputBuilder>().addComponents(setupUnverified);
        const setupActionRow4 = new ActionRowBuilder<TextInputBuilder>().addComponents(setupChannel);

        setupModal.addComponents(setupActionRow1, setupActionRow2, setupActionRow3, setupActionRow4);

        const button = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(
                new ButtonBuilder()
                    .setCustomId('setupButton')
                    .setLabel('Setup')
                    .setStyle(ButtonStyle.Success)
            );

        const msg = await message.reply({ content: 'Click the button below to setup verification', components: [button] });

        const collector = msg.createMessageComponentCollector({ time: 30000 });

        collector.on("collect", async (i: ButtonInteraction) => {
            if (i.customId === "setupButton") {
                if (i.user.id !== message.author.id) {
                    return await i.reply({ content: "⚠️ You are not the author.", ephemeral: true });
                }

                await i.showModal(setupModal);

                const filter = (interaction: Interaction) => interaction.isModalSubmit() && interaction.customId === 'setupModal' && interaction.user.id === message.author.id;

                i.client.on('interactionCreate', async (interaction: Interaction) => {
                    if (filter(interaction)) {
                        const mI = interaction as ModalSubmitInteraction;

                        const respondCode = mI.fields.getTextInputValue("setupInput");
                        const respondRole = mI.fields.getTextInputValue("setupRole");
                        const verifRole = message.guild?.roles.cache.get(respondRole);
                        const respondUnverified = mI.fields.getTextInputValue("setupUnverified");
                        const unverifRole = message.guild?.roles.cache.get(respondUnverified);
                        const respondChannel = mI.fields.getTextInputValue("setupChannel");
                        const verifChannel = message.guild?.channels.cache.get(respondChannel);

                        if (!verifRole) {
                            return await mI.reply({ content: "⚠️ Invalid verified role ID.", ephemeral: true });
                        }

                        if (!unverifRole) {
                            return await mI.reply({ content: "⚠️ Invalid unverified role ID.", ephemeral: true });
                        }

                        if (!verifChannel) {
                            return await mI.reply({ content: "⚠️ Invalid channel ID.", ephemeral: true });
                        }

                        await rolesCollection.insertOne({
                            guildID: message.guildId,
                            code: respondCode,
                            role: respondRole,
                            unverified: respondUnverified,
                            channel: respondChannel
                        });

                        await mI.reply({ content: `✅ Verification setup complete.\nRun ` + "`!setup --disable` to disable the verification system.", ephemeral: true });
                        await msg.delete().catch(() => {});
                    }
                });
            }
        });
    }
};
